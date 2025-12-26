import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button, CopyButton } from '../../common';
import { generateShareableURL, createShareableState } from '../../../utils/urlState';

/**
 * ShareButton - Generate and share calculation URL
 */
const ShareButton = ({
  state,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  const handleShare = () => {
    const shareableState = createShareableState({
      module: 'subnet-calculator',
      ...state
    });
    const url = generateShareableURL(shareableState);
    setShareUrl(url);
    setIsOpen(true);
  };
  
  const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
  
  return (
    <>
      <Button
        variant="default"
        size="md"
        icon={<ShareIcon />}
        onClick={handleShare}
        className={className}
      >
        Share
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem'
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                zIndex: 1
              }}
            >
              <GlassCard variant="elevated" padding="lg" animate={false}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'white',
                    margin: 0
                  }}>
                    Share Calculation
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '0.5rem',
                      color: '#9ca3af',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  lineHeight: 1.5
                }}>
                  Share this link with colleagues. They'll see the exact same subnet calculation.
                </p>
                
                {/* URL Display */}
                <div style={{
                  position: 'relative',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    padding: '1rem',
                    paddingRight: '5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                    fontSize: '0.75rem',
                    color: '#d1d5db',
                    wordBreak: 'break-all',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {shareUrl}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem'
                  }}>
                    <CopyButton text={shareUrl} variant="both" label="Copy" successLabel="Copied!" />
                  </div>
                </div>
                
                {/* QR Code placeholder */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    QR code generation coming soon
                  </div>
                </div>
                
                {/* Privacy note */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  All data is encoded in the URL. No data is sent to any server.
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;
