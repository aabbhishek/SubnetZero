import React from 'react';

/**
 * Badge - Glassmorphic badge/tag component
 */
const Badge = ({
  children,
  className = '',
  variant = 'default', // default, success, warning, error, info
  size = 'md', // sm, md, lg
  icon = null,
  dot = false,
  pulse = false,
}) => {
  const variantClasses = {
    default: 'glass-badge',
    success: 'glass-badge-success',
    warning: 'glass-badge-warning',
    error: 'glass-badge-error',
    info: 'bg-blue-500/15 border-blue-500/30 text-blue-400'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    info: 'bg-blue-400'
  };
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        font-medium
        border
        backdrop-blur-sm
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${dotColors[variant]}
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

