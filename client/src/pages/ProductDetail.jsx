import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Eye,
  Clock,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Zap,
  Flag,
  Trash2,
  Edit3,
  CheckCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.data.product);
        setIsSaved(user?.savedItems?.includes(data.data.product._id) || false);
      } else {
        setError(data.message || 'Product not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load product.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    try {
      const url = `/api/saved/${id}`;
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = async () => {
    if (!product?.sellerId?._id) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: product.sellerId._id,
          productId: product._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/chat/${data.data.conversation._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReport = async () => {
    if (!window.confirm('Report this listing as inappropriate?')) return;
    try {
      const res = await fetch(`/api/products/${id}/report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) alert('Product reported. Our team will review it.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Mark this product as sold?')) return;
    try {
      const res = await fetch(`/api/products/${id}/sold`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = user && product?.sellerId?._id === user._id;
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container section animate-fade" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--neon-pink)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{error || 'Product not found'}</h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container section animate-fade" style={{ paddingTop: '30px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '14px', marginBottom: '24px',
          fontWeight: 500, transition: 'color 0.2s'
        }}
        className="back-btn"
      >
        <ArrowLeft size={18} /> Back to listings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'flex-start' }} className="product-detail-grid">
        {/* Left: Image Gallery */}
        <div>
          <div
            className="glass-panel"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              paddingTop: '80%',
            }}
          >
            <img
              src={product.images?.[activeImage]?.url || 'https://via.placeholder.com/600?text=HostelHub'}
              alt={product.title}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', objectFit: 'cover',
              }}
            />

            {/* Badges */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {product.boosted && (
                <span className="badge badge-boosted" style={{ padding: '4px 10px' }}>
                  <Zap size={12} /> Boosted
                </span>
              )}
              {product.status === 'sold' && (
                <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.9)', color: '#fff', padding: '4px 10px' }}>
                  SOLD
                </span>
              )}
            </div>

            {/* Navigation arrows */}
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                  style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#fff',
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#fff',
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  style={{
                    width: '56px', height: '56px', borderRadius: '10px',
                    overflow: 'hidden', cursor: 'pointer',
                    border: idx === activeImage ? '2px solid var(--neon-blue)' : '2px solid transparent',
                    opacity: idx === activeImage ? 1 : 0.6,
                    transition: 'all 0.2s',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          {/* Category + Condition */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-premium">
              <Tag size={12} /> {product.category}
            </span>
            {product.condition && (
              <span className="badge badge-trusted" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                {product.condition}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px' }}>
            {product.title}
          </h1>

          {/* Price */}
          <div style={{
            fontSize: '32px', fontWeight: 800, marginBottom: '20px',
            background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              {product.hostel && `${product.hostel} • `}{product.college}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} style={{ color: 'var(--text-muted)' }} />
              {product.views} views
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              {timeSince(product.createdAt)}
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Description
            </h3>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {product.description}
            </p>
          </div>

          {/* Seller Card */}
          <div
            className="glass-panel"
            style={{
              padding: '20px', borderRadius: '14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              border: '2px solid var(--neon-blue)', flexShrink: 0,
            }}>
              {product.sellerId?.profileImage?.url ? (
                <img src={product.sellerId.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#050508' }}>
                  {product.sellerId?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{product.sellerId?.name}</span>
                {product.sellerId?.trustedSeller && (
                  <ShieldCheck size={14} style={{ color: 'var(--neon-blue)' }} />
                )}
                {product.sellerId?.verifiedSeller && (
                  <CheckCircle size={14} style={{ color: '#10b981' }} />
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {product.sellerId?.hostel && `${product.sellerId.hostel} • `}{product.sellerId?.college || product.college}
              </p>
            </div>
            <Link
              to={`/profile/${product.sellerId?._id}`}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <ExternalLink size={12} /> Profile
            </Link>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isOwner ? (
              <>
                {product.status === 'active' && (
                  <button
                    onClick={handleMarkSold}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    <CheckCircle size={16} /> Mark as Sold
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  style={{ padding: '12px 20px' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleChat}
                  disabled={chatLoading || product.status === 'sold'}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {chatLoading ? (
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  ) : (
                    <MessageSquare size={16} />
                  )}
                  {product.status === 'sold' ? 'Sold Out' : 'Chat with Seller'}
                </button>
                <button
                  onClick={toggleSave}
                  className="btn btn-secondary"
                  style={{ padding: '12px 20px', color: isSaved ? 'var(--neon-pink)' : undefined }}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
                <button
                  onClick={handleReport}
                  className="btn btn-secondary"
                  style={{ padding: '12px 20px' }}
                >
                  <Flag size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .back-btn:hover { color: var(--neon-blue) !important; }
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
