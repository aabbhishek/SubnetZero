/**
 * URL State Encoding/Decoding
 * Enables shareable URLs with full calculation state
 * Uses lz-string for compression
 */

// Note: lz-string will be imported when available
// For now, we provide a fallback using base64

/**
 * Compress and encode state to URL-safe string
 * @param {Object} state - State object to encode
 * @returns {string} - Compressed, URL-safe string
 */
export function encodeState(state) {
  try {
    const jsonString = JSON.stringify(state);
    
    // Try to use lz-string if available
    if (typeof window !== 'undefined' && window.LZString) {
      return window.LZString.compressToEncodedURIComponent(jsonString);
    }
    
    // Fallback to base64 encoding
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error('Failed to encode state:', error);
    return '';
  }
}

/**
 * Decode and decompress URL string to state object
 * @param {string} encoded - Encoded string from URL
 * @returns {Object|null} - Decoded state object or null on failure
 */
export function decodeState(encoded) {
  if (!encoded) return null;
  
  try {
    // Try lz-string decompression first
    if (typeof window !== 'undefined' && window.LZString) {
      const decompressed = window.LZString.decompressFromEncodedURIComponent(encoded);
      if (decompressed) {
        return JSON.parse(decompressed);
      }
    }
    
    // Fallback to base64 decoding
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

/**
 * Update URL hash with encoded state
 * @param {Object} state - State to encode in URL
 */
export function updateURLState(state) {
  const encoded = encodeState(state);
  if (encoded) {
    const newURL = `${window.location.pathname}${window.location.search}#${encoded}`;
    window.history.replaceState(null, '', newURL);
  }
}

/**
 * Get state from current URL hash
 * @returns {Object|null} - Decoded state or null
 */
export function getURLState() {
  const hash = window.location.hash.slice(1); // Remove leading #
  return decodeState(hash);
}

/**
 * Generate shareable URL with state
 * @param {Object} state - State to encode
 * @returns {string} - Full shareable URL
 */
export function generateShareableURL(state) {
  const encoded = encodeState(state);
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}#${encoded}`;
}

/**
 * Copy URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(url) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
}

/**
 * Validate URL state structure
 * @param {Object} state - State object to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateState(state) {
  const errors = [];
  
  if (!state || typeof state !== 'object') {
    errors.push('State must be an object');
    return { valid: false, errors };
  }
  
  // Check for expected properties based on module
  if (state.module === 'subnet-calculator') {
    if (state.cidr && typeof state.cidr !== 'string') {
      errors.push('CIDR must be a string');
    }
    if (state.provider && !['aws', 'azure', 'gcp', 'traditional'].includes(state.provider)) {
      errors.push('Invalid provider');
    }
  }
  
  if (state.module === 'vpc-planner') {
    if (state.vpcCidr && typeof state.vpcCidr !== 'string') {
      errors.push('VPC CIDR must be a string');
    }
    if (state.subnets && !Array.isArray(state.subnets)) {
      errors.push('Subnets must be an array');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a state snapshot for sharing
 * @param {Object} fullState - Full application state
 * @returns {Object} - Minimal shareable state
 */
export function createShareableState(fullState) {
  // Only include essential fields to keep URL short
  const shareableFields = [
    'module',
    'cidr',
    'provider',
    'vpcCidr',
    'vpcName',
    'subnets',
    'ipVersion',
    'region'
  ];
  
  const shareable = {};
  
  shareableFields.forEach(field => {
    if (fullState[field] !== undefined) {
      shareable[field] = fullState[field];
    }
  });
  
  // Clean up subnets if present
  if (shareable.subnets) {
    shareable.subnets = shareable.subnets.map(subnet => ({
      name: subnet.name,
      cidr: subnet.cidr,
      tier: subnet.tier,
      az: subnet.az
    }));
  }
  
  return shareable;
}

/**
 * Estimate URL length for given state
 * @param {Object} state - State to check
 * @returns {number} - Approximate URL length
 */
export function estimateURLLength(state) {
  const encoded = encodeState(state);
  const baseLength = window.location.origin.length + window.location.pathname.length + 1; // +1 for #
  return baseLength + encoded.length;
}

/**
 * Check if URL would be too long for sharing
 * @param {Object} state - State to check
 * @param {number} maxLength - Maximum URL length (default 2048 for browser compatibility)
 * @returns {boolean} - True if URL would be too long
 */
export function isURLTooLong(state, maxLength = 2048) {
  return estimateURLLength(state) > maxLength;
}

const urlStateExports = {
  encodeState,
  decodeState,
  updateURLState,
  getURLState,
  generateShareableURL,
  copyToClipboard,
  validateState,
  createShareableState,
  estimateURLLength,
  isURLTooLong
};

export default urlStateExports;

