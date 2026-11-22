import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProductCard, ProductGrid } from './components';
import type { Product } from './api';

const product: Product = { id: 7, title: 'A considered object', price: 19.5, description: 'A thing', category: 'Home', image: '/item.jpg', rating: { rate: 4.7, count: 11 } };

describe('product browsing UI', () => {
  it('links a product tile to its detail page and shows price and rating', () => {
    render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /a considered object/i })).toHaveAttribute('href', '/products/7');
    expect(screen.getByText('$19.50')).toBeInTheDocument();
    expect(screen.getByText(/4\.7/)).toBeInTheDocument();
  });
  it('shows a helpful empty state when no products match', () => {
    render(<MemoryRouter><ProductGrid products={[]} /></MemoryRouter>);
    expect(screen.getByText('No pieces found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore the collection' })).toHaveAttribute('href', '/');
  });
});
