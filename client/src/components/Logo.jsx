import React from 'react';

/**
 * HostelHub Logo Component.
 * Supports different sizes and variants:
 * - "icon": Just the logo mark (stylized house H)
 * - "full": Logo mark + Text (HostelHub)
 * - "tagline": Logo mark + Text + Tagline (Buy. Sell. Connect.)
 */
const Logo = ({ variant = 'full', size = 40, className = '' }) => {
  const widthMap = {
    icon: size,
    full: size * 3.8,
    tagline: size * 3.8,
  };

  const height = size;
  const width = widthMap[variant] || size;

  return (
    <div 
      className={`flex items-center gap-3 select-none ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        gap: '12px'
      }}
    >
      {/* SVG Icon Logo Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="hostelhub-blue-purple" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d8ff" />
            <stop offset="100%" stopColor="#9d4edd" />
          </linearGradient>
          <linearGradient id="hostelhub-window-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d8ff" />
            <stop offset="100%" stopColor="#9d4edd" />
          </linearGradient>
        </defs>
        
        {/* Left vertical pill of 'H' */}
        <rect x="18" y="15" width="12" height="70" rx="6" fill="url(#hostelhub-blue-purple)" />
        
        {/* Right vertical pill of 'H' */}
        <rect x="70" y="15" width="12" height="70" rx="6" fill="url(#hostelhub-blue-purple)" />
        
        {/* Symmetrical pitched roof connector of 'H' */}
        <path 
          d="M 30,50 L 50,30 L 70,50 L 70,39 L 50,19 L 30,39 Z" 
          fill="url(#hostelhub-blue-purple)" 
        />
        
        {/* 2x2 grid window panes inside the house */}
        <rect x="42" y="55" width="7" height="7" rx="1.5" fill="url(#hostelhub-window-grad)" opacity="0.85" />
        <rect x="51" y="55" width="7" height="7" rx="1.5" fill="url(#hostelhub-window-grad)" opacity="0.85" />
        <rect x="42" y="64" width="7" height="7" rx="1.5" fill="url(#hostelhub-window-grad)" opacity="0.85" />
        <rect x="51" y="64" width="7" height="7" rx="1.5" fill="url(#hostelhub-window-grad)" opacity="0.85" />
      </svg>

      {/* Brand Text for "full" or "tagline" variations */}
      {(variant === 'full' || variant === 'tagline') && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span 
            style={{ 
              fontWeight: 800, 
              fontSize: `${size * 0.52}px`, 
              letterSpacing: '-0.02em', 
              color: '#ffffff'
            }}
          >
            Hostel
            <span 
              style={{ 
                background: 'linear-gradient(90deg, #00d8ff 0%, #9d4edd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginLeft: '1px'
              }}
            >
              Hub
            </span>
          </span>
          {variant === 'tagline' && (
            <span 
              style={{ 
                fontSize: `${size * 0.22}px`, 
                fontWeight: 600, 
                color: 'var(--text-secondary)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}
            >
              Buy. Sell. Connect.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
