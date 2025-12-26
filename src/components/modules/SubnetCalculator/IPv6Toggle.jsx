import React from 'react';
import { motion } from 'framer-motion';

/**
 * IPv6Toggle - Switch between IPv4 and IPv6 modes
 */
const IPv6Toggle = ({
  ipVersion = 'ipv4',
  onChange,
  className = ''
}) => {
  const isIPv6 = ipVersion === 'ipv6';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className={className}>
      <span style={{ 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        color: !isIPv6 ? '#22d3ee' : '#6b7280' 
      }}>
        IPv4
      </span>
      
      <button
        onClick={() => onChange?.(isIPv6 ? 'ipv4' : 'ipv6')}
        style={{
          position: 'relative',
          width: '3.5rem',
          height: '1.75rem',
          borderRadius: '9999px',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer',
          background: isIPv6 
            ? 'linear-gradient(to right, #a855f7, #ec4899)' 
            : 'linear-gradient(to right, #06b6d4, #3b82f6)'
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '4px',
            width: '1.25rem',
            height: '1.25rem',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          animate={{ left: isIPv6 ? 'calc(100% - 24px)' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      
      <span style={{ 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        color: isIPv6 ? '#c084fc' : '#6b7280' 
      }}>
        IPv6
      </span>
    </div>
  );
};

export default IPv6Toggle;

