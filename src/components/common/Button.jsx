import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button - Glassmorphic button component
 */
const Button = ({
  children,
  className = '',
  variant = 'default', // default, primary, provider
  size = 'md', // sm, md, lg
  provider = null, // aws, azure, gcp (for provider variant)
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    default: 'glass-button',
    primary: 'glass-button glass-button-primary',
    provider: `glass-button`
  };
  
  const baseClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    inline-flex items-center justify-center gap-2
    font-medium transition-all
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };
  
  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      data-provider={provider}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <span className="loading-spinner" style={{ width: 16, height: 16 }} />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="button-icon">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="button-icon">{icon}</span>
      )}
    </motion.button>
  );
};

export default Button;

