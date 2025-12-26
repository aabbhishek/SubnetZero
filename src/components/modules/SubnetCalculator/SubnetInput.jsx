import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { isValidCIDR, parseCIDR, getNetworkAddress } from '../../../utils/ipv4';
import { isValidIPv6CIDR, parseIPv6CIDR } from '../../../utils/ipv6';

/**
 * SubnetInput - CIDR input with live validation
 */
const SubnetInput = ({
  value = '',
  onChange,
  onValidChange,
  ipVersion = 'ipv4',
  placeholder,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const isUserTyping = useRef(false);
  
  const defaultPlaceholder = ipVersion === 'ipv4' 
    ? '10.0.0.0/16' 
    : '2600:1f18::/56';
  
  // Only sync from parent when it's an external change (URL load, IP version change)
  // Don't sync when user is actively typing
  useEffect(() => {
    if (!isUserTyping.current) {
      setInputValue(value);
    }
  }, [value]);
  
  // Reset when IP version changes
  useEffect(() => {
    setInputValue('');
    setError('');
    setIsValid(false);
  }, [ipVersion]);
  
  const validateAndUpdate = (newValue, fromPreset = false) => {
    // Mark as user typing unless it's from a preset
    if (!fromPreset) {
      isUserTyping.current = true;
    }
    
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      setError('');
      setIsValid(false);
      onChange?.(newValue);
      onValidChange?.(null);
      isUserTyping.current = false;
      return;
    }
    
    try {
      let parsed;
      let valid;
      
      if (ipVersion === 'ipv4') {
        valid = isValidCIDR(newValue);
        if (valid) {
          parsed = parseCIDR(newValue);
          // Calculate network address for the parent (used in calculations)
          const networkAddr = getNetworkAddress(parsed.ip, parsed.prefix);
          const normalized = `${networkAddr}/${parsed.prefix}`;
          
          setError('');
          setIsValid(true);
          // Send normalized to parent for calculations, but keep user's input displayed
          onChange?.(normalized);
          onValidChange?.({ ...parsed, cidr: normalized, userInput: newValue });
          
          // Reset typing flag after a short delay to allow state to settle
          setTimeout(() => { isUserTyping.current = false; }, 100);
        } else {
          throw new Error('Invalid IPv4 CIDR notation');
        }
      } else {
        valid = isValidIPv6CIDR(newValue);
        if (valid) {
          parsed = parseIPv6CIDR(newValue);
          
          setError('');
          setIsValid(true);
          onChange?.(newValue);
          onValidChange?.(parsed);
          
          setTimeout(() => { isUserTyping.current = false; }, 100);
        } else {
          throw new Error('Invalid IPv6 CIDR notation');
        }
      }
    } catch (err) {
      setError(getErrorMessage(newValue, ipVersion));
      setIsValid(false);
      onChange?.(newValue);
      onValidChange?.(null);
      isUserTyping.current = false;
    }
  };
  
  const getErrorMessage = (value, version) => {
    if (version === 'ipv4') {
      if (!value.includes('/')) {
        return 'Missing prefix (e.g., /24)';
      }
      const [ip, prefix] = value.split('/');
      const octets = ip.split('.');
      if (octets.length !== 4) {
        return 'IPv4 requires 4 octets';
      }
      const invalidOctet = octets.find(o => {
        const num = parseInt(o, 10);
        return isNaN(num) || num < 0 || num > 255;
      });
      if (invalidOctet !== undefined) {
        return 'Octets must be 0-255';
      }
      const prefixNum = parseInt(prefix, 10);
      if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) {
        return 'Prefix must be 0-32';
      }
      return 'Invalid CIDR format';
    } else {
      if (!value.includes('/')) {
        return 'Missing prefix (e.g., /64)';
      }
      const [, prefix] = value.split('/');
      const prefixNum = parseInt(prefix, 10);
      if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 128) {
        return 'Prefix must be 0-128';
      }
      return 'Invalid IPv6 CIDR format';
    }
  };
  
  // Common CIDR presets
  const presets = ipVersion === 'ipv4' 
    ? [
        { label: '/16', prefix: 16, defaultCidr: '10.0.0.0/16', desc: '65,536 IPs' },
        { label: '/24', prefix: 24, defaultCidr: '10.0.1.0/24', desc: '256 IPs' },
        { label: '/26', prefix: 26, defaultCidr: '10.0.1.0/26', desc: '64 IPs' },
        { label: '/28', prefix: 28, defaultCidr: '10.0.1.0/28', desc: '16 IPs' },
      ]
    : [
        { label: '/48', prefix: 48, defaultCidr: '2001:db8::/48', desc: 'Site' },
        { label: '/56', prefix: 56, defaultCidr: '2001:db8::/56', desc: 'Small site' },
        { label: '/64', prefix: 64, defaultCidr: '2001:db8::/64', desc: 'Subnet' },
      ];
  
  // Handle preset click - preserve user's IP if they've entered one
  const handlePresetClick = (preset) => {
    // Check if user has entered an IP address
    const currentIP = inputValue.split('/')[0].trim();
    
    if (currentIP && currentIP.length > 0) {
      // User has entered an IP, just change the prefix
      const newCidr = `${currentIP}/${preset.prefix}`;
      validateAndUpdate(newCidr, true);
    } else {
      // No IP entered, use the default preset CIDR
      validateAndUpdate(preset.defaultCidr, true);
    }
  };
  
  return (
    <div className={className}>
      <div style={{ position: 'relative' }}>
        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => validateAndUpdate(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            paddingRight: '3.5rem',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '2px solid',
            borderRadius: '1rem',
            outline: 'none',
            transition: 'all 0.2s',
            borderColor: isValid 
              ? 'rgba(34, 197, 94, 0.5)' 
              : error 
                ? 'rgba(239, 68, 68, 0.5)' 
                : 'rgba(255, 255, 255, 0.1)',
            color: isValid 
              ? '#4ade80' 
              : error 
                ? '#f87171' 
                : 'white',
            boxShadow: isValid 
              ? '0 10px 15px -3px rgba(34, 197, 94, 0.1)' 
              : error 
                ? '0 10px 15px -3px rgba(239, 68, 68, 0.1)' 
                : 'none'
          }}
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
        />
        
        {/* Status icon */}
        <div style={{ 
          position: 'absolute', 
          right: '1rem', 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}>
          {isValid ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.div>
          ) : null}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </motion.p>
      )}
      
      {/* Quick presets */}
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>Quick:</span>
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#9ca3af',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.color = '#9ca3af';
            }}
          >
            <span style={{ fontWeight: 500 }}>{preset.label}</span>
            <span style={{ color: '#4b5563' }}>{preset.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubnetInput;

