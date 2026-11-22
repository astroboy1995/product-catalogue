import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { Product } from './api';

export function Header({ categories = [] }: { categories?: { name: string; slug: string }[] }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    if (clean) navigate(`/search?query=${encodeURIComponent(clean)}`);
  }
  return <header className="site-header">
    <Link className="wordmark" to="/" aria-label="Fieldwork home"><span className="mark">f.</span> fieldwork</Link>
    <nav className="main-nav" aria-label="Main navigation">
      {categories.slice(0, 4).map((category) => <Link key={category.slug} to={`/categories/${category.slug}`}>{category.name}</Link>)}
    </nav>
    <form className="search-form" onSubmit={submit} role="search">
      <span aria-hidden="true">⌕</span><input aria-label="Search products" placeholder="Search the collection" value={query} onChange={(e) => setQuery(e.target.value)} /><button aria-label="Submit search">↗</button>
    </form>
  </header>;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return <Link className={`product-card tone-${index % 4}`} to={`/products/${product.id}`}>
    <div className="product-image"><img src={product.image} alt={product.title} loading="lazy" /><span className="card-arrow" aria-hidden="true">↗</span></div>
    <div className="product-meta"><div><p className="eyebrow">{product.category}</p><h3>{product.title}</h3></div><span className="price">${product.price.toFixed(2)}</span></div>
    <div className="rating"><span>★ {product.rating.rate.toFixed(1)}</span><span>{product.rating.count} reviews</span></div>
  </Link>;
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="empty-state"><span className="empty-icon">⌕</span><h3>No pieces found</h3><p>Try another search or browse a collection.</p><Link className="button button-dark" to="/">Explore the collection</Link></div>;
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>;
}

export function StatePanel({ error }: { error?: string }) {
  return <div className="state-panel" role="status"><span className="loader" aria-hidden="true" />{error ? <><h2>We hit a small snag</h2><p>{error}</p><button className="button button-outline" onClick={() => window.location.reload()}>Try again</button></> : <p>Finding the good stuff…</p>}</div>;
}

export function Footer() {
  return <footer className="site-footer"><Link className="wordmark" to="/"><span className="mark">f.</span> fieldwork</Link><span>Good things, chosen with care.</span><span>© 2025 Fieldwork Studio</span></footer>;
}
