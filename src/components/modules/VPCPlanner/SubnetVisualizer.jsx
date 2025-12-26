import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Tooltip } from '../../common';
import { parseCIDR, ipToInt, intToIp } from '../../../utils/ipv4';
import { getCloudUsableHosts, SUBNET_TIERS } from '../../../utils/cloudProviders';

/**
 * SubnetVisualizer - Visual block diagram of subnet allocations
 */
const SubnetVisualizer = ({
  vpcCidr,
  subnets,
  provider,
  onSelect
}) => {
  // Parse and calculate positions
  const visualData = useMemo(() => {
    try {
      const vpcData = parseCIDR(vpcCidr);
      const vpcStart = ipToInt(vpcData.networkAddress);
      const vpcEnd = ipToInt(vpcData.broadcastAddress);
      const vpcSize = vpcEnd - vpcStart + 1;
      
      // Calculate each subnet's position and width
      const subnetBlocks = subnets.map(subnet => {
        try {
          const subnetData = parseCIDR(subnet.cidr);
          const subnetStart = ipToInt(subnetData.networkAddress);
          const subnetEnd = ipToInt(subnetData.broadcastAddress);
          const subnetSize = subnetEnd - subnetStart + 1;
          
          // Calculate percentage position and width
          const left = ((subnetStart - vpcStart) / vpcSize) * 100;
          const width = (subnetSize / vpcSize) * 100;
          
          const cloudHosts = getCloudUsableHosts(subnetData.prefix, provider);
          const tierConfig = SUBNET_TIERS[subnet.tier] || SUBNET_TIERS.private;
          
          return {
            ...subnet,
            subnetData,
            cloudHosts,
            tierConfig,
            left,
            width,
            start: subnetData.networkAddress,
            end: subnetData.broadcastAddress
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      // Find unallocated ranges
      const allocated = subnetBlocks
        .map(s => ({ start: ipToInt(s.start), end: ipToInt(s.end) }))
        .sort((a, b) => a.start - b.start);
      
      const unallocated = [];
      let current = vpcStart;
      
      allocated.forEach(block => {
        if (block.start > current) {
          const left = ((current - vpcStart) / vpcSize) * 100;
          const width = ((block.start - current) / vpcSize) * 100;
          unallocated.push({
            left,
            width,
            start: intToIp(current),
            end: intToIp(block.start - 1),
            size: block.start - current
          });
        }
        current = block.end + 1;
      });
      
      // Check for remaining space at end
      if (current <= vpcEnd) {
        const left = ((current - vpcStart) / vpcSize) * 100;
        const width = ((vpcEnd - current + 1) / vpcSize) * 100;
        unallocated.push({
          left,
          width,
          start: intToIp(current),
          end: intToIp(vpcEnd),
          size: vpcEnd - current + 1
        });
      }
      
      return {
        vpcData,
        subnetBlocks,
        unallocated
      };
    } catch (e) {
      return null;
    }
  }, [vpcCidr, subnets, provider]);
  
  if (!visualData) return null;
  
  const { vpcData, subnetBlocks, unallocated } = visualData;
  
  return (
    <GlassCard padding="lg">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'white', marginBottom: '0.25rem' }}>
          IP Space Visualization
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {vpcCidr} • {vpcData.totalHosts.toLocaleString()} total IPs
        </p>
      </div>
      
      {/* Visualization Container */}
      <div style={{ position: 'relative' }}>
        {/* Main visualization bar */}
        <div style={{
          position: 'relative',
          height: '100px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Background grid lines */}
          {[25, 50, 75].map(percent => (
            <div
              key={percent}
              style={{
                position: 'absolute',
                left: `${percent}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}
            />
          ))}
          
          {/* Allocated subnets */}
          {subnetBlocks.map((block, index) => {
            // Ensure minimum visual width of 3% for visibility
            const visualWidth = Math.max(block.width, 3);
            
            return (
              <Tooltip
                key={block.id}
                content={
                  <div>
                    <p style={{ fontWeight: 500 }}>{block.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{block.cidr}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {block.cloudHosts.usable} usable / {block.subnetData.totalHosts} total
                    </p>
                    <p style={{ fontSize: '0.75rem', color: block.tierConfig.color }}>
                      {block.tierConfig.name} • {block.az}
                    </p>
                    <p style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {block.width.toFixed(2)}% of VPC space
                    </p>
                  </div>
                }
              >
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onClick={() => onSelect?.(block)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '12px',
                    left: `${block.left}%`,
                    width: `${visualWidth}%`,
                    minWidth: '24px',
                    backgroundColor: `${block.tierConfig.color}40`,
                    borderLeft: `4px solid ${block.tierConfig.color}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transformOrigin: 'top',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '0.25rem',
                    boxShadow: `0 0 10px ${block.tierConfig.color}30`
                  }}
                >
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {block.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.625rem', 
                    color: 'rgba(255,255,255,0.7)', 
                    fontFamily: 'monospace' 
                  }}>
                    /{block.subnetData.prefix}
                  </div>
                </motion.div>
              </Tooltip>
            );
          })}
          
          {/* Unallocated label if mostly empty */}
          {subnetBlocks.length > 0 && unallocated.some(u => u.width > 50) && (
            <div style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              color: '#4b5563',
              pointerEvents: 'none'
            }}>
              Unallocated space
            </div>
          )}
        </div>
        
        {/* Scale markers - below the bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.75rem',
          padding: '0'
        }}>
          {[0, 25, 50, 75, 100].map(percent => (
            <span 
              key={percent} 
              style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                fontFamily: 'monospace',
                fontWeight: 500
              }}
            >
              {percent}%
            </span>
          ))}
        </div>
        
        {/* Summary stats */}
        {subnetBlocks.length > 0 && (() => {
          const allocatedIPs = subnetBlocks.reduce((sum, b) => sum + b.subnetData.totalHosts, 0);
          const totalVpcIPs = vpcData.totalHosts;
          const allocatedPercent = Math.min((allocatedIPs / totalVpcIPs) * 100, 100);
          const unallocatedIPs = Math.max(totalVpcIPs - allocatedIPs, 0);
          const unallocatedPercent = Math.max(100 - allocatedPercent, 0);
          
          return (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Allocated: </span>
                <span style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: 500 }}>
                  {allocatedIPs.toLocaleString()} IPs
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {' '}({allocatedPercent.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Unallocated: </span>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>
                  {unallocatedIPs.toLocaleString()} IPs
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {' '}({unallocatedPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Legend */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {Object.entries(SUBNET_TIERS).map(([id, tier]) => {
          const count = subnetBlocks.filter(s => s.tier === id).length;
          if (count === 0) return null;
          
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  borderRadius: '0.25rem',
                  backgroundColor: tier.color 
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {tier.name} ({count})
              </span>
            </div>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            borderRadius: '0.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} />
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Unallocated</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default SubnetVisualizer;

