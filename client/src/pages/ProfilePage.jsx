import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Settings,
  Package,
  Bookmark,
  TrendingUp,
  Zap,
  ShieldCheck,
  CheckCircle,
  Camera,
  LogOut,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user, setUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const isMe = !userId || userId === user?._id;
  const targetUserId = isMe ? user?._id : userId;

  // State
  const [activeTab, setActiveTab] = useState('listings');
  const [targetUser, setTargetUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pricing, setPricing] = useState(null);
  
  // Loading & Action states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingImage, setSubmittingImage] = useState(false);
  const [updatingPremium, setUpdatingPremium] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch target user's profile
  useEffect(() => {
    fetchProfile();
  }, [targetUserId, token]);

  // Fetch tab-specific data when active tab changes
  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'saved' && isMe) {
      fetchSaved();
    } else if (activeTab === 'analytics' && isMe && user?.plan !== 'basic') {
      fetchAnalytics();
    } else if (activeTab === 'upgrades' && isMe) {
      fetchPricing();
    }
  }, [activeTab, targetUserId, token, user?.plan]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setErrorMsg('');
      if (isMe) {
        // Fetch fresh private profile
        const res = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setTargetUser(data.data.user);
          setUser(data.data.user); // Sync Context
          setEditName(data.data.user.name);
          setEditHostel(data.data.user.hostel || '');
        }
      } else {
        // Fetch public profile
        const res = await fetch(`/api/users/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setTargetUser(data.data.user);
        } else {
          setErrorMsg(data.message || 'Failed to fetch seller profile.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const url = isMe ? '/api/users/my-listings' : `/api/products/seller/${targetUserId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.data.results || data.data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchSaved = async () => {
    try {
      setLoadingSaved(true);
      const res = await fetch('/api/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSavedItems(data.data.savedItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch('/api/users/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/premium/pricing');
      const data = await res.json();
      if (data.success) {
        setPricing(data.data.pricing);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upgrades Activation handlers
  const handleUpgradePlan = async (plan) => {
    if (!window.confirm(`Activate ${plan} plan subscription?`)) return;
    try {
      setUpdatingPremium(true);
      const res = await fetch('/api/premium/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Plan upgraded successfully!');
        fetchProfile();
      } else {
        alert(data.message || 'Failed to upgrade plan.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPremium(false);
    }
  };

  const handleTrustedBadge = async () => {
    if (!window.confirm('Activate Trusted Seller Badge?')) return;
    try {
      setUpdatingPremium(true);
      const res = await fetch('/api/premium/trusted-badge', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Trusted Badge activated!');
        fetchProfile();
      } else {
        alert(data.message || 'Activation failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPremium(false);
    }
  };

  const handleFeaturedSeller = async () => {
    if (!window.confirm('Activate Featured Seller Profile Boost?')) return;
    try {
      setUpdatingPremium(true);
      const res = await fetch('/api/premium/featured-seller', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Featured Seller status activated! You will appear on the homepage.');
        fetchProfile();
      } else {
        alert(data.message || 'Activation failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPremium(false);
    }
  };

  const handleBoostListing = async (productId) => {
    if (!window.confirm('Boost this product listing for 3 days to rank first?')) return;
    try {
      const res = await fetch(`/api/premium/boost/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ duration: '3days' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Product listing boosted successfully!');
        fetchListings();
      } else {
        alert(data.message || 'Failed to boost listing.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}/sold`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setSubmittingImage(true);
      const res = await fetch('/api/users/profile/image', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile picture updated!');
        fetchProfile();
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmittingProfile(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, hostel: editHostel })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Profile updated successfully!');
        setUser(data.data.user);
        setTargetUser(data.data.user);
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="container section animate-fade" style={{ paddingTop: '30px' }}>
      
      {/* Profile Header Grid */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }} className="profile-header-flex">
          
          {/* Avatar Area */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              border: '3px solid var(--neon-blue)',
            }}>
              {targetUser?.profileImage?.url ? (
                <img src={targetUser.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#050508' }}>
                  {targetUser?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Upload Button overlay for Me */}
            {isMe && (
              <label style={{
                position: 'absolute', bottom: '0', right: '0',
                background: 'var(--neon-blue)', color: '#050508',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid var(--bg-dark)',
                boxShadow: 'var(--neon-glow)', transition: 'all 0.2s',
              }} className="avatar-upload-btn">
                <Camera size={15} />
                <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Details Area */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{targetUser?.name}</h1>
              
              {/* Plan Badge */}
              {targetUser?.plan && targetUser.plan !== 'basic' && (
                <span className="badge badge-boosted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                  {targetUser.plan}
                </span>
              )}

              {/* Verified Badge */}
              {targetUser?.verifiedSeller && (
                <span className="badge badge-trusted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                  <CheckCircle size={10} /> Verified
                </span>
              )}

              {/* Trusted Badge */}
              {targetUser?.trustedSeller && (
                <span className="badge badge-premium" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                  <ShieldCheck size={10} /> Trusted Seller
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              {targetUser?.hostel && `${targetUser.hostel} · `}{targetUser?.college}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Joined {new Date(targetUser?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Logout for Me */}
          {isMe && (
            <button onClick={logout} className="btn btn-danger" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('listings')}
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeTab === 'listings' ? 'var(--neon-blue)' : 'var(--text-muted)',
            padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'listings' ? '2px solid var(--neon-blue)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Package size={16} /> {isMe ? 'My Listings' : 'Listings'}
        </button>

        {isMe && (
          <>
            <button
              onClick={() => setActiveTab('saved')}
              className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              style={{
                background: 'none', border: 'none', color: activeTab === 'saved' ? 'var(--neon-blue)' : 'var(--text-muted)',
                padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                borderBottom: activeTab === 'saved' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Bookmark size={16} /> Saved
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              style={{
                background: 'none', border: 'none', color: activeTab === 'analytics' ? 'var(--neon-blue)' : 'var(--text-muted)',
                padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                borderBottom: activeTab === 'analytics' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <TrendingUp size={16} /> Seller Analytics
            </button>

            <button
              onClick={() => setActiveTab('upgrades')}
              className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
              style={{
                background: 'none', border: 'none', color: activeTab === 'upgrades' ? 'var(--neon-blue)' : 'var(--text-muted)',
                padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                borderBottom: activeTab === 'upgrades' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--neon-pink)' }} /> Boost & Upgrade
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              style={{
                background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--neon-blue)' : 'var(--text-muted)',
                padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                borderBottom: activeTab === 'settings' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Settings size={16} /> Settings
            </button>
          </>
        )}
      </div>

      {/* Tab Panels */}
      <div className="tab-content animate-fade">
        
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {loadingListings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
              </div>
            ) : listings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}>
                <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.4 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No Listings Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {isMe ? 'List your first product for campus sales!' : 'This seller has no active listings.'}
                </p>
                {isMe && (
                  <Link to="/sell" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
                    Sell Product
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid-feed">
                {listings.map((item) => (
                  <div key={item._id} className="card-item relative animate-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${item._id}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', color: 'inherit', textDecoration: 'none' }}>
                      <div className="card-img-container">
                        <img src={item.images?.[0]?.url || 'https://via.placeholder.com/300?text=HostelHub'} alt={item.title} className="card-img" />
                        
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {item.boosted && (
                            <span className="badge badge-boosted" style={{ padding: '2px 8px', fontSize: '9px' }}>
                              <Zap size={9} /> Boosted
                            </span>
                          )}
                          {item.status === 'sold' && (
                            <span className="badge" style={{ background: '#f43f5e', color: '#fff', padding: '2px 8px', fontSize: '9px' }}>
                              SOLD
                            </span>
                          )}
                        </div>

                        <span className="card-price">₹{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="card-body">
                        <h4 className="card-title">{item.title}</h4>
                        <div className="card-meta">
                          <span>{item.condition} · {item.hostel || 'Hostel'}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Listings Management Actions for Me */}
                    {isMe && (
                      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.01)' }}>
                        {item.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleMarkSold(item._id)}
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            >
                              Mark Sold
                            </button>
                            <button
                              onClick={() => handleBoostListing(item._id)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--neon-pink)' }}
                              title="Boost Listing"
                            >
                              <Zap size={13} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                          title="Delete Listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && isMe && (
          <div>
            {loadingSaved ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
              </div>
            ) : savedItems.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}>
                <Bookmark size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.4 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No Saved Products</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Bookmark items you want to keep an eye on, and they'll show up here.
                </p>
                <Link to="/explore" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
                  Browse Feed
                </Link>
              </div>
            ) : (
              <div className="grid-feed">
                {savedItems.map((item) => (
                  <Link to={`/product/${item._id}`} key={item._id} className="card-item animate-card" style={{ display: 'flex', flexDirection: 'column', color: 'inherit', textDecoration: 'none' }}>
                    <div className="card-img-container">
                      <img src={item.images?.[0]?.url || 'https://via.placeholder.com/300?text=HostelHub'} alt={item.title} className="card-img" />
                      <span className="card-price">₹{item.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="card-body">
                      <h4 className="card-title">{item.title}</h4>
                      <div className="card-meta">
                        <span>{item.condition} · {item.hostel || 'Hostel'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && isMe && (
          <div>
            {user?.plan === 'basic' ? (
              /* Unlock Screen */
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 216, 255, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <TrendingUp size={28} style={{ color: 'var(--neon-blue)' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Unlock Seller Analytics</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
                  See detailed insights about your listings performance, total views, active chat engagements, and top selling products. Available only to Premium & Business tier members.
                </p>
                <button onClick={() => setActiveTab('upgrades')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Upgrade Plan <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* Analytics Dashboard */
              <div>
                {loadingAnalytics ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : analytics ? (
                  <div>
                    {/* Performance metrics grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Views</p>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-blue)' }}>
                          <Eye size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {analytics.totalViews}
                        </h3>
                      </div>
                      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Chats Started</p>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-purple)' }}>
                          <MessageSquare size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {analytics.totalChats || 0}
                        </h3>
                      </div>
                      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Sales (INR)</p>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                          <DollarSign size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {analytics.totalSales || 0}
                        </h3>
                      </div>
                    </div>

                    {/* Listings overview status metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', flexWrap: 'wrap' }} className="analytics-details-flex">
                      
                      {/* Top listings */}
                      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Top Performing Products</h3>
                        {analytics.topProducts?.length === 0 ? (
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No views logged on your products yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {analytics.topProducts?.map((p, idx) => (
                              <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                                  <Link to={`/product/${p._id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span> {p.title} <ExternalLink size={12} style={{ color: 'var(--neon-blue)' }} />
                                  </Link>
                                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Status: {p.status}</p>
                                </div>
                                
                                {/* Views Custom Chart bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '100px', height: '8px', background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '99px', overflow: 'hidden', display: 'none'
                                  }} className="md-flex-links">
                                    <div style={{
                                      width: `${Math.min(100, (p.views / (analytics.topProducts[0]?.views || 1)) * 100)}%`,
                                      height: '100%', background: 'var(--gradient-primary)'
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                                    {p.views} views
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Distribution breakdown */}
                      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Listings Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                              <span>Total Listed</span>
                              <span style={{ fontWeight: 600 }}>{analytics.totalListings}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: '100%', height: '100%', background: 'var(--neon-blue)' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                              <span>Active Offers</span>
                              <span style={{ fontWeight: 600 }}>{analytics.activeListings}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${analytics.totalListings ? (analytics.activeListings / analytics.totalListings) * 100 : 0}%`, height: '100%', background: '#10b981' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                              <span>Sold Items</span>
                              <span style={{ fontWeight: 600 }}>{analytics.soldListings}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${analytics.totalListings ? (analytics.soldListings / analytics.totalListings) * 100 : 0}%`, height: '100%', background: 'var(--neon-pink)' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Upgrades Hub Tab */}
        {activeTab === 'upgrades' && isMe && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Promote & Expand Your Reach</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Gain special trust tags, featured slots, or list more products with premium seller tiers.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Premium Plan Card */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: user?.plan === 'premium' ? '2px solid var(--neon-blue)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <span className="badge badge-boosted" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>PLAN</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Premium Member</h3>
                <p style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-blue)' }}>
                  ₹199 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
                </p>
                <ul style={{ padding: '20px 0 0 16px', margin: 0, fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)', flex: 1 }}>
                  <li>Unlocks detailed seller analytics dashboard.</li>
                  <li>Promote up to 3 listings simultaneously.</li>
                  <li>Custom premium buyer interaction insights.</li>
                  <li>Priority search exposure across categories.</li>
                </ul>
                <button
                  onClick={() => handleUpgradePlan('premium')}
                  disabled={user?.plan === 'premium' || updatingPremium}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '24px', padding: '12px' }}
                >
                  {user?.plan === 'premium' ? 'Current Active Plan' : 'Subscribe Now'}
                </button>
              </div>

              {/* Business Plan Card */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: user?.plan === 'business' ? '2px solid var(--neon-purple)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <span className="badge badge-premium" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>PLAN</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Business Tier</h3>
                <p style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-purple)' }}>
                  ₹499 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
                </p>
                <ul style={{ padding: '20px 0 0 16px', margin: 0, fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)', flex: 1 }}>
                  <li>All Premium features included.</li>
                  <li><strong>Includes FREE Trusted Badge</strong> auto-activation.</li>
                  <li>Unlimited listing uploads.</li>
                  <li>Advanced performance and reach tracking.</li>
                </ul>
                <button
                  onClick={() => handleUpgradePlan('business')}
                  disabled={user?.plan === 'business' || updatingPremium}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '24px', padding: '12px', background: 'var(--neon-purple)' }}
                >
                  {user?.plan === 'business' ? 'Current Active Plan' : 'Subscribe Now'}
                </button>
              </div>

              {/* Single add-on Trusted badge */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: user?.trustedSeller ? '2px solid #10b981' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <span className="badge badge-trusted" style={{ alignSelf: 'flex-start', marginBottom: '16px', background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>ADD-ON</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Trusted Seller Tag</h3>
                <p style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                  ₹149 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.6, flex: 1 }}>
                  Adds a verified "Trusted Seller" badge next to your profile and listings. Highly improves customer conversion rate.
                </p>
                <button
                  onClick={handleTrustedBadge}
                  disabled={user?.trustedSeller || updatingPremium}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '24px', padding: '12px', border: '1px solid #10b981', color: '#10b981' }}
                >
                  {user?.trustedSeller ? 'Active' : 'Get Badge'}
                </button>
              </div>

              {/* Single add-on Profile boost */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: user?.featuredSeller ? '2px solid var(--neon-pink)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <span className="badge badge-boosted" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>ADD-ON</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Featured Seller</h3>
                <p style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-pink)' }}>
                  ₹299 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.6, flex: 1 }}>
                  Get highlighted on the homepage feed as a Featured Seller in your college. Increases profile views and buyer inquiries significantly.
                </p>
                <button
                  onClick={handleFeaturedSeller}
                  disabled={user?.featuredSeller || updatingPremium}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '24px', padding: '12px', border: '1px solid var(--neon-pink)', color: 'var(--neon-pink)' }}
                >
                  {user?.featuredSeller ? 'Active' : 'Feature Profile'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && isMe && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Edit Profile Information</h3>

              {successMsg && (
                <div style={{
                  padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981',
                  borderRadius: '10px', fontSize: '13px', marginBottom: '20px'
                }}>
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{
                  padding: '12px 16px', background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e',
                  borderRadius: '10px', fontSize: '13px', marginBottom: '20px'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hostel block & Room No.</label>
                <input
                  type="text"
                  value={editHostel}
                  onChange={(e) => setEditHostel(e.target.value)}
                  placeholder="e.g. Block C, Room 305"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">College / Campus</label>
                <input
                  type="text"
                  value={user?.college || ''}
                  className="form-control"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  disabled
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  College is auto-assigned during registration via email domain for security.
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px', padding: '12px' }}
              >
                {submittingProfile ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
