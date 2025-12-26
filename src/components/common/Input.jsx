import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Input - Glassmorphic input component
 */
const Input = forwardRef(({
  className = '',
  label = '',
  error = '',
  hint = '',
  icon = null,
  iconPosition = 'left',
  size = 'md', // sm, md, lg
  fullWidth = true,
  onChange,
  onBlur,
  value,
  placeholder,
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const inputClasses = `
    glass-input
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={`input-wrapper ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
      </div>
      
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

