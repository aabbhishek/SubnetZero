import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge, CopyButton, Tooltip } from '../../common';
import { 
  getCloudUsableHosts, 
  getReservedIPDetails,
  getCloudFirstUsableIP,
  getCloudLastUsableIP,
  CLOUD_PROVIDERS 
} from '../../../utils/cloudProviders';

/**
 * SubnetDetails - Display calculated subnet information
 */
const SubnetDetails = ({
  subnetData,
  provider = 'aws',
  ipVersion = 'ipv4',
  className = ''
}) => {
  if (!subnetData) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <svg 
          className="w-16 h-16 mx-auto mb-4 opacity-30"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p>Enter a CIDR to see subnet details</p>
      </div>
    );
  }
  
  const providerConfig = CLOUD_PROVIDERS[provider];
  const cloudHosts = getCloudUsableHosts(subnetData.prefix, provider);
  
  // For IPv4
  const reservedIPs = ipVersion === 'ipv4' 
    ? getReservedIPDetails(subnetData.networkAddress, subnetData.prefix, provider)
    : [];
  
  const firstUsable = ipVersion === 'ipv4'
    ? getCloudFirstUsableIP(subnetData.networkAddress, subnetData.prefix, provider)
    : subnetData.networkAddress;
  
  const lastUsable = ipVersion === 'ipv4'
    ? getCloudLastUsableIP(subnetData.networkAddress, subnetData.prefix, provider)
    : subnetData.lastAddress;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Detail row component
  const DetailRow = ({ label, value, copyable = false, highlight = false, tooltip = null }) => (
    <motion.div 
      variants={itemVariants}
      className={`
        flex items-center justify-between py-3 px-4
        border-b border-white/5 last:border-0
        ${highlight ? 'bg-gradient-to-r from-cyan-500/5 to-purple-500/5' : ''}
      `}
    >
      <span className="text-gray-400 text-sm flex items-center gap-2">
        {label}
        {tooltip && (
          <Tooltip content={tooltip}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 cursor-help">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </Tooltip>
        )}
      </span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${highlight ? 'text-cyan-400 font-medium' : 'text-white'}`}>
          {value}
        </span>
        {copyable && <CopyButton text={value} size="sm" />}
      </div>
    </motion.div>
  );
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 ${className}`}
    >
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total IPs */}
        <motion.div variants={itemVariants}>
          <GlassCard padding="md" className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total IPs</p>
            <p className="text-2xl font-bold text-white font-mono">
              {ipVersion === 'ipv4' 
                ? cloudHosts.total.toLocaleString()
                : subnetData.totalAddressesFormatted
              }
            </p>
          </GlassCard>
        </motion.div>
        
        {/* Reserved */}
        <motion.div variants={itemVariants}>
          <GlassCard padding="md" className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Reserved ({providerConfig.shortName})
            </p>
            <p className="text-2xl font-bold text-yellow-400 font-mono">
              {cloudHosts.reserved}
            </p>
          </GlassCard>
        </motion.div>
        
        {/* Usable */}
        <motion.div variants={itemVariants}>
          <GlassCard padding="md" variant="glow" className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Usable Hosts</p>
            <p className="text-2xl font-bold text-green-400 font-mono">
              {cloudHosts.usable.toLocaleString()}
            </p>
          </GlassCard>
        </motion.div>
        
        {/* Prefix */}
        <motion.div variants={itemVariants}>
          <GlassCard padding="md" className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prefix</p>
            <p className="text-2xl font-bold text-purple-400 font-mono">
              /{subnetData.prefix}
            </p>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* Warning if subnet too small */}
      {cloudHosts.warning && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm text-yellow-400">{cloudHosts.warning}</p>
          </div>
        </motion.div>
      )}
      
      {/* Address Details */}
      <motion.div variants={itemVariants}>
        <GlassCard padding="none">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="font-medium text-white">Address Details</h3>
          </div>
          
          <DetailRow 
            label="Network Address" 
            value={ipVersion === 'ipv4' ? subnetData.networkAddress : subnetData.networkAddress}
            copyable 
          />
          
          {ipVersion === 'ipv4' && (
            <>
              <DetailRow 
                label="Broadcast Address" 
                value={subnetData.broadcastAddress}
                copyable 
              />
              <DetailRow 
                label="Subnet Mask" 
                value={subnetData.subnetMask}
                copyable 
              />
              <DetailRow 
                label="Wildcard Mask" 
                value={subnetData.wildcardMask}
                copyable 
                tooltip="Inverse of subnet mask, used in ACLs and OSPF"
              />
            </>
          )}
          
          <DetailRow 
            label={`First Usable (${providerConfig.shortName})`}
            value={firstUsable}
            copyable 
            highlight
          />
          <DetailRow 
            label={`Last Usable (${providerConfig.shortName})`}
            value={lastUsable}
            copyable 
            highlight
          />
        </GlassCard>
      </motion.div>
      
      {/* Reserved IPs Breakdown (IPv4 only) */}
      {ipVersion === 'ipv4' && reservedIPs.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard padding="none">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-medium text-white">Reserved IPs</h3>
              <Badge 
                variant="warning" 
                size="sm"
                style={{ backgroundColor: `${providerConfig.color}15`, borderColor: `${providerConfig.color}30`, color: providerConfig.color }}
              >
                {providerConfig.shortName}
              </Badge>
            </div>
            
            <div className="divide-y divide-white/5">
              {reservedIPs.map((reserved, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: providerConfig.color }}
                    />
                    <div>
                      <p className="font-mono text-sm text-white">{reserved.ip}</p>
                      <p className="text-xs text-gray-500">{reserved.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{reserved.description}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
      
      {/* Binary Representation (IPv4 only) */}
      {ipVersion === 'ipv4' && subnetData.binary && (
        <motion.div variants={itemVariants}>
          <GlassCard padding="md">
            <h3 className="font-medium text-white mb-4">Binary Representation</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Network Address</p>
                <p className="font-mono text-sm text-cyan-400 break-all">{subnetData.binary.network}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Subnet Mask</p>
                <p className="font-mono text-sm text-purple-400 break-all">{subnetData.binary.mask}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
      
      {/* Provider Notes */}
      <motion.div variants={itemVariants}>
        <GlassCard padding="md" className="bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${providerConfig.color}20` }}
            >
              {providerConfig.logo}
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">{providerConfig.name} Notes</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {providerConfig.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              {providerConfig.documentation && (
                <a 
                  href={providerConfig.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View documentation
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default SubnetDetails;

