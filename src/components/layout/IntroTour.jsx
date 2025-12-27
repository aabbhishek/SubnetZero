import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IntroTour - Simple product introduction with popup cards
 */
const IntroTour = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Tour steps configuration
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to SubnetZero',
      description: 'Your cloud-native subnet calculator with AWS, Azure, and GCP awareness. Let\'s take a quick tour of the features!',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      id: 'subnet-calculator',
      title: 'Subnet Calculator',
      description: 'Calculate subnets with cloud provider awareness. See accurate usable host counts based on each provider\'s reserved IPs.',
      features: [
        'Cloud Provider Selection (AWS, Azure, GCP)',
        'IPv4 and IPv6 Support',
        'Instant CIDR calculations',
        'Export to Terraform, CloudFormation'
      ],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 7h.01M7 12h10M7 17h6" />
        </svg>
      )
    },
    {
      id: 'vpc-planner',
      title: 'VPC Planner',
      description: 'Plan your VPC architecture visually. Configure CIDR, add subnets, and track IP utilization in real-time.',
      features: [
        'VPC Configuration (Name, CIDR, Region)',
        'Visual Subnet Hierarchy',
        'Automatic CIDR Suggestions',
        'IP Utilization Tracking'
      ],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad3)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="5" r="3" />
          <circle cx="5" cy="19" r="3" />
          <circle cx="19" cy="19" r="3" />
          <path d="M12 8v4M8.5 14.5L12 12l3.5 2.5" />
        </svg>
      )
    },
    {
      id: 'dhcp-builder',
      title: 'DHCP Option Builder',
      description: 'Build DHCP configurations with an intuitive interface. Create vendor options (Option 43) and static routes (Option 121).',
      features: [
        'Standard Options (DNS, Gateway)',
        'Option 43 - Vendor Specific TLV',
        'Option 121 - Static Routes',
        'Multiple Export Formats'
      ],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad4)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.01M6 12h.01M6 16h.01M10 8h8M10 12h8M10 16h8" />
        </svg>
      )
    },
    {
      id: 'ready',
      title: 'You\'re All Set! 🚀',
      description: 'Start calculating subnets, planning VPCs, or building DHCP options. Access tools from the sidebar. Your data stays private!',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad5)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('subnetZero_introCompleted', 'true');
    setIsVisible(false);
    setTimeout(() => onSkip?.(), 300);
  }, [onSkip]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('subnetZero_introCompleted', 'true');
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  }, [onComplete]);

  const cardStyles = {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(34, 211, 238, 0.2)',
    borderRadius: '20px',
    boxShadow: `
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(34, 211, 238, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 5, 16, 0.9)',
            padding: '1rem'
          }}
          onClick={handleSkip}
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              ...cardStyles,
              width: '420px',
              maxWidth: 'calc(100% - 2rem)',
              maxHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              padding: '1.5rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glow line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '15%',
              right: '15%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), rgba(168, 85, 247, 0.5), transparent)',
              borderRadius: '1px'
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.15)'
                }}
              >
                {currentStepData.icon}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px'
                }}>
                  {currentStep + 1}/{steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '0.85rem',
              color: '#9ca3af',
              lineHeight: 1.6,
              marginBottom: currentStepData.features ? '0.85rem' : '1rem'
            }}>
              {currentStepData.description}
            </p>

            {/* Features list (if available) */}
            {currentStepData.features && (
              <div style={{
                background: 'rgba(34, 211, 238, 0.05)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                border: '1px solid rgba(34, 211, 238, 0.1)'
              }}>
                <ul style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  {currentStepData.features.map((feature, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#d1d5db'
                      }}
                    >
                      <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
                        flexShrink: 0
                      }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.4rem',
              marginBottom: '1rem'
            }}>
              {steps.map((_, index) => (
                <button
                  key={index}
                  style={{
                    width: index === currentStep ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: index === currentStep
                      ? 'linear-gradient(90deg, #22d3ee, #a855f7)'
                      : index < currentStep
                        ? 'rgba(34, 211, 238, 0.4)'
                        : 'rgba(255, 255, 255, 0.15)'
                  }}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              gap: '0.6rem',
              justifyContent: 'center'
            }}>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                style={{
                  padding: '0.5rem 1.2rem',
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.5)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)'
                }}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Keyboard hint */}
            <div
              style={{
                marginTop: '0.85rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                fontSize: '0.65rem',
                color: '#4b5563'
              }}
            >
              <span>
                <kbd style={{
                  padding: '0.1rem 0.3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  fontSize: '0.6rem',
                  marginRight: '0.2rem'
                }}>←</kbd>
                <kbd style={{
                  padding: '0.1rem 0.3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  fontSize: '0.6rem'
                }}>→</kbd>
                {' '}navigate
              </span>
              <span>
                <kbd style={{
                  padding: '0.1rem 0.3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  fontSize: '0.6rem'
                }}>Esc</kbd>
                {' '}skip
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroTour;
