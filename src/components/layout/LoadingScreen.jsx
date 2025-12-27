import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingScreen - Themed loading screen with animated subnet visualization
 */
const LoadingScreen = ({ onLoadComplete, minDisplayTime = 2000 }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing');

  const loadingMessages = [
    'Initializing',
    'Loading subnet utilities',
    'Configuring VPC planner',
    'Preparing DHCP builder',
    'Mapping network topology',
    'Almost ready'
  ];

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame;
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDisplayTime) * 100, 100);
      setProgress(newProgress);

      // Update loading message based on progress
      const messageIndex = Math.min(
        Math.floor((newProgress / 100) * loadingMessages.length),
        loadingMessages.length - 1
      );
      setLoadingText(loadingMessages[messageIndex]);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        setIsExiting(true);
        setTimeout(() => {
          onLoadComplete?.();
        }, 500);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [minDisplayTime, onLoadComplete]);

  // Animated network nodes
  const NetworkNode = ({ delay, x, y, size = 8 }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
      }}
    />
  );

  // Animated connection lines
  const ConnectionLine = ({ x1, y1, x2, y2, delay }) => (
    <motion.line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke="url(#lineGradient)"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: [0, 1, 1, 0],
        opacity: [0, 0.5, 0.5, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #12122a 100%)'
          }}
        >
          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '10%',
              left: '20%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '20%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />

          {/* Network visualization */}
          <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Connection lines */}
              <ConnectionLine x1={20} y1={30} x2={40} y2={50} delay={0} />
              <ConnectionLine x1={40} y1={50} x2={60} y2={30} delay={0.3} />
              <ConnectionLine x1={60} y1={30} x2={80} y2={50} delay={0.6} />
              <ConnectionLine x1={30} y1={60} x2={50} y2={70} delay={0.9} />
              <ConnectionLine x1={50} y1={70} x2={70} y2={60} delay={1.2} />
              <ConnectionLine x1={40} y1={50} x2={50} y2={70} delay={1.5} />
            </svg>
            
            {/* Network nodes */}
            <NetworkNode x={20} y={30} delay={0} size={10} />
            <NetworkNode x={40} y={50} delay={0.2} size={12} />
            <NetworkNode x={60} y={30} delay={0.4} size={8} />
            <NetworkNode x={80} y={50} delay={0.6} size={10} />
            <NetworkNode x={30} y={60} delay={0.8} size={6} />
            <NetworkNode x={50} y={70} delay={1} size={14} />
            <NetworkNode x={70} y={60} delay={1.2} size={8} />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            {/* Logo animation */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '2rem'
              }}
            >
              {/* Animated subnet icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '80px',
                  height: '80px',
                  marginRight: '1rem',
                  position: 'relative'
                }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  {/* Outer ring */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="url(#logoGradient)"
                    strokeWidth="2"
                    strokeDasharray="220"
                    initial={{ strokeDashoffset: 220 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                  {/* Inner network grid */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <rect x="25" y="25" width="12" height="12" rx="2" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                    <rect x="43" y="25" width="12" height="12" rx="2" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                    <rect x="25" y="43" width="12" height="12" rx="2" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                    <rect x="43" y="43" width="12" height="12" rx="2" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                    {/* Center dot */}
                    <circle cx="40" cy="40" r="3" fill="url(#logoGradient)" />
                  </motion.g>
                </svg>
              </motion.div>

              {/* Text logo */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: 'transparent',
                    WebkitTextStroke: '2px #22d3ee',
                    textShadow: '0 0 30px rgba(34, 211, 238, 0.4)',
                    fontFamily: '"Outfit", sans-serif',
                    letterSpacing: '-1px'
                  }}
                >
                  Subnet
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: '"Outfit", sans-serif',
                    letterSpacing: '-1px'
                  }}
                >
                  Zero
                </motion.span>
              </div>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                width: '280px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)',
                  borderRadius: '2px',
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
                  transition: 'width 0.1s ease-out'
                }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.div
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontFamily: '"JetBrains Mono", monospace'
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22d3ee'
                }}
              />
              {loadingText}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ...
              </motion.span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                marginTop: '2rem',
                color: '#4b5563',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Cloud-Native Network Engineering
            </motion.p>
          </motion.div>

          {/* Binary/IP stream decoration */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                display: 'flex',
                gap: '2rem',
                color: 'rgba(34, 211, 238, 0.15)',
                fontSize: '0.7rem',
                fontFamily: '"JetBrains Mono", monospace',
                whiteSpace: 'nowrap'
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i}>
                  {['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '255.255.255.0', '0.0.0.0/0'][i % 5]}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;

