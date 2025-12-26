/**
 * IPv6 Subnet Calculator Utilities
 * Pure JavaScript implementation for client-side IPv6 calculations
 */

/**
 * Expand abbreviated IPv6 address to full form
 * @param {string} ip - IPv6 address (possibly abbreviated)
 * @returns {string} - Full IPv6 address with all 8 groups
 */
export function expandIPv6(ip) {
  if (!ip || typeof ip !== 'string') return null;
  
  // Remove leading/trailing spaces
  ip = ip.trim().toLowerCase();
  
  // Handle :: expansion
  if (ip.includes('::')) {
    const parts = ip.split('::');
    if (parts.length > 2) return null; // Invalid: more than one ::
    
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    
    const middle = Array(missing).fill('0000');
    const full = [...left, ...middle, ...right];
    
    return full.map(group => group.padStart(4, '0')).join(':');
  }
  
  const groups = ip.split(':');
  if (groups.length !== 8) return null;
  
  return groups.map(group => group.padStart(4, '0')).join(':');
}

/**
 * Compress IPv6 address to shortest form
 * @param {string} ip - Full or partial IPv6 address
 * @returns {string} - Compressed IPv6 address
 */
export function compressIPv6(ip) {
  const expanded = expandIPv6(ip);
  if (!expanded) return null;
  
  // Remove leading zeros from each group
  let groups = expanded.split(':').map(g => g.replace(/^0+/, '') || '0');
  
  // Find longest run of zeros
  let maxStart = -1;
  let maxLen = 0;
  let currentStart = -1;
  let currentLen = 0;
  
  groups.forEach((group, i) => {
    if (group === '0') {
      if (currentStart === -1) currentStart = i;
      currentLen++;
    } else {
      if (currentLen > maxLen && currentLen > 1) {
        maxStart = currentStart;
        maxLen = currentLen;
      }
      currentStart = -1;
      currentLen = 0;
    }
  });
  
  // Check final run
  if (currentLen > maxLen && currentLen > 1) {
    maxStart = currentStart;
    maxLen = currentLen;
  }
  
  // Replace longest zero run with ::
  if (maxStart !== -1) {
    const before = groups.slice(0, maxStart);
    const after = groups.slice(maxStart + maxLen);
    
    if (before.length === 0 && after.length === 0) {
      return '::';
    } else if (before.length === 0) {
      return '::' + after.join(':');
    } else if (after.length === 0) {
      return before.join(':') + '::';
    } else {
      return before.join(':') + '::' + after.join(':');
    }
  }
  
  return groups.join(':');
}

/**
 * Validate IPv6 address format
 * @param {string} ip - IPv6 address string
 * @returns {boolean} - True if valid
 */
export function isValidIPv6(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  // Try to expand - if it works, it's valid
  const expanded = expandIPv6(ip);
  if (!expanded) return false;
  
  // Validate each group
  const groups = expanded.split(':');
  return groups.length === 8 && groups.every(group => /^[0-9a-f]{4}$/i.test(group));
}

/**
 * Validate IPv6 CIDR notation
 * @param {string} cidr - IPv6 CIDR notation (e.g., "2001:db8::/32")
 * @returns {boolean} - True if valid
 */
export function isValidIPv6CIDR(cidr) {
  if (!cidr || typeof cidr !== 'string') return false;
  
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;
  
  const [ip, prefix] = parts;
  const prefixNum = parseInt(prefix, 10);
  
  return isValidIPv6(ip) && !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 128;
}

/**
 * Convert IPv6 to BigInt for calculations
 * @param {string} ip - IPv6 address
 * @returns {BigInt} - 128-bit integer representation
 */
export function ipv6ToBigInt(ip) {
  const expanded = expandIPv6(ip);
  if (!expanded) throw new Error('Invalid IPv6 address');
  
  const hex = expanded.replace(/:/g, '');
  return BigInt('0x' + hex);
}

/**
 * Convert BigInt to IPv6 address
 * @param {BigInt} bigint - 128-bit integer
 * @returns {string} - IPv6 address (compressed)
 */
export function bigIntToIPv6(bigint) {
  const hex = bigint.toString(16).padStart(32, '0');
  const groups = [];
  
  for (let i = 0; i < 32; i += 4) {
    groups.push(hex.slice(i, i + 4));
  }
  
  return compressIPv6(groups.join(':'));
}

/**
 * Get network address from IPv6 CIDR
 * @param {string} ip - IPv6 address
 * @param {number} prefix - Prefix length (0-128)
 * @returns {string} - Network address
 */
export function getIPv6NetworkAddress(ip, prefix) {
  const ipBigInt = ipv6ToBigInt(ip);
  const mask = prefix === 0 ? 0n : (BigInt('0xffffffffffffffffffffffffffffffff') << BigInt(128 - prefix)) & BigInt('0xffffffffffffffffffffffffffffffff');
  const network = ipBigInt & mask;
  
  return bigIntToIPv6(network);
}

/**
 * Get last address in IPv6 subnet
 * @param {string} ip - IPv6 address
 * @param {number} prefix - Prefix length
 * @returns {string} - Last address in subnet
 */
export function getIPv6LastAddress(ip, prefix) {
  const networkBigInt = ipv6ToBigInt(getIPv6NetworkAddress(ip, prefix));
  const hostBits = 128 - prefix;
  const hostMask = hostBits === 0 ? 0n : (1n << BigInt(hostBits)) - 1n;
  const lastAddr = networkBigInt | hostMask;
  
  return bigIntToIPv6(lastAddr);
}

/**
 * Calculate total addresses in IPv6 subnet
 * @param {number} prefix - Prefix length
 * @returns {BigInt} - Total address count
 */
export function getIPv6TotalAddresses(prefix) {
  return 1n << BigInt(128 - prefix);
}

/**
 * Format large BigInt to human-readable string
 * @param {BigInt} num - Large number
 * @returns {string} - Formatted string (e.g., "18.4 quintillion")
 */
export function formatLargeNumber(num) {
  if (num < 1000n) return num.toString();
  
  const units = [
    { value: 10n ** 33n, name: 'decillion' },
    { value: 10n ** 30n, name: 'nonillion' },
    { value: 10n ** 27n, name: 'octillion' },
    { value: 10n ** 24n, name: 'septillion' },
    { value: 10n ** 21n, name: 'sextillion' },
    { value: 10n ** 18n, name: 'quintillion' },
    { value: 10n ** 15n, name: 'quadrillion' },
    { value: 10n ** 12n, name: 'trillion' },
    { value: 10n ** 9n, name: 'billion' },
    { value: 10n ** 6n, name: 'million' },
    { value: 10n ** 3n, name: 'thousand' }
  ];
  
  for (const unit of units) {
    if (num >= unit.value) {
      const value = Number(num * 100n / unit.value) / 100;
      return `${value.toFixed(1)} ${unit.name}`;
    }
  }
  
  return num.toString();
}

/**
 * Parse IPv6 CIDR notation
 * @param {string} cidr - IPv6 CIDR notation
 * @returns {Object} - Parsed components
 */
export function parseIPv6CIDR(cidr) {
  if (!isValidIPv6CIDR(cidr)) {
    throw new Error('Invalid IPv6 CIDR notation');
  }
  
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  const networkAddress = getIPv6NetworkAddress(ip, prefix);
  const lastAddress = getIPv6LastAddress(ip, prefix);
  const totalAddresses = getIPv6TotalAddresses(prefix);
  
  return {
    ip: compressIPv6(ip),
    ipExpanded: expandIPv6(ip),
    prefix,
    networkAddress,
    networkAddressExpanded: expandIPv6(networkAddress),
    lastAddress,
    lastAddressExpanded: expandIPv6(lastAddress),
    totalAddresses,
    totalAddressesFormatted: formatLargeNumber(totalAddresses),
    // For display purposes
    range: `${networkAddress} - ${lastAddress}`,
    // Common subnet info
    subnetInfo: getIPv6SubnetInfo(prefix)
  };
}

/**
 * Get common IPv6 subnet size information
 * @param {number} prefix - Prefix length
 * @returns {Object} - Subnet info
 */
function getIPv6SubnetInfo(prefix) {
  const commonPrefixes = {
    32: { name: 'RIR Minimum Allocation', description: 'Minimum allocation to ISPs' },
    48: { name: 'Site Prefix', description: 'Standard allocation to sites/organizations' },
    56: { name: 'Small Site', description: 'Common residential/small office allocation (AWS VPC)' },
    64: { name: 'Subnet', description: 'Standard subnet size, 18 quintillion addresses' },
    128: { name: 'Single Host', description: 'Single IPv6 address' }
  };
  
  return commonPrefixes[prefix] || { 
    name: `/${prefix} Subnet`,
    description: `Custom ${prefix}-bit prefix`
  };
}

/**
 * Split IPv6 subnet into smaller subnets
 * @param {string} cidr - Source CIDR
 * @param {number} newPrefix - New prefix length
 * @param {number} limit - Maximum subnets to return
 * @returns {Array<Object>} - Array of subnet objects
 */
export function splitIPv6Subnet(cidr, newPrefix, limit = 256) {
  if (!isValidIPv6CIDR(cidr)) {
    throw new Error('Invalid IPv6 CIDR notation');
  }
  
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  if (newPrefix <= prefix || newPrefix > 128) {
    throw new Error('New prefix must be larger than current prefix and <= 128');
  }
  
  const subnets = [];
  const numSubnets = 1n << BigInt(newPrefix - prefix);
  const subnetSize = 1n << BigInt(128 - newPrefix);
  
  let currentIpBigInt = ipv6ToBigInt(getIPv6NetworkAddress(ip, prefix));
  const maxSubnets = BigInt(limit);
  
  for (let i = 0n; i < numSubnets && i < maxSubnets; i++) {
    const subnetAddr = bigIntToIPv6(currentIpBigInt);
    subnets.push({
      cidr: `${subnetAddr}/${newPrefix}`,
      network: subnetAddr,
      networkExpanded: expandIPv6(subnetAddr),
      index: Number(i)
    });
    currentIpBigInt += subnetSize;
  }
  
  return subnets;
}

/**
 * Check if IPv6 is within subnet
 * @param {string} ip - IPv6 address
 * @param {string} cidr - IPv6 CIDR
 * @returns {boolean} - True if in subnet
 */
export function isIPv6InSubnet(ip, cidr) {
  if (!isValidIPv6(ip) || !isValidIPv6CIDR(cidr)) return false;
  
  const [subnetIp, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  const networkAddr = getIPv6NetworkAddress(subnetIp, prefix);
  const checkNetworkAddr = getIPv6NetworkAddress(ip, prefix);
  
  return ipv6ToBigInt(networkAddr) === ipv6ToBigInt(checkNetworkAddr);
}

/**
 * Get common IPv6 address types
 * @param {string} ip - IPv6 address
 * @returns {Object} - Address type info
 */
export function getIPv6AddressType(ip) {
  if (!isValidIPv6(ip)) return { type: 'Invalid', description: 'Invalid IPv6 address' };
  
  const expanded = expandIPv6(ip).toLowerCase();
  const ipBigInt = ipv6ToBigInt(ip);
  
  // Check for specific types
  if (ipBigInt === 0n) {
    return { type: 'Unspecified', description: 'Unspecified address (::)' };
  }
  
  if (ipBigInt === 1n) {
    return { type: 'Loopback', description: 'Loopback address (::1)' };
  }
  
  // Check first few bits/bytes
  const firstGroup = expanded.slice(0, 4);
  
  if (firstGroup >= '2000' && firstGroup <= '3fff') {
    return { type: 'Global Unicast', description: 'Globally routable unicast address' };
  }
  
  if (firstGroup >= 'fc00' && firstGroup <= 'fdff') {
    return { type: 'Unique Local', description: 'Unique Local Address (ULA) - private' };
  }
  
  if (firstGroup >= 'fe80' && firstGroup <= 'febf') {
    return { type: 'Link-Local', description: 'Link-local address (not routable)' };
  }
  
  if (firstGroup >= 'ff00' && firstGroup <= 'ffff') {
    return { type: 'Multicast', description: 'Multicast address' };
  }
  
  // Check for IPv4-mapped
  if (expanded.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    return { type: 'IPv4-Mapped', description: 'IPv4-mapped IPv6 address' };
  }
  
  return { type: 'Reserved/Other', description: 'Reserved or other special address' };
}

/**
 * Generate common IPv6 subnet sizes table
 * @returns {Array<Object>} - Subnet size info
 */
export function getIPv6SubnetSizes() {
  const sizes = [];
  const importantPrefixes = [32, 36, 40, 44, 48, 52, 56, 60, 64, 96, 112, 120, 124, 126, 127, 128];
  
  for (const prefix of importantPrefixes) {
    sizes.push({
      prefix,
      cidr: `/${prefix}`,
      totalAddresses: getIPv6TotalAddresses(prefix),
      totalAddressesFormatted: formatLargeNumber(getIPv6TotalAddresses(prefix)),
      ...getIPv6SubnetInfo(prefix),
      // Number of /64 subnets this can contain
      slash64Count: prefix <= 64 ? formatLargeNumber(1n << BigInt(64 - prefix)) : 'N/A'
    });
  }
  
  return sizes;
}

const ipv6Exports = {
  expandIPv6,
  compressIPv6,
  isValidIPv6,
  isValidIPv6CIDR,
  ipv6ToBigInt,
  bigIntToIPv6,
  getIPv6NetworkAddress,
  getIPv6LastAddress,
  getIPv6TotalAddresses,
  formatLargeNumber,
  parseIPv6CIDR,
  splitIPv6Subnet,
  isIPv6InSubnet,
  getIPv6AddressType,
  getIPv6SubnetSizes
};

export default ipv6Exports;

