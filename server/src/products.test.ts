import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProductRouter, rankProducts, type Product, type ProductSource } from './products';
import { createEnquiryRouter, type EmailGateway } from './enquiries';
import { apiErrorResponse } from './errors';

const sample: Product[] = [
  { id: 1, title: 'Canvas Tote', price: 22, description: 'A sturdy daily bag', category: 'Bags', image: '', rating: { rate: 4.2, count: 12 } },
  { id: 2, title: 'Leather Tote', price: 44, description: 'Soft leather carryall', category: 'Bags', image: '', rating: { rate: 4.8, count: 8 } },
  { id: 3, title: 'Ceramic Cup', price: 18, description: 'Hand finished mug', category: 'Home', image: '', rating: { rate: 4.8, count: 15 } },
  { id: 4, title: 'Desk Lamp', price: 55, description: 'Warm reading light', category: 'Home', image: '', rating: { rate: 3.9, count: 20 } },
  { id: 5, title: 'Silver Ring', price: 35, description: 'Minimal band', category: 'Jewellery', image: '', rating: { rate: 4.5, count: 4 } },
  { id: 6, title: 'Woven Basket', price: 29, description: 'Storage for little things', category: 'Home', image: '', rating: { rate: 4.1, count: 7 } },
  { id: 7, title: 'Linen Cushion', price: 31, description: 'Soft woven cushion', category: 'Home', image: '', rating: { rate: 4.4, count: 6 } },
  { id: 8, title: 'Oak Tray', price: 27, description: 'Wooden serving tray', category: 'Home', image: '', rating: { rate: 3.8, count: 5 } },
  { id: 9, title: 'Wool Throw', price: 68, description: 'Warm woven throw', category: 'Home', image: '', rating: { rate: 3.7, count: 3 } },
];
const source: ProductSource = { all: async () => sample, byId: async (id) => sample.find((p) => p.id === id) };
const app = express(); app.use(express.json()); app.use('/api', createProductRouter(source));
afterEach(() => vi.unstubAllGlobals());

describe('product API', () => {
  it('ranks by rating, then review count, then stable id', () => {
    expect(rankProducts(sample).slice(0, 3).map((p) => p.id)).toEqual([3, 2, 5]);
  });
  it('returns five featured products or fewer when the catalogue is smaller', async () => {
    const response = await request(app).get('/api/products/featured');
    expect(response.status).toBe(200); expect(response.body).toHaveLength(5); expect(response.body[0].id).toBe(3);
    expect(response.body[0].image).toMatch(/^\/api\/image\?url=/);
    expect(response.body[0].image).not.toContain('fakestoreapi.com');
  });
  it('proxies allowlisted raster images and rejects arbitrary image hosts', async () => {
    const denied = await request(app).get(`/api/image?url=${encodeURIComponent('https://127.0.0.1/private')}`);
    expect(denied.status).toBe(400);
    const nonStandardPort = await request(app).get(`/api/image?url=${encodeURIComponent('https://fakestoreapi.com:8443/img/item.png')}`);
    expect(nonStandardPort.status).toBe(400);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Uint8Array([137, 80, 78, 71]), { headers: { 'content-type': 'image/png' } })));
    const proxied = await request(app).get(`/api/image?url=${encodeURIComponent('https://fakestoreapi.com/img/item.png')}`);
    expect(proxied.status).toBe(200); expect(proxied.headers['content-type']).toContain('image/png');
  });
  it('does not follow upstream image redirects or serve SVG', async () => {
    const redirectFetch = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } }));
    vi.stubGlobal('fetch', redirectFetch);
    const redirect = await request(app).get(`/api/image?url=${encodeURIComponent('https://fakestoreapi.com/img/redirect.png')}`);
    expect(redirect.status).toBe(502);
    expect(redirectFetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: 'manual' }));

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } })));
    const vector = await request(app).get(`/api/image?url=${encodeURIComponent('https://fakestoreapi.com/img/vector.svg')}`);
    expect(vector.status).toBe(502);

    const oversizedBody = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(5_000_001)); controller.close(); } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(oversizedBody, { headers: { 'content-type': 'image/png' } })));
    const oversized = await request(app).get(`/api/image?url=${encodeURIComponent('https://fakestoreapi.com/img/oversized.png')}`);
    expect(oversized.status).toBe(502);
  });
  it('splits the category into ranked favourites and remaining items', async () => {
    const response = await request(app).get('/api/categories/home/products');
    expect(response.status).toBe(200); expect(response.body.topRated.map((p: Product) => p.id)).toEqual([3, 7, 6, 4, 8]); expect(response.body.additional.map((p: Product) => p.id)).toEqual([9]);
  });
  it('searches case-insensitively across title, description and category', async () => {
    const response = await request(app).get('/api/products?query=LEATHER');
    expect(response.status).toBe(200); expect(response.body.products.map((p: Product) => p.id)).toEqual([2]);
  });
  it('rejects blank search and unknown product IDs', async () => {
    expect((await request(app).get('/api/products?query=%20')).status).toBe(400);
    expect((await request(app).get('/api/products/99')).status).toBe(404);
    expect((await request(app).get('/api/products/nope')).status).toBe(400);
  });
});

describe('enquiry API', () => {
  const enquiryApp = express(); enquiryApp.use(express.json());
  let delivered = 0;
  const gateway: EmailGateway = { send: async () => { delivered += 1; } };
  enquiryApp.use('/api', createEnquiryRouter(source, gateway));
  it('validates customer details and sends a valid enquiry to sales', async () => {
    delivered = 0;
    const invalid = await request(enquiryApp).post('/api/enquiries').send({ productId: 1, name: 'A', email: 'bad', message: 'short' });
    expect(invalid.status).toBe(400); expect(delivered).toBe(0);
    const valid = await request(enquiryApp).post('/api/enquiries').send({ productId: 1, name: 'Ada Lovelace', email: 'ada@example.com', message: 'Could you tell me more about this bag?' });
    expect(valid.status).toBe(201); expect(delivered).toBe(1);
  });

  it('reports SMTP connection timeouts as email failures, not product failures', async () => {
    const failingApp = express(); failingApp.use(express.json());
    failingApp.use('/api', createEnquiryRouter(source, { send: async () => { throw new Error('Connection timeout'); } }));
    failingApp.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const result = apiErrorResponse(error); res.status(result.status).json(result.body);
    });
    const response = await request(failingApp).post('/api/enquiries').send({ productId: 1, name: 'Ada Lovelace', email: 'ada@example.com', message: 'Could you tell me more about this bag?' });
    expect(response.status).toBe(503); expect(response.body.error.code).toBe('EMAIL_UNAVAILABLE');
  });
});
