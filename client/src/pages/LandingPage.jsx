import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  BookOpen,
  Laptop,
  Bike,
  Package,
  Armchair,
  Shirt,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const categories = [
    { name: 'Books', icon: BookOpen, count: '1.2k+ items', color: '#38bdf8' },
    { name: 'Electronics', icon: Laptop, count: '850+ items', color: '#a78bfa' },
    { name: 'Cycles', icon: Bike, count: '320+ items', color: '#fb7185' },
    { name: 'Furniture', icon: Armchair, count: '450+ items', color: '#34d399' },
    { name: 'Essentials', icon: Package, count: '600+ items', color: '#fbbf24' },
    { name: 'Clothing', icon: Shirt, count: '500+ items', color: '#22d3ee' }
  ];

  return (
    <div className="animate-fade">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <header 
        style={{ 
          position: 'relative',
          padding: '100px 0 80px 0',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div 
            className="badge" 
            style={{ 
              background: 'rgba(0, 216, 255, 0.08)',
              border: '1px solid rgba(0, 216, 255, 0.2)',
              color: 'var(--neon-blue)',
              padding: '6px 16px',
              borderRadius: '99px',
              marginBottom: '24px',
              display: 'inline-flex',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <Sparkles size={14} /> Trust-locked Campus Ecosystem
          </div>

          {/* Heading */}
          <h1 
            style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: 800, 
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
              color: '#ffffff'
            }}
          >
            Buy. Sell. <br />
            <span 
              style={{ 
                background: 'linear-gradient(90deg, #00d8ff 0%, #9d4edd 50%, #f72585 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
              className="glow-text"
            >
              Connect Inside Campus.
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            style={{ 
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
              color: 'var(--text-secondary)',
              maxWidth: '650px',
              margin: '0 auto 40px auto',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            The trusted peer-to-peer student marketplace. Exclusively see listings from peers in your own college and nearby hostels.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="glass-panel"
            style={{
              maxWidth: '600px',
              margin: '0 auto 40px auto',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '99px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(18, 18, 26, 0.75)'
            }}
          >
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
              <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '12px' }} />
              <input 
                type="text" 
                placeholder="What are you looking for today? (e.g. calculator, cycle...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  width: '100%',
                  fontSize: '16px'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '99px', padding: '12px 28px' }}>
              Search
            </button>
          </form>

          {/* Call-to-action buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Explore Marketplace <ArrowRight size={16} />
            </Link>
            <Link to={user ? "/sell" : "/login"} className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Sell Something
            </Link>
          </div>
        </div>
        
        {/* Glow backdrop decoration */}
        <div 
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 216, 255, 0.1) 0%, rgba(157, 78, 221, 0.05) 50%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      </header>

      {/* ─── Why HostelHub (USPs) ─────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>
            Why Choose HostelHub?
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '56px', maxWidth: '500px', margin: '0 auto 56px auto' }}>
            Tailored features built directly for student-to-student transactions inside high-density hostel structures.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass-panel-interactive" style={{ padding: '30px' }}>
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: 'rgba(0, 216, 255, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--neon-blue)'
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Only Verified Students</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Every profile is verified through college-specific domains. Zero outside scammers. Safe, local campus networks only.
              </p>
            </div>

            <div className="glass-panel-interactive" style={{ padding: '30px' }}>
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: 'rgba(157, 78, 221, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--neon-purple)'
                }}
              >
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Hostel-Level Locality</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                See exact blocks, wings, and rooms. Hand off items directly in the lobby or mess halls. No delivery fees, no waiting.
              </p>
            </div>

            <div className="glass-panel-interactive" style={{ padding: '30px' }}>
              <div 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: 'rgba(247, 37, 133, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--neon-pink)'
                }}
              >
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Instant Peer Chat</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Connect directly over real-time text. Know when they are typing or online, align hand-off times, and negotiate terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Showcase ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'rgba(18, 18, 26, 0.2)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>
            Popular Categories
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={idx} 
                  to={`/explore?category=${cat.name}`}
                  className="glass-panel-interactive"
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    borderRadius: '16px'
                  }}
                >
                  <Icon size={32} style={{ color: cat.color }} />
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '15px' }}>{cat.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '56px' }}>
            How HostelHub Works
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', position: 'relative' }}>
            <div style={{ textAlign: 'center', padding: '0 10px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--gradient-primary)', 
                  color: '#050508',
                  fontSize: '18px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Join Your Campus</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Create an account using your official college email. We automatically connect you to your specific university hub.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '0 10px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--gradient-primary)', 
                  color: '#050508',
                  fontSize: '18px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>List or Explore</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Post items you no longer need with campus details, or search the feed for books, furniture, electronics, and cycles.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '0 10px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--gradient-primary)', 
                  color: '#050508',
                  fontSize: '18px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Exchange Instantly</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Chat in real-time, align a meeting spot like the hostel entrance, inspect the product, and close the deal securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Statistics Showcase ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '30px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '48px', fontWeight: 800, color: 'var(--neon-blue)', marginBottom: '8px' }}>50k+</p>
              <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-secondary)' }}>Happy Students</p>
            </div>
            <div>
              <p style={{ fontSize: '48px', fontWeight: 800, color: 'var(--neon-purple)', marginBottom: '8px' }}>200+</p>
              <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Colleges</p>
            </div>
            <div>
              <p style={{ fontSize: '48px', fontWeight: 800, color: 'var(--neon-pink)', marginBottom: '8px' }}>10k+</p>
              <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-secondary)' }}>Products Exchanged</p>
            </div>
            <div>
              <p style={{ fontSize: '48px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>99%</p>
              <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-secondary)' }}>Trusted Handoffs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
            Loved by Campus Hostellers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '30px' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                "HostelHub made moving out of my room so simple. I sold my desk, chair, and a cooler to a freshman in the adjacent hostel block in less than two hours. Real campus networking!"
              </p>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>Aman Verma</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>VIT Bhopal, Block C</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                "I bought reference textbooks and a scientific calculator from a senior in my department. Saved me hundreds of rupees and a trip to the city center."
              </p>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>Neha Sharma</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>BITS Pilani, Room 205</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Footer Section ────────────────────────────────────────────── */}
      <section 
        className="premium-glow-bg" 
        style={{ 
          background: 'rgba(15, 15, 22, 0.7)', 
          borderTop: '1px solid var(--border-color)', 
          padding: '80px 0',
          textAlign: 'center'
        }}
      >
        <div className="container">
          <Logo variant="tagline" size={48} className="mb-4" />
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '24px 0 16px 0' }}>Ready to clean out your room?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px auto', fontSize: '15px' }}>
            List your items or find the best deals inside your campus today.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '10px' }}>
            Get Started Now
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--bg-darker)', borderTop: '1px solid rgba(255, 255, 255, 0.03)', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <Logo variant="icon" size={24} />
            <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>© {new Date().getFullYear()} HostelHub. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/explore" style={{ hover: 'color: #fff' }}>Browse Feed</Link>
            <Link to="/login" style={{ hover: 'color: #fff' }}>Student Portal</Link>
            <Link to="/admin" style={{ hover: 'color: #fff' }}>Moderators</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
