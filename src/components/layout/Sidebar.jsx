import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sidebar - Navigation sidebar with module links
 */
const Sidebar = ({
  isOpen = true,
  onClose,
  activeModule = 'subnet-calculator',
  onModuleChange,
}) => {
  // Module definitions
  const modules = [
    {
      id: 'subnet-calculator',
      name: 'Subnet Calculator',
      description: 'Cloud-native IP calculator',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
      badge: null,
      available: true
    },
    {
      id: 'vpc-planner',
      name: 'VPC Planner',
      description: 'Visual subnet hierarchy',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="3" />
          <circle cx="5" cy="19" r="3" />
          <circle cx="19" cy="19" r="3" />
          <path d="M12 8v4M8.5 14.5L12 12l3.5 2.5" />
        </svg>
      ),
      badge: null,
      available: true
    },
    {
      id: 'dhcp-builder',
      name: 'DHCP Options',
      description: 'Option 43, 121 TLV Builder',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.01M6 12h.01M6 16h.01M10 8h8M10 12h8M10 16h8" />
        </svg>
      ),
      badge: 'New',
      available: true
    }
  ];

  const handleModuleClick = (moduleId) => {
    if (modules.find(m => m.id === moduleId)?.available) {
      onModuleChange?.(moduleId);
    }
  };

  // Sidebar content
  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module list */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
          <h3 style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: '#6b7280', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Tools
          </h3>
        </div>
        
        {modules.map((module, index) => (
          <motion.button
            key={module.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleModuleClick(module.id)}
            disabled={!module.available}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              textAlign: 'left',
              transition: 'all 0.2s',
              background: activeModule === module.id
                ? 'linear-gradient(to right, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))'
                : 'transparent',
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              borderLeftWidth: '2px',
              borderLeftStyle: 'solid',
              borderLeftColor: activeModule === module.id ? '#22d3ee' : 'transparent',
              opacity: !module.available ? 0.5 : 1,
              cursor: !module.available ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{ 
              marginTop: '2px',
              color: activeModule === module.id ? '#22d3ee' : '#9ca3af'
            }}>
              {module.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontWeight: 500, 
                  fontSize: '0.875rem',
                  color: activeModule === module.id ? 'white' : '#d1d5db'
                }}>
                  {module.name}
                </span>
                {module.badge && (
                  <span style={{
                    padding: '0.125rem 0.375rem',
                    fontSize: '10px',
                    fontWeight: 500,
                    borderRadius: '0.25rem',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc'
                  }}>
                    {module.badge}
                  </span>
                )}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }}>
                {module.description}
              </span>
            </div>
          </motion.button>
        ))}
      </nav>
      
      {/* Footer */}
      <div style={{ 
        padding: '1rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)' 
      }}>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          background: 'linear-gradient(to right, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 500, color: '#22d3ee' }}>Open Source</span>
            <br />
            Built for network engineers & DevOps teams. Contribute on GitHub.
          </p>
        </div>
      </div>
    </div>
  );

  // Check if we're on desktop (this will be updated by resize)
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

  return (
    <>
      {/* Desktop Sidebar - always visible on large screens */}
      {isDesktop && (
        <aside 
          style={{
            position: 'fixed',
            left: 0,
            top: '72px',
            bottom: 0,
            width: '280px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            zIndex: 40,
            overflowY: 'auto'
          }}
        >
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Sidebar Overlay - only on small screens when open */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 40
              }}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '280px',
                backgroundColor: '#0a0a1a',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 50
              }}
            >
              {/* Close button */}
              <div style={{
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ fontWeight: 700, color: 'white' }}>Menu</span>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.5rem',
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

