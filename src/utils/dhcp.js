/**
 * DHCP Option Utilities
 * Handles TLV encoding, hex conversion, and DHCP option formatting
 */

// ============================================
// IP Address Utilities
// ============================================

/**
 * Convert IP address string to bytes array
 */
export const ipToBytes = (ip) => {
  if (!ip || typeof ip !== 'string') return [0, 0, 0, 0];
  const parts = ip.split('.');
  if (parts.length !== 4) return [0, 0, 0, 0];
  return parts.map(octet => parseInt(octet, 10) || 0);
};

/**
 * Convert bytes array to IP address string
 */
export const bytesToIp = (bytes) => {
  return bytes.join('.');
};

/**
 * Convert IP address to hex string
 */
export const ipToHex = (ip) => {
  return ipToBytes(ip)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':');
};

/**
 * Validate IP address
 */
export const isValidIP = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
};

// ============================================
// Hex Encoding Utilities
// ============================================

/**
 * Convert number to hex byte
 */
export const toHexByte = (num) => {
  if (num === undefined || num === null) return '00';
  return num.toString(16).padStart(2, '0');
};

/**
 * Convert bytes array to hex string with separator
 */
export const bytesToHex = (bytes, separator = ':') => {
  if (!bytes || !Array.isArray(bytes) || bytes.length === 0) return '';
  return bytes.filter(b => b !== undefined && b !== null).map(b => toHexByte(b)).join(separator);
};

/**
 * Parse hex string to bytes array
 */
export const hexToBytes = (hex) => {
  const clean = hex.replace(/[:\s]/g, '');
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substr(i, 2), 16));
  }
  return bytes;
};

// ============================================
// TLV (Type-Length-Value) Encoding
// ============================================

/**
 * Encode a single TLV
 */
export const encodeTLV = (type, value) => {
  const typeBytes = [type];
  const lengthBytes = [value.length];
  return [...typeBytes, ...lengthBytes, ...value];
};

/**
 * Decode TLV bytes to structured data
 */
export const decodeTLV = (bytes) => {
  const result = [];
  let i = 0;
  while (i < bytes.length) {
    const type = bytes[i];
    const length = bytes[i + 1];
    const value = bytes.slice(i + 2, i + 2 + length);
    result.push({ type, length, value });
    i += 2 + length;
  }
  return result;
};

// ============================================
// Option 43 - Vendor Specific Templates
// ============================================

export const VENDOR_TEMPLATES = {
  ciscoWLC: {
    id: 'ciscoWLC',
    name: 'Cisco WLC (Wireless Controller)',
    description: 'Cisco Wireless LAN Controller discovery',
    subOptionType: 241, // 0xf1
    fields: [
      { id: 'controllerIPs', name: 'Controller IPs', type: 'ip-list', required: true }
    ],
    encode: (config) => {
      const bytes = [];
      (config.controllerIPs || []).forEach(ip => {
        if (isValidIP(ip)) {
          bytes.push(241); // Type
          bytes.push(4);   // Length (IPv4 = 4 bytes)
          bytes.push(...ipToBytes(ip));
        }
      });
      return bytes;
    }
  },
  
  arubaController: {
    id: 'arubaController',
    name: 'Aruba Controller',
    description: 'Aruba wireless controller discovery',
    fields: [
      { id: 'controllerIPs', name: 'Controller IPs', type: 'ip-list', required: true }
    ],
    encode: (config) => {
      const bytes = [];
      // Aruba uses sub-option 1 for controller IP
      (config.controllerIPs || []).forEach(ip => {
        if (isValidIP(ip)) {
          bytes.push(1);   // Sub-option type
          bytes.push(4);   // Length
          bytes.push(...ipToBytes(ip));
        }
      });
      return bytes;
    }
  },
  
  ubiquitiUnifi: {
    id: 'ubiquitiUnifi',
    name: 'Ubiquiti UniFi',
    description: 'UniFi controller discovery',
    fields: [
      { id: 'controllerUrl', name: 'Controller URL', type: 'string', required: true, placeholder: 'http://unifi.local:8080/inform' }
    ],
    encode: (config) => {
      const url = config.controllerUrl || '';
      const bytes = [];
      // UniFi uses sub-option 1 with URL string
      bytes.push(1);
      bytes.push(url.length);
      for (let i = 0; i < url.length; i++) {
        bytes.push(url.charCodeAt(i));
      }
      return bytes;
    }
  },
  
  meraki: {
    id: 'meraki',
    name: 'Cisco Meraki',
    description: 'Meraki cloud controller',
    fields: [
      { id: 'controllerIPs', name: 'Controller IPs', type: 'ip-list', required: true }
    ],
    encode: (config) => {
      const bytes = [];
      (config.controllerIPs || []).forEach(ip => {
        if (isValidIP(ip)) {
          bytes.push(1);   // Type
          bytes.push(4);   // Length
          bytes.push(...ipToBytes(ip));
        }
      });
      return bytes;
    }
  },
  
  polycomPhones: {
    id: 'polycomPhones',
    name: 'Polycom Phones',
    description: 'Polycom VoIP phone provisioning',
    fields: [
      { id: 'provisioningUrl', name: 'Provisioning Server URL', type: 'string', required: true, placeholder: 'http://provisioning.example.com' }
    ],
    encode: (config) => {
      const url = config.provisioningUrl || '';
      const bytes = [];
      for (let i = 0; i < url.length; i++) {
        bytes.push(url.charCodeAt(i));
      }
      return bytes;
    }
  },
  
  custom: {
    id: 'custom',
    name: 'Custom TLV',
    description: 'Define custom TLV encoding',
    fields: [
      { id: 'entries', name: 'TLV Entries', type: 'tlv-list', required: true }
    ],
    encode: (config) => {
      const bytes = [];
      (config.entries || []).forEach(entry => {
        bytes.push(entry.type);
        bytes.push(entry.value.length);
        bytes.push(...entry.value);
      });
      return bytes;
    }
  }
};

// ============================================
// Option 121 - Classless Static Routes
// ============================================

/**
 * Encode a single route for Option 121
 * Format: prefix-length + significant-octets + gateway
 */
export const encodeRoute121 = (destination, prefix, gateway) => {
  if (!destination || prefix === undefined || !gateway) {
    return [];
  }
  
  const bytes = [];
  
  // Add prefix length
  bytes.push(prefix);
  
  // Calculate significant octets (ceil of prefix/8)
  const significantOctets = Math.ceil(prefix / 8);
  
  // Add only the significant octets of the destination
  const destBytes = ipToBytes(destination);
  if (!destBytes || destBytes.length !== 4) {
    return [];
  }
  
  for (let i = 0; i < significantOctets; i++) {
    bytes.push(destBytes[i] || 0);
  }
  
  // Add full gateway
  const gwBytes = ipToBytes(gateway);
  if (!gwBytes || gwBytes.length !== 4) {
    return [];
  }
  bytes.push(...gwBytes);
  
  return bytes;
};

/**
 * Encode multiple routes for Option 121
 */
export const encodeOption121 = (routes) => {
  if (!routes || !Array.isArray(routes)) return [];
  
  const bytes = [];
  routes.forEach(route => {
    if (!route || !route.gateway) return;
    
    // Handle both formats: { destination, prefix, gateway } and { destination: "x.x.x.x/y", gateway }
    let dest = route.destination || '';
    let prefix = route.prefix;
    
    // If destination contains CIDR notation, extract prefix
    if (dest.includes('/')) {
      const parts = dest.split('/');
      dest = parts[0];
      prefix = parseInt(parts[1], 10);
    }
    
    if (!dest || prefix === undefined || isNaN(prefix)) return;
    
    try {
      bytes.push(...encodeRoute121(dest, prefix, route.gateway));
    } catch (e) {
      console.warn('Failed to encode route:', route, e);
    }
  });
  return bytes;
};

/**
 * Decode Option 121 bytes to routes
 */
export const decodeOption121 = (bytes) => {
  const routes = [];
  let i = 0;
  
  while (i < bytes.length) {
    const prefix = bytes[i++];
    const significantOctets = Math.ceil(prefix / 8);
    
    // Read destination octets
    const destBytes = [0, 0, 0, 0];
    for (let j = 0; j < significantOctets; j++) {
      destBytes[j] = bytes[i++];
    }
    
    // Read gateway
    const gatewayBytes = bytes.slice(i, i + 4);
    i += 4;
    
    routes.push({
      destination: bytesToIp(destBytes),
      prefix,
      gateway: bytesToIp(gatewayBytes)
    });
  }
  
  return routes;
};

// ============================================
// Option 119 - Domain Search List
// ============================================

/**
 * Encode domain name for Option 119 (DNS compression format)
 */
export const encodeDomainName = (domain) => {
  const bytes = [];
  const parts = domain.split('.');
  
  parts.forEach(part => {
    bytes.push(part.length);
    for (let i = 0; i < part.length; i++) {
      bytes.push(part.charCodeAt(i));
    }
  });
  
  bytes.push(0); // Null terminator
  return bytes;
};

/**
 * Encode Option 119 with multiple domains
 */
export const encodeOption119 = (domains) => {
  const bytes = [];
  domains.forEach(domain => {
    bytes.push(...encodeDomainName(domain));
  });
  return bytes;
};

// ============================================
// Standard DHCP Options
// ============================================

export const STANDARD_OPTIONS = {
  1: { name: 'Subnet Mask', type: 'ip', description: 'Subnet mask for the network' },
  3: { name: 'Router/Gateway', type: 'ip-list', description: 'Default gateway(s)' },
  6: { name: 'DNS Servers', type: 'ip-list', description: 'Domain name servers' },
  15: { name: 'Domain Name', type: 'string', description: 'Domain name for client' },
  42: { name: 'NTP Servers', type: 'ip-list', description: 'Network time protocol servers' },
  43: { name: 'Vendor Specific', type: 'vendor', description: 'Vendor-specific options' },
  51: { name: 'Lease Time', type: 'uint32', description: 'IP address lease time in seconds' },
  66: { name: 'TFTP Server', type: 'string', description: 'TFTP server name (PXE boot)' },
  67: { name: 'Boot Filename', type: 'string', description: 'Boot file name (PXE boot)' },
  119: { name: 'Domain Search', type: 'domain-list', description: 'Domain search list' },
  121: { name: 'Classless Routes', type: 'routes', description: 'Classless static routes (RFC 3442)' }
};

/**
 * Encode a standard option value
 */
export const encodeOptionValue = (optionCode, value, type) => {
  switch (type) {
    case 'ip':
      return isValidIP(value) ? ipToBytes(value) : [];
    
    case 'ip-list':
      return (Array.isArray(value) ? value : [value])
        .filter(isValidIP)
        .flatMap(ipToBytes);
    
    case 'string':
      const strBytes = [];
      for (let i = 0; i < (value || '').length; i++) {
        strBytes.push(value.charCodeAt(i));
      }
      return strBytes;
    
    case 'uint32':
      const num = parseInt(value, 10) || 0;
      return [
        (num >> 24) & 0xff,
        (num >> 16) & 0xff,
        (num >> 8) & 0xff,
        num & 0xff
      ];
    
    case 'domain-list':
      return encodeOption119(Array.isArray(value) ? value : [value]);
    
    case 'routes':
      return encodeOption121(value || []);
    
    default:
      return [];
  }
};

// ============================================
// Config Export Generators
// ============================================

export const DHCP_SERVER_TYPES = {
  iscDhcp: {
    id: 'iscDhcp',
    name: 'ISC DHCP',
    extension: '.conf',
    description: 'ISC DHCP Server (dhcpd.conf)'
  },
  keaDhcp: {
    id: 'keaDhcp',
    name: 'Kea DHCP',
    extension: '.json',
    description: 'ISC Kea DHCP (JSON)'
  },
  dnsmasq: {
    id: 'dnsmasq',
    name: 'dnsmasq',
    extension: '.conf',
    description: 'dnsmasq configuration'
  },
  windowsDhcp: {
    id: 'windowsDhcp',
    name: 'Windows DHCP',
    extension: '.ps1',
    description: 'Windows Server DHCP (PowerShell)'
  },
  ciscoIos: {
    id: 'ciscoIos',
    name: 'Cisco IOS',
    extension: '.txt',
    description: 'Cisco IOS DHCP pool'
  },
  rawHex: {
    id: 'rawHex',
    name: 'Raw Hex',
    extension: '.txt',
    description: 'Raw hex values for any system'
  }
};

/**
 * Generate ISC DHCP configuration
 */
export const generateIscDhcp = (config) => {
  const lines = [];
  const { subnet, netmask, rangeStart, rangeEnd, gateway, dns, domain, leaseTime, options } = config;
  
  lines.push(`# Generated by Subnet Zero - DHCP Option Builder`);
  lines.push(`# ISC DHCP Server Configuration`);
  lines.push(``);
  lines.push(`subnet ${subnet} netmask ${netmask} {`);
  
  if (rangeStart && rangeEnd) {
    lines.push(`    range ${rangeStart} ${rangeEnd};`);
  }
  
  if (gateway) {
    lines.push(`    option routers ${Array.isArray(gateway) ? gateway.join(', ') : gateway};`);
  }
  
  if (dns && dns.length > 0) {
    lines.push(`    option domain-name-servers ${dns.join(', ')};`);
  }
  
  if (domain) {
    lines.push(`    option domain-name "${domain}";`);
  }
  
  if (leaseTime) {
    lines.push(`    default-lease-time ${leaseTime};`);
    lines.push(`    max-lease-time ${Math.floor(leaseTime * 1.5)};`);
  }
  
  // Option 43
  if (options?.option43?.length > 0) {
    const hex = bytesToHex(options.option43, ':');
    lines.push(``);
    lines.push(`    # Option 43 - Vendor Specific`);
    lines.push(`    option vendor-encapsulated-options ${hex};`);
  }
  
  // Option 121
  if (options?.option121?.length > 0) {
    const hex = bytesToHex(encodeOption121(options.option121), ':');
    lines.push(``);
    lines.push(`    # Option 121 - Classless Static Routes`);
    lines.push(`    option rfc3442-classless-static-routes ${hex};`);
  }
  
  // Option 119
  if (options?.option119?.length > 0) {
    const hex = bytesToHex(encodeOption119(options.option119), ':');
    lines.push(``);
    lines.push(`    # Option 119 - Domain Search List`);
    lines.push(`    option domain-search ${hex};`);
  }
  
  lines.push(`}`);
  
  return lines.join('\n');
};

/**
 * Generate Kea DHCP configuration (JSON)
 */
export const generateKeaDhcp = (config) => {
  const { subnet, netmask, rangeStart, rangeEnd, gateway, dns, domain, leaseTime, options } = config;
  
  // Calculate prefix from netmask
  const prefix = netmask.split('.').reduce((acc, octet) => {
    return acc + (parseInt(octet, 10).toString(2).match(/1/g) || []).length;
  }, 0);
  
  const keaConfig = {
    "Dhcp4": {
      "subnet4": [{
        "subnet": `${subnet}/${prefix}`,
        "pools": rangeStart && rangeEnd ? [{ "pool": `${rangeStart} - ${rangeEnd}` }] : [],
        "option-data": []
      }]
    }
  };
  
  const optionData = keaConfig.Dhcp4.subnet4[0]["option-data"];
  
  if (gateway) {
    optionData.push({
      "name": "routers",
      "data": Array.isArray(gateway) ? gateway.join(', ') : gateway
    });
  }
  
  if (dns && dns.length > 0) {
    optionData.push({
      "name": "domain-name-servers",
      "data": dns.join(', ')
    });
  }
  
  if (domain) {
    optionData.push({
      "name": "domain-name",
      "data": domain
    });
  }
  
  if (leaseTime) {
    keaConfig.Dhcp4.subnet4[0]["valid-lifetime"] = leaseTime;
  }
  
  if (options?.option43?.length > 0) {
    optionData.push({
      "code": 43,
      "data": bytesToHex(options.option43, '')
    });
  }
  
  return JSON.stringify(keaConfig, null, 2);
};

/**
 * Generate dnsmasq configuration
 */
export const generateDnsmasq = (config) => {
  const lines = [];
  const { subnet, netmask, rangeStart, rangeEnd, gateway, dns, domain, leaseTime, options } = config;
  
  lines.push(`# Generated by Subnet Zero - DHCP Option Builder`);
  lines.push(`# dnsmasq Configuration`);
  lines.push(``);
  
  if (rangeStart && rangeEnd) {
    const leaseStr = leaseTime ? `${Math.floor(leaseTime / 3600)}h` : '12h';
    lines.push(`dhcp-range=${rangeStart},${rangeEnd},${netmask},${leaseStr}`);
  }
  
  if (gateway) {
    lines.push(`dhcp-option=3,${Array.isArray(gateway) ? gateway[0] : gateway}`);
  }
  
  if (dns && dns.length > 0) {
    lines.push(`dhcp-option=6,${dns.join(',')}`);
  }
  
  if (domain) {
    lines.push(`dhcp-option=15,${domain}`);
  }
  
  if (options?.option43?.length > 0) {
    const hex = bytesToHex(options.option43, ':');
    lines.push(`dhcp-option=43,${hex}`);
  }
  
  if (options?.option121?.length > 0) {
    const routes = options.option121;
    routes.forEach(route => {
      lines.push(`dhcp-option=121,${route.destination}/${route.prefix},${route.gateway}`);
    });
  }
  
  return lines.join('\n');
};

/**
 * Generate Windows DHCP PowerShell commands
 */
export const generateWindowsDhcp = (config) => {
  const lines = [];
  const { subnet, netmask, rangeStart, rangeEnd, gateway, dns, domain, leaseTime, scopeName, options } = config;
  
  lines.push(`# Generated by Subnet Zero - DHCP Option Builder`);
  lines.push(`# Windows Server DHCP Configuration (PowerShell)`);
  lines.push(``);
  
  const name = scopeName || 'Scope1';
  
  lines.push(`# Create DHCP Scope`);
  lines.push(`Add-DhcpServerv4Scope -Name "${name}" -StartRange ${rangeStart} -EndRange ${rangeEnd} -SubnetMask ${netmask}`);
  lines.push(``);
  
  if (gateway) {
    lines.push(`# Set Default Gateway`);
    lines.push(`Set-DhcpServerv4OptionValue -ScopeId ${subnet} -Router ${Array.isArray(gateway) ? gateway.join(',') : gateway}`);
  }
  
  if (dns && dns.length > 0) {
    lines.push(`# Set DNS Servers`);
    lines.push(`Set-DhcpServerv4OptionValue -ScopeId ${subnet} -DnsServer ${dns.join(',')}`);
  }
  
  if (domain) {
    lines.push(`# Set Domain Name`);
    lines.push(`Set-DhcpServerv4OptionValue -ScopeId ${subnet} -DnsDomain "${domain}"`);
  }
  
  if (leaseTime) {
    const duration = `${Math.floor(leaseTime / 86400)}.${Math.floor((leaseTime % 86400) / 3600)}:00:00`;
    lines.push(`# Set Lease Duration`);
    lines.push(`Set-DhcpServerv4Scope -ScopeId ${subnet} -LeaseDuration ${duration}`);
  }
  
  if (options?.option43?.length > 0) {
    const hex = bytesToHex(options.option43, '');
    lines.push(`# Option 43 - Vendor Specific`);
    lines.push(`Set-DhcpServerv4OptionValue -ScopeId ${subnet} -OptionId 43 -Value ([byte[]]@(${options.option43.join(',')}))`);
  }
  
  return lines.join('\n');
};

/**
 * Generate Cisco IOS DHCP pool configuration
 */
export const generateCiscoIos = (config) => {
  const lines = [];
  const { subnet, netmask, rangeStart, rangeEnd, gateway, dns, domain, leaseTime, poolName, options } = config;
  
  lines.push(`! Generated by Subnet Zero - DHCP Option Builder`);
  lines.push(`! Cisco IOS DHCP Pool Configuration`);
  lines.push(``);
  
  const name = poolName || 'POOL1';
  
  lines.push(`ip dhcp pool ${name}`);
  lines.push(`   network ${subnet} ${netmask}`);
  
  if (gateway) {
    lines.push(`   default-router ${Array.isArray(gateway) ? gateway[0] : gateway}`);
  }
  
  if (dns && dns.length > 0) {
    lines.push(`   dns-server ${dns.join(' ')}`);
  }
  
  if (domain) {
    lines.push(`   domain-name ${domain}`);
  }
  
  if (leaseTime) {
    const days = Math.floor(leaseTime / 86400);
    const hours = Math.floor((leaseTime % 86400) / 3600);
    lines.push(`   lease ${days} ${hours}`);
  }
  
  if (options?.option43?.length > 0) {
    const hex = bytesToHex(options.option43, '.').replace(/:/g, '.');
    lines.push(`   option 43 hex ${hex}`);
  }
  
  if (rangeStart && rangeEnd) {
    lines.push(`!`);
    lines.push(`ip dhcp excluded-address ${subnet} ${rangeStart.split('.').slice(0, 3).join('.')}.${parseInt(rangeStart.split('.')[3], 10) - 1}`);
  }
  
  return lines.join('\n');
};

/**
 * Generate raw hex output
 */
export const generateRawHex = (config) => {
  const lines = [];
  const { options } = config;
  
  lines.push(`# Generated by Subnet Zero - DHCP Option Builder`);
  lines.push(`# Raw Hex Values`);
  lines.push(``);
  
  if (options?.option43?.length > 0) {
    lines.push(`Option 43 (Vendor Specific):`);
    lines.push(`  Hex: ${bytesToHex(options.option43, ':')}`);
    lines.push(`  Bytes: ${options.option43.join(', ')}`);
    lines.push(``);
  }
  
  if (options?.option121?.length > 0) {
    const encoded = encodeOption121(options.option121);
    lines.push(`Option 121 (Classless Static Routes):`);
    lines.push(`  Hex: ${bytesToHex(encoded, ':')}`);
    lines.push(`  Bytes: ${encoded.join(', ')}`);
    lines.push(``);
  }
  
  if (options?.option119?.length > 0) {
    const encoded = encodeOption119(options.option119);
    lines.push(`Option 119 (Domain Search List):`);
    lines.push(`  Hex: ${bytesToHex(encoded, ':')}`);
    lines.push(`  Bytes: ${encoded.join(', ')}`);
    lines.push(``);
  }
  
  return lines.join('\n');
};

/**
 * Main export generator
 */
export const generateDhcpConfig = (serverType, config) => {
  switch (serverType) {
    case 'iscDhcp':
      return generateIscDhcp(config);
    case 'keaDhcp':
      return generateKeaDhcp(config);
    case 'dnsmasq':
      return generateDnsmasq(config);
    case 'windowsDhcp':
      return generateWindowsDhcp(config);
    case 'ciscoIos':
      return generateCiscoIos(config);
    case 'rawHex':
      return generateRawHex(config);
    default:
      return generateIscDhcp(config);
  }
};

export default {
  ipToBytes,
  bytesToIp,
  ipToHex,
  isValidIP,
  toHexByte,
  bytesToHex,
  hexToBytes,
  encodeTLV,
  decodeTLV,
  VENDOR_TEMPLATES,
  encodeRoute121,
  encodeOption121,
  decodeOption121,
  encodeDomainName,
  encodeOption119,
  STANDARD_OPTIONS,
  encodeOptionValue,
  DHCP_SERVER_TYPES,
  generateDhcpConfig
};

