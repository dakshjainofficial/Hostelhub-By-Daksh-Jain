import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { 
  Bell, 
  MessageSquare, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Heart, 
  List, 
  PlusCircle, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, unreadMessages, unreadNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Check if current user is admin (e.g. from token or session)
  const isAdmin = localStorage.getItem('isAdmin') === 'true' || user?.isAdmin;

  return (
    <nav 
      className="glass-panel" 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRadius: '0 0 16px 16px',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        background: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(16px)',
        height: '76px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left: Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo variant="full" size={34} />
        </Link>

        {/* Center: Search & Navigation links (Desktop) */}
        <div style={{ display: 'none', gap: '30px', alignItems: 'center' }} className="md-flex-links">
          {user && (
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '260px' }}>
              <input 
                type="text" 
                placeholder="Search products in your campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  padding: '8px 16px 8px 36px',
                  fontSize: '14px',
                  borderRadius: '99px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              />
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </form>
          )}

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{ 
                color: location.pathname === '/' ? 'var(--neon-blue)' : 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'color 0.2s'
              }}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              style={{ 
                color: location.pathname.startsWith('/explore') ? 'var(--neon-blue)' : 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'color 0.2s'
              }}
            >
              Explore
            </Link>
            {user && (
              <Link 
                to="/sell" 
                style={{ 
                  color: location.pathname === '/sell' ? 'var(--neon-blue)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  transition: 'color 0.2s'
                }}
              >
                Sell
              </Link>
            )}
          </div>
        </div>

        {/* Right: User Icons / Auth triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              {/* Desktop Icons */}
              <div style={{ display: 'none', gap: '16px', alignItems: 'center' }} className="md-flex-icons">
                {/* Chat link */}
                <Link 
                  to="/chat" 
                  style={{ position: 'relative', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                  className="hover-glow-icon"
                >
                  <MessageSquare size={20} />
                  {unreadMessages > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--neon-pink)',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications link */}
                <Link 
                  to="/notifications" 
                  style={{ position: 'relative', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                  className="hover-glow-icon"
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--neon-blue)',
                        color: '#050508',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>

              {/* User Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1.5px solid var(--neon-blue)'
                    }}
                  >
                    {user.profileImage?.url ? (
                      <img src={user.profileImage.url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#050508' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, display: 'none' }} className="md-inline-name">
                    {user.name.split(' ')[0]}
                  </span>
                </div>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div 
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '45px',
                      width: '220px',
                      padding: '8px',
                      background: 'rgba(15, 15, 22, 0.95)',
                      boxShadow: 'var(--shadow-lg)',
                      borderRadius: '12px'
                    }}
                  >
                    {/* Header info */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.college}</p>
                    </div>
                    
                    {/* Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 0' }}>
                      <Link 
                        to="/profile" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                        className="hover-dropdown-item"
                      >
                        <UserIcon size={16} /> My Profile
                      </Link>
                      <Link 
                        to="/profile?tab=listings" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                        className="hover-dropdown-item"
                      >
                        <List size={16} /> My Listings
                      </Link>
                      <Link 
                        to="/profile?tab=saved" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                        className="hover-dropdown-item"
                      >
                        <Heart size={16} /> Saved Items
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: 'var(--neon-blue)' }}
                          className="hover-dropdown-item"
                        >
                          <ShieldCheck size={16} /> Admin Console
                        </Link>
                      )}
                      <Link 
                        to="/profile?tab=settings" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                        className="hover-dropdown-item"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                    </div>

                    {/* Footer log out */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', padding: '6px 0 0 0' }}>
                      <button 
                        onClick={logout}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          width: '100%', 
                          textAlign: 'left', 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          fontSize: '13px', 
                          background: 'none', 
                          border: 'none', 
                          color: '#fda4af', 
                          cursor: 'pointer' 
                        }}
                        className="hover-dropdown-item-logout"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Join Hub
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'block', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            className="md-hide-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '76px',
            left: 0,
            width: '100%',
            background: 'rgba(10, 10, 15, 0.98)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {user && (
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Search campus products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  padding: '10px 16px 10px 38px',
                  borderRadius: '99px',
                }}
              />
              <Search 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{ fontSize: '16px', fontWeight: 500 }}>Home</Link>
            <Link to="/explore" style={{ fontSize: '16px', fontWeight: 500 }}>Explore</Link>
            {user && (
              <>
                <Link to="/sell" style={{ fontSize: '16px', fontWeight: 500 }}>Sell Product</Link>
                <Link to="/chat" style={{ fontSize: '16px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Messages
                  {unreadMessages > 0 && (
                    <span style={{ background: 'var(--neon-pink)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" style={{ fontSize: '16px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Notifications
                  {unreadNotifications > 0 && (
                    <span style={{ background: 'var(--neon-blue)', color: '#050508', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS for layout triggers */}
      <style>{`
        @media (min-width: 768px) {
          .md-flex-links { display: flex !important; }
          .md-flex-icons { display: flex !important; }
          .md-hide-menu { display: none !important; }
          .md-inline-name { display: inline !important; }
        }
        .hover-glow-icon:hover {
          color: var(--neon-blue) !important;
          filter: drop-shadow(0 0 4px var(--neon-blue));
        }
        .hover-dropdown-item {
          transition: all 0.2s ease;
        }
        .hover-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--neon-blue) !important;
          padding-left: 16px !important;
        }
        .hover-dropdown-item-logout:hover {
          background: rgba(244, 63, 94, 0.08) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
