import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from './HomeFeed';
import { 
  Search, 
  SlidersHorizontal, 
  Tag, 
  BadgeAlert, 
  ArrowUpDown,
  X,
  PackageOpen
} from 'lucide-react';

const CATEGORIES = ['Books', 'Electronics', 'Cycles', 'Furniture', 'Essentials', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const ExplorePage = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Search and Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync URL parameters to state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSelectedCondition(params.get('condition') || '');
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setSortBy(params.get('sortBy') || 'recent');
  }, [location.search]);

  // Fetch products whenever state variables sync/change
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams(location.search);
      const res = await fetch(`/api/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.results || []);
      } else {
        setError(data.message || 'Failed to fetch items');
      }
    } catch (err) {
      console.error('Explore products fetch failed:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFilteredProducts();
    }
  }, [token, location.search]);

  // Update URL parameters
  const applyFilters = (updates = {}) => {
    const params = new URLSearchParams(location.search);
    
    // Add updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    navigate(`/explore?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    navigate('/explore');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const toggleSave = async (e, productId, isSaved) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `/api/saved/${productId}`;
      const method = isSaved ? 'DELETE' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        fetchFilteredProducts();
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  const isItemSaved = (productId) => {
    return user?.savedItems?.includes(productId) || false;
  };

  return (
    <div className="container section animate-fade" style={{ paddingTop: '40px' }}>
      
      {/* ─── Page Header / Search ────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Explore Campus Catalog</h2>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '700px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search by product title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '44px', height: '46px' }}
            />
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', height: '46px' }}>
            Search
          </button>
        </form>
      </div>

      {/* ─── Layout: Left Sidebar Filters, Right Catalog Grid ───────────── */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }} className="explore-layout">
        
        {/* Left: Sidebar Filters (Desktop) */}
        <aside 
          className="glass-panel desktop-filters"
          style={{
            width: '260px',
            padding: '24px',
            flexShrink: 0,
            position: 'sticky',
            top: '100px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button 
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: 'var(--neon-blue)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>

          {/* Sorting */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => applyFilters({ sortBy: e.target.value })}
              className="form-control"
              style={{ fontSize: '13px' }}
            >
              <option value="recent">Recently Added</option>
              <option value="popular">Popular (Most Viewed)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>Category</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {CATEGORIES.map((cat, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => applyFilters({ category: cat })}
                    style={{ accentColor: 'var(--neon-blue)' }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>Price Range (₹)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => applyFilters({ minPrice })}
                className="form-control"
                style={{ padding: '8px', fontSize: '13px' }}
              />
              <input 
                type="number" 
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => applyFilters({ maxPrice })}
                className="form-control"
                style={{ padding: '8px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>Condition</label>
            <select 
              value={selectedCondition}
              onChange={(e) => applyFilters({ condition: e.target.value })}
              className="form-control"
              style={{ fontSize: '13px' }}
            >
              <option value="">Any Condition</option>
              {CONDITIONS.map((cond, idx) => (
                <option key={idx} value={cond}>{cond}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Right: Grid Catalog */}
        <div style={{ flex: 1 }}>
          {/* Mobile Filters Trigger */}
          <button 
            className="btn btn-secondary mobile-filters-btn" 
            onClick={() => setShowFiltersMobile(true)}
            style={{ display: 'none', width: '100%', marginBottom: '20px', gap: '8px' }}
          >
            <SlidersHorizontal size={16} /> Filter & Sort
          </button>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
              <div style={{ border: '3px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid var(--neon-blue)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} isSaved={isItemSaved(prod._id)} onSaveToggle={toggleSave} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}>
              <PackageOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No Listings Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px', margin: '0 auto' }}>
                There are no active products matching your current filters in your campus library. Try broadening your keywords.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFiltersMobile && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '300px',
              height: '100%',
              background: 'rgba(10, 10, 15, 0.98)',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              overflowY: 'auto',
              borderRadius: '16px 0 0 16px',
              borderRight: 'none',
              borderTop: 'none',
              borderBottom: 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Filter Products</h3>
              <button onClick={() => setShowFiltersMobile(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Sort */}
            <div>
              <label className="form-label">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => {
                  applyFilters({ sortBy: e.target.value });
                }}
                className="form-control"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="form-label">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => applyFilters({ category: e.target.value })}
                className="form-control"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Prices */}
            <div>
              <label className="form-label">Price Range</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => applyFilters({ minPrice })}
                  className="form-control"
                />
                <input 
                  type="number" 
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => applyFilters({ maxPrice })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="form-label">Condition</label>
              <select 
                value={selectedCondition}
                onChange={(e) => applyFilters({ condition: e.target.value })}
                className="form-control"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((cond, idx) => (
                  <option key={idx} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => setShowFiltersMobile(false)}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Apply Filters
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                clearFilters();
                setShowFiltersMobile(false);
              }}
              style={{ width: '100%' }}
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Embed responsive media styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-filters { display: none !important; }
          .mobile-filters-btn { display: flex !important; }
          .explore-layout { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
