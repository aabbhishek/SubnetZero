import React, { forwardRef } from 'react';

/**
 * Select - Glassmorphic select/dropdown component
 */
const Select = forwardRef(({
  className = '',
  label = '',
  error = '',
  options = [],
  size = 'md', // sm, md, lg
  fullWidth = true,
  onChange,
  value,
  placeholder = 'Select...',
  disabled = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const selectClasses = `
    glass-input
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    appearance-none cursor-pointer
    pr-10
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={`select-wrapper ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="glass-select w-full">
        <select
          ref={ref}
          className={selectClasses}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

