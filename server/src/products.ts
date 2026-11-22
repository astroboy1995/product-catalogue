import { Router } from 'express';

export type Product = {
  id: number; title: string; price: number; description: string;
  category: string; image: string; rating: { rate: number; count: number };
};

export interface ProductSource {
  all(): Promise<Product[]>;
  byId(id: number): Promise<Product | undefined>;
}

export class FakeStoreSource implements ProductSource {
  constructor(private readonly baseUrl = process.env.PRODUCTS_API_URL ?? 'https://fakestoreapi.com') {}

  async all(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Product source returned ${response.status}`);
    return response.json() as Promise<Product[]>;
  }

  async byId(id: number): Promise<Product | undefined> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, { signal: AbortSignal.timeout(8000) });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Product source returned ${response.status}`);
    return response.json() as Promise<Product>;
  }
}

export const rankProducts = (products: Product[]) => [...products].sort(
  (a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count || a.id - b.id,
);

export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const productApiUrl = process.env.PRODUCTS_API_URL ?? 'https://fakestoreapi.com';
const allowedImageHost = new URL(productApiUrl).hostname;
const presentProduct = (product: Product): Product => ({
  ...product,
  image: `/api/image?url=${encodeURIComponent(product.image)}`,
});

export function createProductRouter(source: ProductSource) {
  const router = Router();
  const all = async () => source.all();

  router.get('/image', async (req, res, next) => {
    const value = typeof req.query.url === 'string' ? req.query.url : '';
    let imageUrl: URL;
    try { imageUrl = new URL(value); }
    catch { return res.status(400).json({ error: { code: 'INVALID_IMAGE_URL', message: 'Image URL is invalid.' } }); }
    if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== allowedImageHost || imageUrl.port !== '') {
      return res.status(400).json({ error: { code: 'INVALID_IMAGE_URL', message: 'Image source is not allowed.' } });
    }
    try {
      const response = await fetch(imageUrl, { signal: AbortSignal.timeout(8000), redirect: 'manual' });
      const contentType = response.headers.get('content-type') ?? '';
      const declaredLength = Number(response.headers.get('content-length') ?? 0);
      const mediaType = contentType.split(';', 1)[0].trim().toLowerCase();
      const allowedMediaTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
      if (!response.ok || !allowedMediaTypes.has(mediaType) || declaredLength > 5_000_000) {
        return res.status(502).json({ error: { code: 'IMAGE_UNAVAILABLE', message: 'Product image is temporarily unavailable.' } });
      }
      const reader = response.body?.getReader();
      if (!reader) return res.status(502).json({ error: { code: 'IMAGE_UNAVAILABLE', message: 'Product image is empty.' } });
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > 5_000_000) {
          await reader.cancel();
          return res.status(502).json({ error: { code: 'IMAGE_UNAVAILABLE', message: 'Product image is too large.' } });
        }
        chunks.push(value);
      }
      const data = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
      res.setHeader('Content-Type', mediaType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(data);
    } catch (error) { return next(error); }
  });

  router.get('/products/featured', async (_req, res, next) => {
    try { res.json(rankProducts(await all()).slice(0, 5).map(presentProduct)); }
    catch (error) { next(error); }
  });

  router.get('/categories', async (_req, res, next) => {
    try {
      const products = await all();
      res.json([...new Set(products.map((p) => p.category))].sort().map((name) => ({ name, slug: slugify(name) })));
    } catch (error) { next(error); }
  });

  router.get('/categories/:slug/products', async (req, res, next) => {
    try {
      const products = await all();
      const category = products.find((p) => slugify(p.category) === req.params.slug)?.category;
      if (!category) return res.status(404).json({ error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found.' } });
      const ranked = rankProducts(products.filter((p) => p.category === category));
      return res.json({ category, topRated: ranked.slice(0, 5).map(presentProduct), additional: ranked.slice(5).map(presentProduct) });
    } catch (error) { next(error); }
  });

  router.get('/products', async (req, res, next) => {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query) return res.status(400).json({ error: { code: 'QUERY_REQUIRED', message: 'Enter a search term.' } });
    try {
      const term = query.toLocaleLowerCase();
      const matches = (await all()).filter((p) => `${p.title} ${p.description} ${p.category}`.toLocaleLowerCase().includes(term));
      return res.json({ query, count: matches.length, products: matches.map(presentProduct) });
    } catch (error) { return next(error); }
  });

  router.get('/products/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: { code: 'INVALID_PRODUCT_ID', message: 'Product ID must be a positive integer.' } });
    try {
      const product = await source.byId(id);
      if (!product) return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } });
      return res.json(presentProduct(product));
    } catch (error) { return next(error); }
  });

  return router;
}
