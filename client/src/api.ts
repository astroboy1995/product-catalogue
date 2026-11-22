export type Product = {
  id: number; title: string; price: number; description: string; category: string;
  image: string; rating: { rate: number; count: number };
};
export type Category = { name: string; slug: string };
export type CategoryProducts = { category: string; topRated: Product[]; additional: Product[] };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? 'Something went wrong. Please try again.');
  return body as T;
}

export const api = {
  featured: () => request<Product[]>('/products/featured'),
  categories: () => request<Category[]>('/categories'),
  category: (slug: string) => request<CategoryProducts>(`/categories/${encodeURIComponent(slug)}/products`),
  search: (query: string) => request<{ query: string; count: number; products: Product[] }>(`/products?query=${encodeURIComponent(query)}`),
  product: (id: string) => request<Product>(`/products/${encodeURIComponent(id)}`),
  enquire: async (payload: { productId: number; name: string; email: string; message: string }) => {
    const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? 'Your enquiry could not be sent. Please try again.');
    return body as { message: string };
  },
};
