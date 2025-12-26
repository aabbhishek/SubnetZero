/**
 * Cloud Provider Configurations
 * AWS, Azure, GCP specific subnet reserved IP information
 */

/**
 * Cloud provider reserved IP configurations
 */
export const CLOUD_PROVIDERS = {
  aws: {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS',
    logo: '🔶', // Placeholder - can be replaced with actual SVG
    color: '#ff9900',
    secondaryColor: '#232f3e',
    reservedCount: 5,
    reservedIPs: [
      { offset: 0, name: 'Network Address', description: 'Base network address' },
      { offset: 1, name: 'VPC Router', description: 'Reserved by AWS for the VPC router' },
      { offset: 2, name: 'DNS Server', description: 'Reserved for Amazon-provided DNS' },
      { offset: 3, name: 'Future Use', description: 'Reserved by AWS for future use' },
      { offset: 'broadcast', name: 'Broadcast', description: 'Network broadcast address' }
    ],
    minSubnetPrefix: 28, // AWS minimum is /28 (16 IPs)
    maxSubnetPrefix: 16, // AWS maximum is /16 (65,536 IPs)
    vpcMinPrefix: 28,
    vpcMaxPrefix: 16,
    documentation: 'https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html',
    notes: [
      'AWS reserves 5 IPs in every subnet',
      'Minimum subnet size is /28 (16 IPs, 11 usable)',
      'Maximum VPC size is /16',
      'First 4 and last 1 IP are reserved'
    ]
  },
  
  azure: {
    id: 'azure',
    name: 'Microsoft Azure',
    shortName: 'Azure',
    logo: '🔷',
    color: '#0078d4',
    secondaryColor: '#00bcf2',
    reservedCount: 5,
    reservedIPs: [
      { offset: 0, name: 'Network Address', description: 'Base network address' },
      { offset: 1, name: 'Default Gateway', description: 'Reserved for default gateway' },
      { offset: 2, name: 'Azure DNS', description: 'Azure DNS mapping IP' },
      { offset: 3, name: 'Azure DNS', description: 'Additional Azure DNS IP' },
      { offset: 'broadcast', name: 'Broadcast', description: 'Network broadcast address' }
    ],
    minSubnetPrefix: 29, // Azure minimum is /29 (8 IPs)
    maxSubnetPrefix: 8, // Azure allows larger VNets
    vpcMinPrefix: 29,
    vpcMaxPrefix: 8,
    documentation: 'https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq',
    notes: [
      'Azure reserves 5 IPs in every subnet',
      'Minimum subnet size is /29 (8 IPs, 3 usable)',
      'First 4 and last 1 IP are reserved',
      'Some services require larger subnets'
    ]
  },
  
  gcp: {
    id: 'gcp',
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    logo: '🔴',
    color: '#4285f4',
    secondaryColor: '#34a853',
    reservedCount: 4,
    reservedIPs: [
      { offset: 0, name: 'Network Address', description: 'Base network address' },
      { offset: 1, name: 'Default Gateway', description: 'Reserved for subnet gateway' },
      { offset: 'second-to-last', name: 'Reserved', description: 'Reserved by GCP' },
      { offset: 'broadcast', name: 'Broadcast', description: 'Network broadcast address' }
    ],
    minSubnetPrefix: 29, // GCP minimum is /29
    maxSubnetPrefix: 8,
    vpcMinPrefix: 29,
    vpcMaxPrefix: 8,
    documentation: 'https://cloud.google.com/vpc/docs/subnets',
    notes: [
      'GCP reserves 4 IPs in every subnet',
      'Network, gateway, second-to-last, and broadcast',
      'Minimum subnet size is /29 (8 IPs, 4 usable)',
      'Subnets are regional, not zonal'
    ]
  },
  
  traditional: {
    id: 'traditional',
    name: 'Traditional/On-Premises',
    shortName: 'Traditional',
    logo: '🖥️',
    color: '#6b7280',
    secondaryColor: '#374151',
    reservedCount: 2,
    reservedIPs: [
      { offset: 0, name: 'Network Address', description: 'Base network address' },
      { offset: 'broadcast', name: 'Broadcast', description: 'Network broadcast address' }
    ],
    minSubnetPrefix: 30,
    maxSubnetPrefix: 8,
    vpcMinPrefix: null,
    vpcMaxPrefix: null,
    documentation: null,
    notes: [
      'Traditional networking reserves only network and broadcast addresses',
      '/31 subnets (point-to-point) can use both IPs (RFC 3021)',
      '/32 is a single host route'
    ]
  }
};

/**
 * Get cloud provider by ID
 * @param {string} providerId - Provider ID (aws, azure, gcp, traditional)
 * @returns {Object} - Provider configuration
 */
export function getProvider(providerId) {
  return CLOUD_PROVIDERS[providerId] || CLOUD_PROVIDERS.traditional;
}

/**
 * Calculate cloud-aware usable hosts
 * @param {number} prefix - CIDR prefix
 * @param {string} providerId - Cloud provider ID
 * @returns {Object} - Usable host information
 */
export function getCloudUsableHosts(prefix, providerId = 'traditional') {
  const provider = getProvider(providerId);
  const totalHosts = Math.pow(2, 32 - prefix);
  
  // Special cases for small subnets
  if (prefix >= 31) {
    return {
      total: totalHosts,
      reserved: 0,
      usable: totalHosts,
      warning: prefix === 31 ? 'Point-to-point link' : 'Single host',
      isValid: true
    };
  }
  
  // Check minimum subnet size
  if (prefix > provider.minSubnetPrefix) {
    return {
      total: totalHosts,
      reserved: provider.reservedCount,
      usable: 0,
      warning: `${provider.shortName} does not support subnets smaller than /${provider.minSubnetPrefix}`,
      isValid: false
    };
  }
  
  const usable = totalHosts - provider.reservedCount;
  
  return {
    total: totalHosts,
    reserved: provider.reservedCount,
    usable: usable > 0 ? usable : 0,
    warning: usable <= 0 ? 'No usable hosts in this subnet' : null,
    isValid: usable > 0
  };
}

/**
 * Get reserved IP details for a specific subnet
 * @param {string} networkAddress - Network address (e.g., "10.0.1.0")
 * @param {number} prefix - CIDR prefix
 * @param {string} providerId - Cloud provider ID
 * @returns {Array<Object>} - Array of reserved IP details
 */
export function getReservedIPDetails(networkAddress, prefix, providerId = 'traditional') {
  const provider = getProvider(providerId);
  const ipParts = networkAddress.split('.').map(Number);
  const totalHosts = Math.pow(2, 32 - prefix);
  
  const reserved = [];
  
  provider.reservedIPs.forEach(reservation => {
    let ip;
    let offset;
    
    if (reservation.offset === 'broadcast') {
      offset = totalHosts - 1;
    } else if (reservation.offset === 'second-to-last') {
      offset = totalHosts - 2;
    } else {
      offset = reservation.offset;
    }
    
    // Calculate the IP address
    const baseInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const reservedInt = baseInt + offset;
    
    ip = [
      (reservedInt >>> 24) & 255,
      (reservedInt >>> 16) & 255,
      (reservedInt >>> 8) & 255,
      reservedInt & 255
    ].join('.');
    
    reserved.push({
      ip,
      offset,
      name: reservation.name,
      description: reservation.description
    });
  });
  
  return reserved;
}

/**
 * Get first usable IP for cloud provider
 * @param {string} networkAddress - Network address
 * @param {number} prefix - CIDR prefix
 * @param {string} providerId - Cloud provider ID
 * @returns {string} - First usable IP
 */
export function getCloudFirstUsableIP(networkAddress, prefix, providerId = 'traditional') {
  const provider = getProvider(providerId);
  const ipParts = networkAddress.split('.').map(Number);
  
  // Find the highest reserved offset that's not broadcast
  const nonBroadcastReserved = provider.reservedIPs
    .filter(r => typeof r.offset === 'number')
    .map(r => r.offset);
  
  const firstUsableOffset = Math.max(...nonBroadcastReserved, 0) + 1;
  
  const baseInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const firstUsableInt = baseInt + firstUsableOffset;
  
  return [
    (firstUsableInt >>> 24) & 255,
    (firstUsableInt >>> 16) & 255,
    (firstUsableInt >>> 8) & 255,
    firstUsableInt & 255
  ].join('.');
}

/**
 * Get last usable IP for cloud provider
 * @param {string} networkAddress - Network address
 * @param {number} prefix - CIDR prefix
 * @param {string} providerId - Cloud provider ID
 * @returns {string} - Last usable IP
 */
export function getCloudLastUsableIP(networkAddress, prefix, providerId = 'traditional') {
  const provider = getProvider(providerId);
  const ipParts = networkAddress.split('.').map(Number);
  const totalHosts = Math.pow(2, 32 - prefix);
  
  // Find reserved IPs at the end
  const endReservations = provider.reservedIPs
    .filter(r => r.offset === 'broadcast' || r.offset === 'second-to-last')
    .length;
  
  const lastUsableOffset = totalHosts - 1 - endReservations;
  
  const baseInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const lastUsableInt = baseInt + lastUsableOffset;
  
  return [
    (lastUsableInt >>> 24) & 255,
    (lastUsableInt >>> 16) & 255,
    (lastUsableInt >>> 8) & 255,
    lastUsableInt & 255
  ].join('.');
}

/**
 * Get recommended subnet sizes for workloads
 * @param {string} providerId - Cloud provider ID
 * @returns {Array<Object>} - Recommended subnet configurations
 */
export function getRecommendedSubnets(providerId = 'aws') {
  const provider = getProvider(providerId);
  
  const recommendations = [
    {
      name: 'Micro Service',
      prefix: 28,
      description: 'Small workloads, testing environments',
      useCases: ['Development', 'Testing', 'Small services']
    },
    {
      name: 'Small Workload',
      prefix: 27,
      description: 'Small production workloads',
      useCases: ['API servers', 'Small clusters', 'Databases']
    },
    {
      name: 'Medium Workload',
      prefix: 26,
      description: 'Medium production environments',
      useCases: ['Web servers', 'Application clusters']
    },
    {
      name: 'Standard Subnet',
      prefix: 24,
      description: 'Standard subnet size, good for most workloads',
      useCases: ['General purpose', 'Kubernetes nodes', 'VM clusters']
    },
    {
      name: 'Large Workload',
      prefix: 23,
      description: 'Large production environments',
      useCases: ['Large Kubernetes clusters', 'Container workloads']
    },
    {
      name: 'Extra Large',
      prefix: 22,
      description: 'Very large deployments',
      useCases: ['Multi-AZ deployments', 'Large scale services']
    }
  ];
  
  return recommendations
    .filter(rec => rec.prefix >= provider.minSubnetPrefix)
    .map(rec => ({
      ...rec,
      totalHosts: Math.pow(2, 32 - rec.prefix),
      usableHosts: getCloudUsableHosts(rec.prefix, providerId).usable
    }));
}

/**
 * VPC/VNet sizing recommendations
 * @param {string} providerId - Cloud provider ID
 * @returns {Array<Object>} - VPC size recommendations
 */
export function getVPCSizeRecommendations(providerId = 'aws') {
  const sizes = [
    {
      prefix: 16,
      name: 'Large VPC',
      totalIPs: 65536,
      description: 'Maximum VPC size, suitable for large organizations',
      maxSubnets: {
        24: 256,
        25: 512,
        26: 1024
      }
    },
    {
      prefix: 17,
      name: 'Medium-Large VPC',
      totalIPs: 32768,
      description: 'Large multi-environment VPC',
      maxSubnets: {
        24: 128,
        25: 256,
        26: 512
      }
    },
    {
      prefix: 18,
      name: 'Medium VPC',
      totalIPs: 16384,
      description: 'Standard production VPC',
      maxSubnets: {
        24: 64,
        25: 128,
        26: 256
      }
    },
    {
      prefix: 19,
      name: 'Small-Medium VPC',
      totalIPs: 8192,
      description: 'Smaller production or staging VPC',
      maxSubnets: {
        24: 32,
        25: 64,
        26: 128
      }
    },
    {
      prefix: 20,
      name: 'Small VPC',
      totalIPs: 4096,
      description: 'Development or small production VPC',
      maxSubnets: {
        24: 16,
        25: 32,
        26: 64
      }
    }
  ];
  
  return sizes.map(size => ({
    ...size,
    provider: providerId,
    usableWithCloudReservations: getCloudUsableHosts(size.prefix, providerId)
  }));
}

/**
 * Common subnet tiers used in cloud architecture
 */
export const SUBNET_TIERS = {
  public: {
    id: 'public',
    name: 'Public',
    description: 'Internet-facing resources with public IPs',
    color: '#10b981',
    icon: '🌐',
    examples: ['Load balancers', 'NAT gateways', 'Bastion hosts', 'Web servers']
  },
  private: {
    id: 'private',
    name: 'Private',
    description: 'Internal application workloads',
    color: '#3b82f6',
    icon: '🔒',
    examples: ['Application servers', 'Kubernetes nodes', 'Internal APIs']
  },
  database: {
    id: 'database',
    name: 'Database',
    description: 'Data tier with no internet access',
    color: '#8b5cf6',
    icon: '🗄️',
    examples: ['RDS', 'DocumentDB', 'ElastiCache', 'Databases']
  },
  management: {
    id: 'management',
    name: 'Management',
    description: 'Operations and monitoring resources',
    color: '#f59e0b',
    icon: '⚙️',
    examples: ['Monitoring', 'Logging', 'CI/CD agents']
  }
};

/**
 * Get availability zones by region (example data)
 * @param {string} providerId - Cloud provider
 * @param {string} region - Region code
 * @returns {Array<string>} - AZ list
 */
export function getAvailabilityZones(providerId, region = 'us-east-1') {
  // This is example data - in production, this might come from an API
  const azMappings = {
    aws: {
      'us-east-1': ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e', 'us-east-1f'],
      'us-east-2': ['us-east-2a', 'us-east-2b', 'us-east-2c'],
      'us-west-1': ['us-west-1a', 'us-west-1b'],
      'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c', 'us-west-2d'],
      'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
      'eu-west-2': ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'],
      'eu-central-1': ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
      'ap-south-1': ['ap-south-1a', 'ap-south-1b', 'ap-south-1c'],
      'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b', 'ap-southeast-1c'],
      'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b', 'ap-southeast-2c'],
      'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'],
      'sa-east-1': ['sa-east-1a', 'sa-east-1b', 'sa-east-1c']
    },
    azure: {
      'eastus': ['eastus-1', 'eastus-2', 'eastus-3'],
      'eastus2': ['eastus2-1', 'eastus2-2', 'eastus2-3'],
      'westus': ['westus-1', 'westus-2', 'westus-3'],
      'westus2': ['westus2-1', 'westus2-2', 'westus2-3'],
      'westeurope': ['westeurope-1', 'westeurope-2', 'westeurope-3'],
      'northeurope': ['northeurope-1', 'northeurope-2', 'northeurope-3'],
      'centralindia': ['centralindia-1', 'centralindia-2', 'centralindia-3'],
      'southeastasia': ['southeastasia-1', 'southeastasia-2', 'southeastasia-3']
    },
    gcp: {
      'us-central1': ['us-central1-a', 'us-central1-b', 'us-central1-c', 'us-central1-f'],
      'us-east1': ['us-east1-b', 'us-east1-c', 'us-east1-d'],
      'us-west1': ['us-west1-a', 'us-west1-b', 'us-west1-c'],
      'europe-west1': ['europe-west1-b', 'europe-west1-c', 'europe-west1-d'],
      'europe-west2': ['europe-west2-a', 'europe-west2-b', 'europe-west2-c'],
      'asia-south1': ['asia-south1-a', 'asia-south1-b', 'asia-south1-c'],
      'asia-east1': ['asia-east1-a', 'asia-east1-b', 'asia-east1-c'],
      'asia-southeast1': ['asia-southeast1-a', 'asia-southeast1-b', 'asia-southeast1-c']
    },
    traditional: {
      // Traditional doesn't have cloud AZs, use generic zones
    }
  };
  
  // For traditional provider, generate generic zones
  if (providerId === 'traditional') {
    return ['zone-1', 'zone-2', 'zone-3'];
  }
  
  // Return mapped AZs or generate fallback based on region name
  if (azMappings[providerId]?.[region]) {
    return azMappings[providerId][region];
  }
  
  // Generate fallback AZs based on region
  return [`${region}-a`, `${region}-b`, `${region}-c`];
}

const cloudProviderExports = {
  CLOUD_PROVIDERS,
  SUBNET_TIERS,
  getProvider,
  getCloudUsableHosts,
  getReservedIPDetails,
  getCloudFirstUsableIP,
  getCloudLastUsableIP,
  getRecommendedSubnets,
  getVPCSizeRecommendations,
  getAvailabilityZones
};

export default cloudProviderExports;

