import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Badge } from '../../common';
import { parseCIDR } from '../../../utils/ipv4';
import { getCloudUsableHosts, SUBNET_TIERS } from '../../../utils/cloudProviders';

/**
 * SubnetTree - Enhanced visual tree representation of VPC subnet hierarchy
 * Features: Collapsible AZs, capacity bars, detailed subnet info, Dev Mode
 */
const SubnetTree = ({
  vpcCidr,
  vpcName,
  subnets,
  provider,
  onSelect,
  onRemove,
  onEdit,
  selectedId
}) => {
  const [collapsedAZs, setCollapsedAZs] = useState({});
  const [selectedForDetail, setSelectedForDetail] = useState(null);
  const [devMode, setDevMode] = useState(false);
  
  // Group subnets by AZ
  const groupedByAZ = useMemo(() => {
    const groups = {};
    subnets.forEach(subnet => {
      const az = subnet.az || 'Unassigned';
      if (!groups[az]) groups[az] = [];
      groups[az].push(subnet);
    });
    return groups;
  }, [subnets]);
  
  // Parse VPC data
  const vpcData = useMemo(() => {
    try {
      return parseCIDR(vpcCidr);
    } catch (e) {
      return null;
    }
  }, [vpcCidr]);
  
  // Calculate total used and remaining
  const spaceStats = useMemo(() => {
    if (!vpcData) return null;
    let usedIPs = 0;
    subnets.forEach(subnet => {
      try {
        const parsed = parseCIDR(subnet.cidr);
        usedIPs += parsed.totalHosts;
      } catch (e) {}
    });
    return {
      used: usedIPs,
      total: vpcData.totalHosts,
      remaining: vpcData.totalHosts - usedIPs,
      percent: (usedIPs / vpcData.totalHosts) * 100
    };
  }, [vpcData, subnets]);
  
  const toggleAZ = (az) => {
    setCollapsedAZs(prev => ({ ...prev, [az]: !prev[az] }));
  };
  
  if (!vpcData) return null;
  
  // Convert IP to binary representation
  const ipToBinary = (ip) => {
    return ip.split('.').map(octet => 
      parseInt(octet, 10).toString(2).padStart(8, '0')
    ).join('.');
  };
  
  // Convert IP to hex
  const ipToHex = (ip) => {
    return '0x' + ip.split('.').map(octet => 
      parseInt(octet, 10).toString(16).padStart(2, '0').toUpperCase()
    ).join('.');
  };
  
  return (
    <GlassCard padding="lg">
      {/* VPC Root Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* VPC Icon */}
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#vpcGrad)" strokeWidth="1.5">
            <defs>
              <linearGradient id="vpcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
            <circle cx="7" cy="10" r="1.5" fill="#22d3ee" />
            <circle cx="12" cy="10" r="1.5" fill="#a855f7" />
            <circle cx="17" cy="10" r="1.5" fill="#34d399" />
          </svg>
        </div>
        
        {/* VPC Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>
              🌐 {vpcName}
            </h3>
            <Badge size="sm" style={{ 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#22d3ee'
            }}>
              VPC
            </Badge>
          </div>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6b7280', 
            fontFamily: 'monospace',
            marginTop: '0.25rem'
          }}>
            {vpcCidr}
          </p>
        </div>
        
        {/* VPC Stats */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}>
            {vpcData.totalHosts.toLocaleString()} IPs
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>
            {subnets.length} subnet{subnets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Dev Mode Toggle */}
        <button
          onClick={() => setDevMode(!devMode)}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: '0.5rem',
            border: devMode ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            background: devMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: devMode ? '#c084fc' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
          </svg>
          Dev
        </button>
      </div>
      
      {/* Overall Capacity Bar */}
      {spaceStats && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>VPC Capacity</span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {spaceStats.used.toLocaleString()} / {spaceStats.total.toLocaleString()} ({spaceStats.percent.toFixed(1)}%)
            </span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${spaceStats.percent}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: spaceStats.percent > 90 
                  ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                  : spaceStats.percent > 70 
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #22d3ee, #a855f7)',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.625rem', color: '#4b5563' }}>
              {spaceStats.remaining.toLocaleString()} IPs remaining
            </span>
          </div>
        </div>
      )}
      
      {/* Tree Structure */}
      <div style={{ 
        position: 'relative',
        paddingLeft: '1rem',
        borderLeft: '2px solid rgba(107, 114, 128, 0.3)'
      }}>
        {Object.entries(groupedByAZ).map(([az, azSubnets], azIndex) => {
          const isCollapsed = collapsedAZs[az];
          const azUsedIPs = azSubnets.reduce((sum, s) => {
            try {
              return sum + parseCIDR(s.cidr).totalHosts;
            } catch (e) { return sum; }
          }, 0);
          
          return (
            <motion.div
              key={az}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: azIndex * 0.1 }}
              style={{ marginBottom: '1.5rem' }}
            >
              {/* AZ Header - Clickable to collapse */}
              <div 
                onClick={() => toggleAZ(az)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginLeft: '-1rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.1)'
                }}
              >
                {/* Collapse indicator */}
                <motion.div
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#a855f7' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.div>
                
                {/* AZ Icon */}
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1rem' }}>📁</span>
                </div>
                
                {/* AZ Name */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#c084fc' }}>
                    {az}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.75rem' }}>
                    {azSubnets.length} subnet{azSubnets.length !== 1 ? 's' : ''} • {azUsedIPs.toLocaleString()} IPs
                  </span>
                </div>
              </div>
              
              {/* Subnets in this AZ */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      marginLeft: '1.5rem',
                      marginTop: '0.75rem',
                      borderLeft: '2px dashed rgba(107, 114, 128, 0.2)',
                      paddingLeft: '1rem'
                    }}
                  >
                    {azSubnets.map((subnet, index) => {
                      const tierConfig = SUBNET_TIERS[subnet.tier] || SUBNET_TIERS.private;
                      const isSelected = selectedId === subnet.id;
                      const isDetailOpen = selectedForDetail === subnet.id;
                      
                      let subnetData = null;
                      let cloudHosts = null;
                      try {
                        subnetData = parseCIDR(subnet.cidr);
                        cloudHosts = getCloudUsableHosts(subnetData.prefix, provider);
                      } catch (e) {}
                      
                      // Capacity percentage
                      const capacityPercent = subnetData ? (cloudHosts?.usable / subnetData.totalHosts) * 100 : 0;
                      
                      return (
                        <motion.div
                          key={subnet.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.05 }}
                          style={{ marginBottom: '0.75rem' }}
                        >
                          {/* Subnet Row */}
                          <div
                            onClick={() => {
                              onSelect?.(subnet);
                              setSelectedForDetail(isDetailOpen ? null : subnet.id);
                            }}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.875rem 1rem',
                              borderRadius: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: isSelected 
                                ? `linear-gradient(135deg, ${tierConfig.color}15, ${tierConfig.color}08)`
                                : 'rgba(255, 255, 255, 0.02)',
                              border: isSelected 
                                ? `1px solid ${tierConfig.color}40` 
                                : '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            {/* Tree connector line */}
                            <div style={{
                              position: 'absolute',
                              left: '-1rem',
                              top: '50%',
                              width: '1rem',
                              height: '2px',
                              backgroundColor: 'rgba(107, 114, 128, 0.2)'
                            }} />
                            
                            {/* Tier Icon */}
                            <div style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '0.625rem',
                              backgroundColor: `${tierConfig.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              flexShrink: 0
                            }}>
                              {tierConfig.icon}
                            </div>
                            
                            {/* Subnet Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h4 style={{ 
                                  fontSize: '0.9375rem',
                                  fontWeight: 600, 
                                  color: 'white',
                                  margin: 0
                                }}>
                                  {subnet.name}
                                </h4>
                                <Badge 
                                  size="sm"
                                  style={{ 
                                    backgroundColor: `${tierConfig.color}15`, 
                                    border: `1px solid ${tierConfig.color}30`, 
                                    color: tierConfig.color,
                                    fontSize: '0.625rem'
                                  }}
                                >
                                  {tierConfig.name}
                                </Badge>
                              </div>
                              <p style={{ 
                                fontSize: '0.8125rem', 
                                color: '#6b7280', 
                                fontFamily: 'monospace',
                                marginTop: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                {subnet.cidr}
                                <span style={{ color: '#4b5563' }}>•</span>
                                <span style={{ color: '#9ca3af' }}>/{subnetData?.prefix}</span>
                              </p>
                            </div>
                            
                            {/* Capacity Bar + Stats */}
                            {cloudHosts && subnetData && (
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'flex-end',
                                gap: '0.375rem',
                                minWidth: '140px'
                              }}>
                                {/* Mini capacity bar */}
                                <div style={{
                                  width: '100%',
                                  height: '6px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${capacityPercent}%`,
                                    height: '100%',
                                    backgroundColor: tierConfig.color,
                                    borderRadius: '3px',
                                    opacity: 0.7
                                  }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                  <span style={{ fontSize: '0.875rem', color: '#34d399', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {cloudHosts.usable}
                                  </span>
                                  <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                                    / {subnetData.totalHosts} usable
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove?.(subnet.id);
                              }}
                              style={{
                                padding: '0.5rem',
                                color: '#6b7280',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                flexShrink: 0
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#f87171';
                                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)';
                                e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Expanded Detail Panel */}
                          <AnimatePresence>
                            {isDetailOpen && subnetData && cloudHosts && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  marginTop: '0.5rem',
                                  marginLeft: '3.25rem',
                                  padding: '1rem',
                                  borderRadius: '0.75rem',
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                              >
                                {/* IP Breakdown */}
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(2, 1fr)', 
                                  gap: '0.75rem',
                                  marginBottom: devMode ? '1rem' : 0
                                }}>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Network</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#f87171', fontFamily: 'monospace' }}>{subnetData.networkAddress}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Broadcast</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#f87171', fontFamily: 'monospace' }}>{subnetData.broadcastAddress}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>First Usable</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#34d399', fontFamily: 'monospace' }}>{cloudHosts.firstUsable}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Last Usable</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#34d399', fontFamily: 'monospace' }}>{cloudHosts.lastUsable}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Netmask</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', fontFamily: 'monospace' }}>{subnetData.subnetMask}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Wildcard</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', fontFamily: 'monospace' }}>{subnetData.wildcardMask}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total IPs</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'white', fontFamily: 'monospace' }}>{subnetData.totalHosts.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{provider.toUpperCase()} Usable</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#34d399', fontFamily: 'monospace' }}>{cloudHosts.usable.toLocaleString()}</p>
                                  </div>
                                </div>
                                
                                {/* Dev Mode - Binary/Hex */}
                                {devMode && (
                                  <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(168, 85, 247, 0.2)'
                                  }}>
                                    <p style={{ fontSize: '0.625rem', color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                                      🔧 Dev Mode
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                      <div>
                                        <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>Binary: </span>
                                        <span style={{ fontSize: '0.6875rem', color: '#c084fc', fontFamily: 'monospace' }}>
                                          {ipToBinary(subnetData.networkAddress)}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>Hex: </span>
                                        <span style={{ fontSize: '0.6875rem', color: '#c084fc', fontFamily: 'monospace' }}>
                                          {ipToHex(subnetData.networkAddress)}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>Integer: </span>
                                        <span style={{ fontSize: '0.6875rem', color: '#c084fc', fontFamily: 'monospace' }}>
                                          {subnetData.networkAddress.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        
        {/* Unallocated Space Indicator */}
        {spaceStats && spaceStats.remaining > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              marginLeft: '-1rem',
              borderRadius: '0.75rem',
              background: 'rgba(75, 85, 99, 0.1)',
              border: '1px dashed rgba(75, 85, 99, 0.3)'
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(75, 85, 99, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1rem' }}>⚫</span>
            </div>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Unallocated
            </span>
            <span style={{ fontSize: '0.75rem', color: '#4b5563', marginLeft: 'auto' }}>
              {spaceStats.remaining.toLocaleString()} IPs remaining
            </span>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};

export default SubnetTree;
