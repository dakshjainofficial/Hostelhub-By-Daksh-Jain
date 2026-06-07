import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  MapPin, 
  ArrowLeft, 
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';

const COLLEGE_DOMAINS = {
  'vitbhopal.ac.in': 'VIT Bhopal',
  'vit.ac.in': 'VIT Vellore',
  'vitap.ac.in': 'VIT-AP',
  'bits-pilani.ac.in': 'BITS Pilani',
  'iitb.ac.in': 'IIT Bombay',
  'iitd.ac.in': 'IIT Delhi',
  'iitm.ac.in': 'IIT Madras',
  'iisc.ac.in': 'IISc Bangalore',
  'nit.ac.in': 'NIT',
  'manipal.edu': 'Manipal University',
  'srm.edu.in': 'SRM University',
  'pes.edu': 'PES University',
};

const AuthPage = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hostel, setHostel] = useState('');
  const [detectedCollege, setDetectedCollege] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Set initial mode from URL if provided (e.g. /login vs /register)
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else {
      setMode('login');
    }
    setError('');
    setSuccess('');
  }, [location.pathname]);

  // Auto-detect college from email domain
  useEffect(() => {
    if (mode !== 'register') return;
    
    const parts = email.split('@');
    if (parts.length < 2) {
      setDetectedCollege('');
      return;
    }
    
    const domain = parts[1].toLowerCase().trim();
    if (!domain) {
      setDetectedCollege('');
      return;
    }

    // Exact match
    if (COLLEGE_DOMAINS[domain]) {
      setDetectedCollege(COLLEGE_DOMAINS[domain]);
      return;
    }

    // Subdomain match
    for (const [key, value] of Object.entries(COLLEGE_DOMAINS)) {
      if (domain.endsWith(`.${key}`)) {
        setDetectedCollege(value);
        return;
      }
    }

    // Fallback if domain ends in .ac.in / .edu.in / .edu
    const isCollegeDomain = 
      domain.endsWith('.ac.in') || 
      domain.endsWith('.edu.in') || 
      domain.endsWith('.edu');
      
    if (isCollegeDomain) {
      const dName = domain.split('.')[0].replace(/-/g, ' ');
      setDetectedCollege(dName.charAt(0).toUpperCase() + dName.slice(1) + ' University');
    } else {
      setDetectedCollege('');
    }
  }, [email, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please fill in all fields.');
          setSubmitting(false);
          return;
        }
        const result = await login(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      } else if (mode === 'register') {
        if (!name || !email || !password) {
          setError('Please fill in all required fields.');
          setSubmitting(false);
          return;
        }
        if (!detectedCollege) {
          setError('Please use a valid college email address (e.g. user@vitbhopal.ac.in).');
          setSubmitting(false);
          return;
        }
        const result = await register(name, email, password, hostel);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setError('Please provide your email address.');
          setSubmitting(false);
          return;
        }
        // Mock API response for forgot password
        const res = await fetch('/api/auth/login', { method: 'POST' }); // Check backend heartbeat
        setSuccess('Password reset link sent to your college inbox (Mocked).');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="animate-fade"
      style={{
        minHeight: 'calc(100vh - 76px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          background: 'rgba(18, 18, 26, 0.75)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo variant="icon" size={48} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '16px' }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Student Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {mode === 'login' && 'Access the campus marketplace'}
            {mode === 'register' && 'Connect with your campus buyers & sellers'}
            {mode === 'forgot' && 'Enter your registered college email'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'rgba(244, 63, 94, 0.12)', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              color: '#fda4af',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.12)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              color: '#a7f3d0',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Name (Register Only) */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Aman Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="user@vitbhopal.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '44px' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Auto-detected College Badge */}
            {mode === 'register' && email && (
              <div style={{ marginTop: '8px' }}>
                {detectedCollege ? (
                  <div 
                    className="badge badge-trusted" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '11px',
                      background: 'rgba(0, 216, 255, 0.08)',
                      borderColor: 'rgba(0, 216, 255, 0.25)',
                      color: 'var(--neon-blue)',
                      width: 'fit-content'
                    }}
                  >
                    <Building size={12} /> Verified College: {detectedCollege}
                  </div>
                ) : (
                  <div 
                    style={{ 
                      fontSize: '11px', 
                      color: '#fca5a5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                  >
                    <AlertCircle size={12} /> A waiting valid college domain... (.ac.in / .edu)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password (Login & Register) */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <span 
                    onClick={() => setMode('forgot')}
                    style={{ fontSize: '12px', color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          {/* Hostel (Register Optional) */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Hostel block / Room (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Block C, Room 305"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                />
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {submitting ? 'Authenticating...' : (
              <>
                {mode === 'login' && 'Login to HostelHub'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </>
            )}
          </button>
        </form>

        {/* Card Footer toggle */}
        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
          {mode === 'login' && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              New to HostelHub?{' '}
              <span 
                onClick={() => setMode('register')} 
                style={{ color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign Up
              </span>
            </p>
          )}

          {mode === 'register' && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <span 
                onClick={() => setMode('login')} 
                style={{ color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In
              </span>
            </p>
          )}

          {mode === 'forgot' && (
            <span 
              onClick={() => setMode('login')}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '13px', 
                color: 'var(--neon-blue)', 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <ArrowLeft size={14} /> Back to Login
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
