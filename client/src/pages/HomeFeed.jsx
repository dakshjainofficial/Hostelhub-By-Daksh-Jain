import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Tag, 
  Eye, 
  Bookmark, 
  ArrowRight,
  BookOpen,
  Laptop,
  Bike,
  Package,
  Armchair,
  Shirt,
  ShieldCheck,
  Zap,
  BookmarkCheck
} from 'lucide-react';

const categoryIcons = {
  Books: BookOpen,
  Electronics: Laptop,
  Cycles: Bike,
  Furniture: Armchair,
  Essentials: Package,
  Clothing: Shirt
};

const HomeFeed = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState([]);
  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch feed items
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch Latest Listings
      const latestRes = await fetch('/api/products?sortBy=recent&limit=8', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const latestData = await latestRes.json();
      if (latestData.success) {
        setLatest(latestData.data.results || []);
      }

      // Fetch Trending Listings (based on views)
      const trendingRes = await fetch('/api/products?sortBy=popular&limit=4', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trendingData = await trendingRes.json();
      if (trendingData.success) {
        setTrending(trendingData.data.results || []);
      }

      // Fetch Recommended Listings (boosted)
      // For fallback or mixed feed, we can extract products that are marked as boosted or featured
      const recRes = await fetch('/api/products?limit=8', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recData = await recRes.json();
      if (recData.success) {
        // filter or sort to show boosted items first
        setRecommended(recData.data.results || []);
      }

    } catch (err) {
      console.error('Fetch feed error:', err);
      setError('Failed to fetch feed products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFeed();
    }
  }, [token]);

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
        // Refresh feed to update saved states
        fetchFeed();
      }
    } catch (err) {
      console.error('Save product toggle failed:', err);
    }
  };

  const categories = ['Books', 'Electronics', 'Cycles', 'Furniture', 'Essentials', 'Clothing', 'Sports', 'Other'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ border: '3px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid var(--neon-blue)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Check if item is saved by comparing with user.savedItems array (if populated with IDs)
  const isItemSaved = (productId) => {
    return user?.savedItems?.includes(productId) || false;
  };

  return (
    <div className="container section animate-fade" style={{ paddingTop: '40px' }}>
      
      {/* ─── Campus Announcement Banner ───────────────────────────────────── */}
      <div 
        className="glass-panel premium-glow-bg" 
        style={{
          padding: '24px 30px',
          borderRadius: '16px',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          border: '1px solid rgba(0, 216, 255, 0.15)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <BuildingIcon className="text-blue" size={18} />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Exclusive to {user?.college}</h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing marketplace products only from your campus. Fast local handoffs inside hostels.
          </p>
        </div>
        <Link to="/sell" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
          + List a New Product
        </Link>
      </div>

      {/* ─── Categories Quick Navigation ──────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Quick Browse
        </h4>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {categories.map((cat, idx) => {
            const Icon = categoryIcons[cat] || Tag;
            return (
              <Link 
                key={idx}
                to={`/explore?category=${cat}`}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '99px',
                  fontSize: '14px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s'
                }}
                className="hover-pill"
              >
                <Icon size={16} /> {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Recommended / Boosted Section ────────────────────────────────── */}
      {recommended.filter(p => p.boosted).length > 0 && (
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} style={{ color: 'var(--neon-pink)' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Featured Campus Deals</h2>
            </div>
            <Link to="/explore" style={{ fontSize: '13px', color: 'var(--neon-blue)', fontWeight: 500 }}>
              View all
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {recommended
              .filter(p => p.boosted)
              .slice(0, 4)
              .map((prod) => (
                <ProductCard key={prod._id} product={prod} isSaved={isItemSaved(prod._id)} onSaveToggle={toggleSave} />
              ))}
          </div>
        </div>
      )}

      {/* ─── Latest Listings ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: 'var(--neon-blue)' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Latest Listings</h2>
          </div>
          <Link to="/explore" style={{ fontSize: '13px', color: 'var(--neon-blue)', fontWeight: 500 }}>
            Browse entire feed
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {latest.map((prod) => (
            <ProductCard key={prod._id} product={prod} isSaved={isItemSaved(prod._id)} onSaveToggle={toggleSave} />
          ))}
        </div>
      </div>

      {/* ─── Trending / Most Viewed Listings ──────────────────────────────── */}
      {trending.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--neon-purple)' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Trending Products</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {trending.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} isSaved={isItemSaved(prod._id)} onSaveToggle={toggleSave} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .hover-pill:hover {
          background: rgba(0, 216, 255, 0.05) !important;
          border-color: var(--neon-blue) !important;
          color: var(--neon-blue) !important;
        }
      `}</style>
    </div>
  );
};

/* ─── Product Card Child Component ───────────────────────────────────────── */
export const ProductCard = ({ product, isSaved, onSaveToggle }) => {
  const thumbnail = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=HostelHub';
  
  return (
    <Link 
      to={`/product/${product._id}`}
      className="glass-panel-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(18, 18, 26, 0.5)',
        height: '100%'
      }}
    >
      {/* Image thumbnail container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
        <img 
          src={thumbnail} 
          alt={product.title} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          className="product-card-img"
        />
        
        {/* Badges overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {product.boosted && (
            <span className="badge badge-boosted" style={{ padding: '3px 8px', fontSize: '9px', background: 'var(--neon-pink)', color: '#fff' }}>
              <Zap size={10} /> Boosted
            </span>
          )}
          {product.sellerId?.trustedSeller && (
            <span className="badge badge-trusted" style={{ padding: '3px 8px', fontSize: '9px', background: 'var(--neon-blue)', color: '#050508' }}>
              <ShieldCheck size={10} /> Trusted
            </span>
          )}
        </div>

        {/* Save button */}
        <button 
          onClick={(e) => onSaveToggle(e, product._id, isSaved)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(10, 10, 15, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isSaved ? 'var(--neon-pink)' : '#ffffff',
            transition: 'all 0.2s'
          }}
          className="save-btn"
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>

        {/* Price tag */}
        <div 
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid var(--neon-blue)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--neon-blue)'
          }}
        >
          ₹{product.price.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Info pane */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span 
          style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            fontWeight: 600, 
            letterSpacing: '0.05em', 
            color: 'var(--neon-purple)',
            marginBottom: '4px'
          }}
        >
          {product.category}
        </span>
        
        <h4 
          style={{ 
            fontSize: '15px', 
            fontWeight: 600, 
            color: '#ffffff', 
            lineHeight: 1.3,
            marginBottom: '8px',
            flex: 1
          }}
        >
          {product.title}
        </h4>

        {/* Locality info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {product.hostel ? `${product.hostel} • ` : ''}{product.college}
          </span>
        </div>

        {/* Seller info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#050508'
            }}
          >
            {product.sellerId?.profileImage?.url ? (
              <img src={product.sellerId.profileImage.url} alt={product.sellerId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              product.sellerId?.name?.charAt(0).toUpperCase() || 'S'
            )}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {product.sellerId?.name || 'Seller'}
          </span>
          <span style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Eye size={12} /> {product.views}
          </div>
        </div>
      </div>

      <style>{`
        .glass-panel-interactive:hover .product-card-img {
          transform: scale(1.05);
        }
        .save-btn:hover {
          transform: scale(1.1);
          background: rgba(10, 10, 15, 0.8) !important;
        }
      `}</style>
    </Link>
  );
};

// SVG Icon replacement since Lucide may vary
const BuildingIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: 'var(--neon-blue)' }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M9 6h.01" />
    <path d="M15 6h.01" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
  </svg>
);

export default HomeFeed;
