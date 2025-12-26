/**
 * IPv4 Subnet Calculator Utilities
 * Pure JavaScript implementation for client-side subnet calculations
 */

/**
 * Validate IPv4 address format
 * @param {string} ip - IP address string
 * @returns {boolean} - True if valid
 */
export function isValidIPv4(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Validate CIDR notation (e.g., "10.0.0.0/24")
 * @param {string} cidr - CIDR notation string
 * @returns {boolean} - True if valid
 */
export function isValidCIDR(cidr) {
  if (!cidr || typeof cidr !== 'string') return false;
  
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;
  
  const [ip, prefix] = parts;
  const prefixNum = parseInt(prefix, 10);
  
  return isValidIPv4(ip) && !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 32;
}

/**
 * Convert IP address to 32-bit integer
 * @param {string} ip - IP address string
 * @returns {number} - 32-bit integer representation
 */
export function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Convert 32-bit integer to IP address
 * @param {number} int - 32-bit integer
 * @returns {string} - IP address string
 */
export function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

/**
 * Convert IP address to binary string representation
 * @param {string} ip - IP address string
 * @returns {string} - Binary string with dots (e.g., "00001010.00000000.00000001.00000000")
 */
export function ipToBinary(ip) {
  return ip.split('.').map(octet => 
    parseInt(octet, 10).toString(2).padStart(8, '0')
  ).join('.');
}

/**
 * Calculate subnet mask from prefix length
 * @param {number} prefix - CIDR prefix length (0-32)
 * @returns {string} - Subnet mask in dotted decimal
 */
export function prefixToSubnetMask(prefix) {
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

/**
 * Calculate wildcard mask from prefix length
 * @param {number} prefix - CIDR prefix length (0-32)
 * @returns {string} - Wildcard mask in dotted decimal
 */
export function prefixToWildcard(prefix) {
  const wildcard = prefix === 32 ? 0 : ~((~0 << (32 - prefix)) >>> 0) >>> 0;
  return intToIp(wildcard);
}

/**
 * Calculate network address from IP and prefix
 * @param {string} ip - IP address string
 * @param {number} prefix - CIDR prefix length
 * @returns {string} - Network address
 */
export function getNetworkAddress(ip, prefix) {
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return intToIp((ipInt & mask) >>> 0);
}

/**
 * Calculate broadcast address from IP and prefix
 * @param {string} ip - IP address string
 * @param {number} prefix - CIDR prefix length
 * @returns {string} - Broadcast address
 */
export function getBroadcastAddress(ip, prefix) {
  const networkInt = ipToInt(getNetworkAddress(ip, prefix));
  const hostBits = 32 - prefix;
  const broadcast = hostBits === 0 ? networkInt : (networkInt | ((1 << hostBits) - 1)) >>> 0;
  return intToIp(broadcast);
}

/**
 * Calculate first usable host address (traditional, not cloud-aware)
 * @param {string} ip - IP address string
 * @param {number} prefix - CIDR prefix length
 * @returns {string} - First usable host address
 */
export function getFirstHost(ip, prefix) {
  if (prefix >= 31) {
    return getNetworkAddress(ip, prefix);
  }
  const networkInt = ipToInt(getNetworkAddress(ip, prefix));
  return intToIp(networkInt + 1);
}

/**
 * Calculate last usable host address (traditional, not cloud-aware)
 * @param {string} ip - IP address string
 * @param {number} prefix - CIDR prefix length
 * @returns {string} - Last usable host address
 */
export function getLastHost(ip, prefix) {
  if (prefix >= 31) {
    return getBroadcastAddress(ip, prefix);
  }
  const broadcastInt = ipToInt(getBroadcastAddress(ip, prefix));
  return intToIp(broadcastInt - 1);
}

/**
 * Calculate total number of IP addresses in subnet
 * @param {number} prefix - CIDR prefix length
 * @returns {number} - Total IP count
 */
export function getTotalHosts(prefix) {
  return Math.pow(2, 32 - prefix);
}

/**
 * Calculate traditional usable hosts (total - network - broadcast)
 * @param {number} prefix - CIDR prefix length
 * @returns {number} - Usable host count
 */
export function getUsableHosts(prefix) {
  const total = getTotalHosts(prefix);
  if (prefix >= 31) return total; // /31 and /32 are special cases
  return total - 2;
}

/**
 * Parse CIDR notation into components
 * @param {string} cidr - CIDR notation string
 * @returns {Object} - Parsed components
 */
export function parseCIDR(cidr) {
  if (!isValidCIDR(cidr)) {
    throw new Error('Invalid CIDR notation');
  }
  
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  return {
    ip,
    prefix,
    networkAddress: getNetworkAddress(ip, prefix),
    broadcastAddress: getBroadcastAddress(ip, prefix),
    subnetMask: prefixToSubnetMask(prefix),
    wildcardMask: prefixToWildcard(prefix),
    totalHosts: getTotalHosts(prefix),
    usableHosts: getUsableHosts(prefix),
    firstHost: getFirstHost(ip, prefix),
    lastHost: getLastHost(ip, prefix),
    binary: {
      ip: ipToBinary(ip),
      network: ipToBinary(getNetworkAddress(ip, prefix)),
      mask: ipToBinary(prefixToSubnetMask(prefix))
    }
  };
}

/**
 * Check if an IP is within a given subnet
 * @param {string} ip - IP address to check
 * @param {string} cidr - CIDR notation of subnet
 * @returns {boolean} - True if IP is in subnet
 */
export function isIPInSubnet(ip, cidr) {
  if (!isValidIPv4(ip) || !isValidCIDR(cidr)) return false;
  
  const [subnetIp, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  const networkAddr = getNetworkAddress(subnetIp, prefix);
  const checkNetworkAddr = getNetworkAddress(ip, prefix);
  
  return networkAddr === checkNetworkAddr;
}

/**
 * Check if two subnets overlap
 * @param {string} cidr1 - First CIDR
 * @param {string} cidr2 - Second CIDR
 * @returns {boolean} - True if subnets overlap
 */
export function doSubnetsOverlap(cidr1, cidr2) {
  if (!isValidCIDR(cidr1) || !isValidCIDR(cidr2)) return false;
  
  const [ip1, prefix1Str] = cidr1.split('/');
  const [ip2, prefix2Str] = cidr2.split('/');
  const prefix1 = parseInt(prefix1Str, 10);
  const prefix2 = parseInt(prefix2Str, 10);
  
  // Use the smaller prefix (larger subnet) to check containment
  const smallerPrefix = Math.min(prefix1, prefix2);
  
  const network1 = getNetworkAddress(ip1, smallerPrefix);
  const network2 = getNetworkAddress(ip2, smallerPrefix);
  
  return network1 === network2;
}

/**
 * Split a subnet into smaller subnets
 * @param {string} cidr - Source CIDR
 * @param {number} newPrefix - New prefix length (must be larger than current)
 * @returns {Array<string>} - Array of new subnet CIDRs
 */
export function splitSubnet(cidr, newPrefix) {
  if (!isValidCIDR(cidr)) {
    throw new Error('Invalid CIDR notation');
  }
  
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  if (newPrefix <= prefix || newPrefix > 32) {
    throw new Error('New prefix must be larger than current prefix and <= 32');
  }
  
  const subnets = [];
  const numSubnets = Math.pow(2, newPrefix - prefix);
  const subnetSize = getTotalHosts(newPrefix);
  
  let currentIpInt = ipToInt(getNetworkAddress(ip, prefix));
  
  for (let i = 0; i < numSubnets; i++) {
    subnets.push(`${intToIp(currentIpInt)}/${newPrefix}`);
    currentIpInt += subnetSize;
  }
  
  return subnets;
}

/**
 * Get all possible subnet sizes for display
 * @returns {Array<Object>} - Array of prefix info objects
 */
export function getAllSubnetSizes() {
  const sizes = [];
  
  for (let prefix = 0; prefix <= 32; prefix++) {
    const total = getTotalHosts(prefix);
    const usable = getUsableHosts(prefix);
    const mask = prefixToSubnetMask(prefix);
    
    sizes.push({
      prefix,
      cidr: `/${prefix}`,
      mask,
      totalHosts: total,
      usableHosts: usable,
      description: getSubnetDescription(prefix)
    });
  }
  
  return sizes;
}

/**
 * Get human-readable description for common subnet sizes
 * @param {number} prefix - CIDR prefix
 * @returns {string} - Description
 */
function getSubnetDescription(prefix) {
  const descriptions = {
    8: 'Class A',
    16: 'Class B',
    24: 'Class C',
    25: 'Half Class C',
    26: 'Quarter Class C',
    27: '1/8 Class C',
    28: '1/16 Class C',
    29: '1/32 Class C (8 IPs)',
    30: 'Point-to-Point (4 IPs)',
    31: 'Point-to-Point Link',
    32: 'Single Host'
  };
  
  return descriptions[prefix] || '';
}

/**
 * Generate list of all IPs in a subnet (limited for performance)
 * @param {string} cidr - CIDR notation
 * @param {number} limit - Maximum IPs to return
 * @returns {Array<Object>} - Array of IP objects with metadata
 */
export function listSubnetIPs(cidr, limit = 256) {
  if (!isValidCIDR(cidr)) {
    throw new Error('Invalid CIDR notation');
  }
  
  const parsed = parseCIDR(cidr);
  const ips = [];
  
  const networkInt = ipToInt(parsed.networkAddress);
  const broadcastInt = ipToInt(parsed.broadcastAddress);
  const count = Math.min(parsed.totalHosts, limit);
  
  for (let i = 0; i < count; i++) {
    const currentIp = intToIp(networkInt + i);
    const currentInt = networkInt + i;
    
    let type = 'usable';
    if (currentInt === networkInt) type = 'network';
    else if (currentInt === broadcastInt) type = 'broadcast';
    
    ips.push({
      ip: currentIp,
      type,
      index: i
    });
  }
  
  return ips;
}

/**
 * Get RFC 1918 private IP ranges
 * @returns {Array<Object>} - Private IP range info
 */
export function getPrivateRanges() {
  return [
    { 
      cidr: '10.0.0.0/8', 
      name: 'Class A Private',
      start: '10.0.0.0',
      end: '10.255.255.255',
      totalHosts: getTotalHosts(8)
    },
    { 
      cidr: '172.16.0.0/12', 
      name: 'Class B Private',
      start: '172.16.0.0',
      end: '172.31.255.255',
      totalHosts: getTotalHosts(12)
    },
    { 
      cidr: '192.168.0.0/16', 
      name: 'Class C Private',
      start: '192.168.0.0',
      end: '192.168.255.255',
      totalHosts: getTotalHosts(16)
    }
  ];
}

/**
 * Check if IP is in private range
 * @param {string} ip - IP address
 * @returns {boolean} - True if private
 */
export function isPrivateIP(ip) {
  const privateRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ];
  
  return privateRanges.some(range => isIPInSubnet(ip, range));
}

/**
 * Supernet (aggregate) multiple subnets
 * @param {Array<string>} cidrs - Array of CIDR notations
 * @returns {string|null} - Supernet CIDR or null if not possible
 */
export function supernetSubnets(cidrs) {
  if (!cidrs || cidrs.length === 0) return null;
  if (cidrs.length === 1) return cidrs[0];
  
  // Validate all CIDRs
  if (!cidrs.every(isValidCIDR)) return null;
  
  // Find the minimum prefix that encompasses all
  let minIp = Infinity;
  let maxIp = 0;
  let minPrefix = 32;
  
  cidrs.forEach(cidr => {
    const [ip, prefixStr] = cidr.split('/');
    const prefix = parseInt(prefixStr, 10);
    const networkInt = ipToInt(getNetworkAddress(ip, prefix));
    const broadcastInt = ipToInt(getBroadcastAddress(ip, prefix));
    
    minIp = Math.min(minIp, networkInt);
    maxIp = Math.max(maxIp, broadcastInt);
    minPrefix = Math.min(minPrefix, prefix);
  });
  
  // Calculate required prefix to cover range
  const rangeSize = maxIp - minIp + 1;
  let requiredPrefix = 32 - Math.ceil(Math.log2(rangeSize));
  
  // Ensure network address is valid for this prefix
  const networkAddr = getNetworkAddress(intToIp(minIp), requiredPrefix);
  const networkInt = ipToInt(networkAddr);
  const broadcastInt = ipToInt(getBroadcastAddress(networkAddr, requiredPrefix));
  
  // Check if all original subnets fit
  if (networkInt <= minIp && broadcastInt >= maxIp) {
    return `${networkAddr}/${requiredPrefix}`;
  }
  
  // Try one prefix smaller if needed
  requiredPrefix--;
  if (requiredPrefix >= 0) {
    const newNetworkAddr = getNetworkAddress(intToIp(minIp), requiredPrefix);
    return `${newNetworkAddr}/${requiredPrefix}`;
  }
  
  return null;
}

const ipv4Exports = {
  isValidIPv4,
  isValidCIDR,
  ipToInt,
  intToIp,
  ipToBinary,
  prefixToSubnetMask,
  prefixToWildcard,
  getNetworkAddress,
  getBroadcastAddress,
  getFirstHost,
  getLastHost,
  getTotalHosts,
  getUsableHosts,
  parseCIDR,
  isIPInSubnet,
  doSubnetsOverlap,
  splitSubnet,
  getAllSubnetSizes,
  listSubnetIPs,
  getPrivateRanges,
  isPrivateIP,
  supernetSubnets
};

export default ipv4Exports;

