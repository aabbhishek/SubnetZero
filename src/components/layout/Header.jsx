import React from 'react';
import { motion } from 'framer-motion';
import { PrivacyBadge } from '../common';

/**
 * Header - Application header with branding
 */
const Header = ({ onMenuClick, showMenuButton = false }) => {
  // Track desktop state for responsive behavior
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animated Text Logo
  const TextLogo = () => (
    <motion.div 
      style={{ 
        display: 'flex', 
        alignItems: 'baseline',
        gap: '2px',
        cursor: 'pointer'
      }}
      whileHover="hover"
    >
      {/* SUBNET - Outlined text */}
      <motion.span
        style={{
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          color: 'transparent',
          WebkitTextStroke: '1.5px #22d3ee',
          textShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif'
        }}
        variants={{
          hover: {
            textShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
            transition: { duration: 0.3 }
          }
        }}
      >
        Subnet
      </motion.span>
      
      {/* ZERO - Filled with gradient */}
      <motion.span
        style={{
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear'
        }}
        variants={{
          hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
          }
        }}
      >
        Zero
      </motion.span>

      {/* Animated dot/cursor */}
      <motion.span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
          marginLeft: '4px',
          boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );

  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );

  const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '72px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div style={{
        height: '100%',
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mobile menu button - only show on mobile */}
          {showMenuButton && !isDesktop && (
            <button
              onClick={onMenuClick}
              style={{
                padding: '0.5rem',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <MenuIcon />
            </button>
          )}
          
          {/* Text Logo */}
          <a href="/" style={{ textDecoration: 'none' }}>
            <TextLogo />
          </a>
        </div>
        
        {/* Center - Privacy Badge */}
        <div style={{ display: isDesktop ? 'block' : 'none' }}>
          <PrivacyBadge />
        </div>
        
        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Version Badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}>
            v1.0.0
          </span>
          
          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#9ca3af',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="View on GitHub"
          >
            <GithubIcon />
          </a>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
