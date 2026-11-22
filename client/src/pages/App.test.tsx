import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import type { Product } from '../api';

const product: Product = {
  id: 7, title: 'A considered object', price: 19.5, description: 'A well-made object for a slower everyday.',
  category: 'Home', image: '/api/image?url=sample', rating: { rate: 4.7, count: 11 },
};
const categoryProducts = { category: 'Home', topRated: [product], additional: [] };
const categories = [{ name: 'Home', slug: 'home' }];
const json = (value: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } }));

function mockApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/categories') return json(categories);
    if (url === '/api/products/featured') return json([product]);
    if (url.startsWith('/api/categories/home/products')) return json(categoryProducts);
    if (url.startsWith('/api/products?query=')) return json({ query: 'linen', count: 1, products: [product] });
    if (url === '/api/products/7') return json(product);
    if (url === '/api/enquiries' && init?.method === 'POST') return json({ message: 'Your enquiry has been sent.' }, 201);
    return json({ error: { message: `Unexpected request ${url}` } }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('catalogue customer journeys', () => {
  it('browses from home to a product and submits an enquiry', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

    await user.click(await screen.findByRole('link', { name: /a considered object/i }));
    expect(await screen.findByText('Ask us about this piece')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^enquire/i }));
    await user.type(screen.getByLabelText('Your name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email address'), 'ada@example.com');
    await user.type(screen.getByLabelText('Your message'), 'Could you tell me more about this piece?');
    await user.click(screen.getByRole('button', { name: /send an enquiry/i }));

    expect(await screen.findByText(/thanks for reaching out/i)).toBeInTheDocument();
    const enquiryCall = fetchMock.mock.calls.find(([url]) => String(url) === '/api/enquiries');
    expect(enquiryCall?.[1]?.body).toBe(JSON.stringify({ productId: 7, name: 'Ada Lovelace', email: 'ada@example.com', message: 'Could you tell me more about this piece?' }));
  });

  it('shows the category favourites from a category route', async () => {
    mockApi();
    render(<MemoryRouter initialEntries={['/categories/home']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /most loved/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /a considered object/i })).toHaveAttribute('href', '/products/7');
  });

  it('shows only search matches on a search route', async () => {
    mockApi();
    render(<MemoryRouter initialEntries={['/search?query=linen']}><App /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /a considered object/i, level: 3 })).toBeInTheDocument();
    expect(screen.queryByText('No pieces found')).not.toBeInTheDocument();
  });
});
