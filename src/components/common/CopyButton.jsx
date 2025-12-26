import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CopyButton - Button to copy text to clipboard with feedback
 */
const CopyButton = ({
  text,
  className = '',
  size = 'md', // sm, md, lg
  variant = 'icon', // icon, text, both
  label = 'Copy',
  successLabel = 'Copied!',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      onCopy?.(text);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };
  
  const iconSize = iconSizes[size];
  
  // SVG Icons
  const CopyIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
  
  const CheckIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  
  return (
    <motion.button
      type="button"
      className={`
        glass-button
        ${sizeClasses[size]}
        ${copied ? 'text-green-400 border-green-400/30' : 'text-gray-400'}
        inline-flex items-center gap-2
        transition-colors
        ${className}
      `}
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={copied ? successLabel : label}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <CheckIcon />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CopyIcon />
          </motion.span>
        )}
      </AnimatePresence>
      
      {(variant === 'text' || variant === 'both') && (
        <span className="text-sm">
          {copied ? successLabel : label}
        </span>
      )}
    </motion.button>
  );
};

export default CopyButton;

