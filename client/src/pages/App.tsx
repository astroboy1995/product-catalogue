import { useEffect, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { api, type Category, type Product } from '../api';
import { Footer, Header, ProductGrid, StatePanel } from '../components';

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { api.categories().then(setCategories).catch(() => setCategories([])); }, []);
  return categories;
}

function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const categories = useCategories();
  useEffect(() => { api.featured().then(setProducts).catch((e) => setError(e.message)); }, []);
  return <>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Thoughtful finds for your everyday</p><h1>Live with<br /><em>intention.</em></h1><p className="hero-desc">Objects that bring a little more meaning to the everyday. Considered design, made to stay.</p><a className="button button-dark" href="#featured">Explore the collection <span>↘</span></a><div className="hero-note"><span className="note-line" /> A considered edit, refreshed often</div></div>
      <div className="hero-art" aria-label="Curated objects and design"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-sun"/><div className="art-vase"><span /></div><div className="art-stem stem-one"/><div className="art-stem stem-two"/><div className="art-label label-top">NO. 04 / OBJECTS</div><div className="art-label label-bottom">MADE FOR SLOWER DAYS</div><div className="art-counter"/></div>
      <span className="vertical-note">DESIGN FOR LIVING · EST. 2025</span>
    </section>
    <section className="category-strip"><span className="eyebrow">Shop by mood</span>{categories.map((c) => <Link key={c.slug} to={`/categories/${c.slug}`}>{c.name}<span>↗</span></Link>)}</section>
    <section className="section featured" id="featured"><div className="section-heading"><div><p className="eyebrow">The edit / 01</p><h2>Pieces worth<br /><em>keeping.</em></h2></div><p className="section-aside">A few of our most-loved finds.<br />Chosen for their lasting appeal.</p></div>{products === null ? <StatePanel error={error || undefined} /> : <ProductGrid products={products} />}</section>
    <section className="quote-band"><span className="quote-mark">“</span><p>Buy less, choose well.<br /><em>Make it last.</em></p><span className="eyebrow">— Vivienne Westwood</span></section>
    <section className="closing-cta"><div><p className="eyebrow">Find your next favourite</p><h2>Good design<br />feels like <em>home.</em></h2></div><Link className="round-link" to={categories[0] ? `/categories/${categories[0].slug}` : '/'}>Explore all<br />collections <span>↗</span></Link></section>
  </>;
}

function CategoryPage() {
  const { slug = '' } = useParams();
  const [data, setData] = useState<{ category: string; topRated: Product[]; additional: Product[] } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { setData(null); api.category(slug).then(setData).catch((e) => setError(e.message)); }, [slug]);
  return <main className="page-content"><Link to="/" className="back-link">← Back to the edit</Link>{data ? <><div className="page-title"><p className="eyebrow">Collection / {data.category}</p><h1>Made for<br /><em>your everyday.</em></h1><p>Considered pieces from our {data.category} collection.</p></div><section className="section"><div className="section-heading compact"><div><p className="eyebrow">The favourites</p><h2>Most <em>loved.</em></h2></div></div><ProductGrid products={data.topRated} /></section>{data.additional.length > 0 && <section className="section"><div className="section-heading compact"><div><p className="eyebrow">More to explore</p><h2>Find your <em>thing.</em></h2></div></div><ProductGrid products={data.additional} /></section>}</> : <StatePanel error={error || undefined} />}</main>;
}

function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('query')?.trim() ?? '';
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { setProducts(null); api.search(query).then((result) => setProducts(result.products)).catch((e) => setError(e.message)); }, [query]);
  return <main className="page-content"><Link to="/" className="back-link">← Back to the edit</Link><div className="page-title"><p className="eyebrow">Search / {query || 'Collection'}</p><h1>Found for<br /><em>you.</em></h1><p>Showing pieces that match “{query}”.</p></div>{products === null ? <StatePanel error={error || undefined} /> : <ProductGrid products={products} />}</main>;
}

function ProductPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  useEffect(() => { setProduct(null); api.product(id).then(setProduct).catch((e) => setError(e.message)); }, [id]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!product) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true); setStatus('');
    try {
      await api.enquire({ productId: product.id, name: String(form.get('name')), email: String(form.get('email')), message: String(form.get('message')) });
      setStatus('Thanks for reaching out. Our team will be in touch soon.'); formElement.reset();
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Your enquiry could not be sent. Please try again.'); }
    finally { setBusy(false); }
  }
  if (!product) return <main className="page-content"><Link to="/" className="back-link">← Back to the edit</Link><StatePanel error={error || undefined} /></main>;
  return <main className="page-content"><Link to="/" className="back-link">← Back to the edit</Link><div className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.title} /></div><div className="detail-copy"><p className="eyebrow">{product.category} / Fieldwork edit</p><h1>{product.title}</h1><div className="detail-price">${product.price.toFixed(2)} <span>★ {product.rating.rate.toFixed(1)} · {product.rating.count} reviews</span></div><p className="detail-description">{product.description}</p><div className="detail-rule"/><h2>Ask us about this piece</h2><p className="form-intro">A little more information, a closer look, or help deciding? We're happy to help.</p>{!showEnquiry ? <button className="button button-dark" onClick={() => setShowEnquiry(true)}>Enquire <span>↗</span></button> : <form className="enquiry-form" onSubmit={submit}><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Your message<textarea name="message" rows={3} required minLength={10} maxLength={2000} placeholder="Tell us what you'd like to know…" /></label><button className="button button-dark" disabled={busy}>{busy ? 'Sending…' : 'Send an enquiry'} <span>↗</span></button>{status && <p className={`form-status ${status.startsWith('Thanks') ? 'success' : 'failure'}`} role="status">{status}</p>}</form>}{status && !showEnquiry && <p className={`form-status ${status.startsWith('Thanks') ? 'success' : 'failure'}`} role="status">{status}</p>}</div></div></main>;
}

export default function App() {
  const categories = useCategories();
  return <div className="app-shell"><Header categories={categories} /><Routes><Route path="/" element={<Home />} /><Route path="/categories/:slug" element={<CategoryPage />} /><Route path="/search" element={<SearchPage />} /><Route path="/products/:id" element={<ProductPage />} /><Route path="*" element={<main className="page-content"><div className="page-title"><p className="eyebrow">404 / Not found</p><h1>This page went<br /><em>wandering.</em></h1><Link className="button button-dark" to="/">Back home</Link></div></main>} /></Routes><Footer /></div>;
}
