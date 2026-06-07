import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Flag,
  BarChart2,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  ShieldAlert,
  Sparkles,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Admin Auth state
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('adminUser') || 'null'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Auto-fetch dashboard data if logged in
  useEffect(() => {
    if (adminToken) {
      fetchStats();
    }
  }, [adminToken]);

  // Tab switch listener
  useEffect(() => {
    if (!adminToken) return;

    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, adminToken]);

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
        setAdminToken(data.data.token);
        setAdminUser(data.data.admin);
      } else {
        setAuthError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      console.error(err);
      setAuthError('An error occurred during login.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
    setStats(null);
    setUsers([]);
    setListings([]);
  };

  // API Fetches
  const fetchStats = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users || data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin/listings', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.data.results || data.data.listings || data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // Admin Actions
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently? This action is IRREVERSIBLE!')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || 'Only superadmin can delete users.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm('Delete this listing permanently as moderator?')) return;
    try {
      const res = await fetch(`/api/admin/listings/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearReport = async (productId) => {
    try {
      const res = await fetch(`/api/admin/listings/${productId}/clear-report`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // LOGIN SCREEN
  if (!adminToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(247, 37, 133, 0.08)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              color: 'var(--neon-pink)', border: '1px solid rgba(247, 37, 133, 0.2)'
            }}>
              <ShieldAlert size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>HostelHub Admin</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>Sign in to moderation portal</p>
          </div>

          {authError && (
            <div style={{
              padding: '12px 16px', background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e',
              borderRadius: '10px', fontSize: '13px', marginBottom: '20px'
            }}>
              {authError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="admin@hostelhub.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', background: 'var(--neon-pink)' }}
          >
            {authLoading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container section animate-fade" style={{ paddingTop: '30px' }}>
      
      {/* Admin Header */}
      <div className="glass-panel" style={{ padding: '24px 32px', borderRadius: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} style={{ color: 'var(--neon-pink)' }} /> Moderation Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Logged in as {adminUser?.name} ({adminUser?.role})
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> Logout Admin
        </button>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--neon-pink)' : 'var(--text-muted)',
            padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '2px solid var(--neon-pink)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <BarChart2 size={16} /> Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--neon-pink)' : 'var(--text-muted)',
            padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'users' ? '2px solid var(--neon-pink)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={16} /> User Management
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          style={{
            background: 'none', border: 'none', color: activeTab === 'listings' ? 'var(--neon-pink)' : 'var(--text-muted)',
            padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            borderBottom: activeTab === 'listings' ? '2px solid var(--neon-pink)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Package size={16} /> Listing Moderation
        </button>
      </div>

      {/* Tab Panels */}
      {loadingData ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="animate-fade">
          
          {/* Overview Panel */}
          {activeTab === 'overview' && stats && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Colleges / Campuses</p>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-blue)' }}>
                    <MapPin size={22} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {stats.totalColleges}
                  </h2>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Registered Students</p>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-purple)' }}>
                    <Users size={22} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {stats.totalUsers}
                  </h2>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Listings</p>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'var(--neon-pink)' }}>
                    <Package size={22} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {stats.totalListings}
                  </h2>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Active Offers</p>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                    <CheckCircle size={22} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {stats.activeListings}
                  </h2>
                </div>
              </div>

              {/* Extra Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }} className="analytics-details-flex">
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Premium Seller Growth</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>Premium Members</span>
                      <span style={{ fontWeight: 600 }}>{stats.premiumUsers}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>Business Members</span>
                      <span style={{ fontWeight: 600 }}>{stats.businessUsers}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>Boosted Listings Active</span>
                      <span style={{ fontWeight: 600, color: 'var(--neon-pink)' }}>{stats.boostedListings}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Colleges distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                    {stats.collegesDistribution?.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No distribution data.</p>
                    ) : (
                      stats.collegesDistribution?.map((col) => (
                        <div key={col._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>{col._id}</span>
                          <span style={{ fontWeight: 600 }}>{col.count} students</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Panel */}
          {activeTab === 'users' && (
            <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px' }}>Name</th>
                      <th style={{ padding: '16px 20px' }}>Email</th>
                      <th style={{ padding: '16px 20px' }}>College / Hostel</th>
                      <th style={{ padding: '16px 20px' }}>Status</th>
                      <th style={{ padding: '16px 20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{u.college} {u.hostel && `· ${u.hostel}`}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${u.isActive ? 'badge-trusted' : 'badge-danger'}`} style={{
                            background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                            color: u.isActive ? '#10b981' : '#f43f5e'
                          }}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleUserStatus(u._id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            {u.isActive ? 'Suspend' : 'Unsuspend'}
                          </button>
                          {adminUser?.role === 'superadmin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Listing Moderation Panel */}
          {activeTab === 'listings' && (
            <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px' }}>Listing</th>
                      <th style={{ padding: '16px 20px' }}>Price</th>
                      <th style={{ padding: '16px 20px' }}>College / Hostel</th>
                      <th style={{ padding: '16px 20px' }}>Report Count</th>
                      <th style={{ padding: '16px 20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l._id} style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: l.reportCount >= 3 ? 'rgba(244, 63, 94, 0.04)' : 'rgba(0,0,0,0.1)'
                      }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600 }}>{l.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Status: {l.status}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{l.price}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{l.college} {l.hostel && `· ${l.hostel}`}</td>
                        <td style={{ padding: '16px 20px' }}>
                          {l.reportCount > 0 ? (
                            <span style={{ color: l.reportCount >= 3 ? 'var(--neon-pink)' : '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={14} /> {l.reportCount} reports
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                          {l.reportCount > 0 && (
                            <button
                              onClick={() => handleClearReport(l._id)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
                            >
                              Clear Reports
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteListing(l._id)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
