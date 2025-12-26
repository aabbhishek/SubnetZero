import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard - Glassmorphic card component with hover effects
 */
const GlassCard = ({
  children,
  className = '',
  variant = 'default', // default, elevated, glow
  padding = 'md', // none, sm, md, lg, xl
  hover = true,
  animate = true,
  onClick,
  style,
  ...props
}) => {
  const cardRef = useRef(null);
  
  // Mouse tracking for glow effect
  useEffect(() => {
    if (variant !== 'glow' || !cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, [variant]);
  
  const paddingValues = {
    none: '0',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  };
  
  const variantClasses = {
    default: 'glass',
    elevated: 'glass-elevated',
    glow: 'glass-glow'
  };
  
  const baseClasses = `
    ${variantClasses[variant]}
    ${hover ? 'hover-lift' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  } : {};
  
  const combinedStyle = {
    padding: paddingValues[padding],
    ...style
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={baseClasses}
      onClick={onClick}
      style={combinedStyle}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

