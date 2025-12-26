import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button } from '../../common';
import { 
  isValidCIDR, 
  parseCIDR, 
  splitSubnet, 
  doSubnetsOverlap,
  ipToInt,
  intToIp
} from '../../../utils/ipv4';
import { 
  CLOUD_PROVIDERS, 
  SUBNET_TIERS,
  getAvailabilityZones,
  getCloudUsableHosts
} from '../../../utils/cloudProviders';
import { generateIaC } from '../../../utils/iacGenerators';
import SubnetTree from './SubnetTree';
import SubnetVisualizer from './SubnetVisualizer';

/**
 * ExportDropdown - Dropdown menu for export options
 */
const ExportDropdown = ({ disabled, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: disabled ? '#4b5563' : '#d1d5db',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        Export
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      
      {isOpen && !disabled && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.5rem',
            width: '12rem',
            backgroundColor: 'rgba(15, 15, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            overflow: 'hidden'
          }}>
            {['terraform', 'cloudformationYaml', 'pulumi'].map((format) => (
              <button
                key={format}
                onClick={() => { onExport(format); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {format === 'terraform' ? 'Terraform (.tf)' : 
                 format === 'cloudformationYaml' ? 'CloudFormation (.yaml)' : 'Pulumi (.ts)'}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * VPCPlanner - Visual VPC/VNet subnet planning tool
 */
const VPCPlanner = () => {
  const [provider, setProvider] = useState('aws');
  const [vpcCidr, setVpcCidr] = useState('10.0.0.0/16');
  const [vpcName, setVpcName] = useState('main-vpc');
  const [region, setRegion] = useState('us-east-1');
  const [subnets, setSubnets] = useState([]);
  const [selectedSubnet, setSelectedSubnet] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFreeSpaceFinder, setShowFreeSpaceFinder] = useState(false);
  const [viewMode, setViewMode] = useState('hybrid'); // tree, visual, or hybrid
  
  // Parse VPC CIDR
  const vpcData = useMemo(() => {
    try {
      if (isValidCIDR(vpcCidr)) {
        return parseCIDR(vpcCidr);
      }
    } catch (e) {}
    return null;
  }, [vpcCidr]);
  
  // Calculate space analysis
  const spaceAnalysis = useMemo(() => {
    if (!vpcData) return null;
    
    let usedIPs = 0;
    subnets.forEach(subnet => {
      try {
        const parsed = parseCIDR(subnet.cidr);
        usedIPs += parsed.totalHosts;
      } catch (e) {}
    });
    
    return {
      totalIPs: vpcData.totalHosts,
      usedIPs,
      remainingIPs: vpcData.totalHosts - usedIPs,
      usedPercent: (usedIPs / vpcData.totalHosts) * 100
    };
  }, [vpcData, subnets]);
  
  // Check for overlaps
  const overlappingSubnets = useMemo(() => {
    const overlaps = [];
    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        if (doSubnetsOverlap(subnets[i].cidr, subnets[j].cidr)) {
          overlaps.push([subnets[i].name, subnets[j].name]);
        }
      }
    }
    return overlaps;
  }, [subnets]);
  
  // Check for subnets outside VPC range
  const subnetsOutsideVpc = useMemo(() => {
    if (!vpcData) return [];
    
    const outside = [];
    const vpcStart = ipToInt(vpcData.networkAddress);
    const vpcEnd = ipToInt(vpcData.broadcastAddress);
    
    subnets.forEach(subnet => {
      try {
        const subnetData = parseCIDR(subnet.cidr);
        const subnetStart = ipToInt(subnetData.networkAddress);
        const subnetEnd = ipToInt(subnetData.broadcastAddress);
        
        if (subnetStart < vpcStart || subnetEnd > vpcEnd) {
          outside.push(subnet.name);
        }
      } catch (e) {}
    });
    
    return outside;
  }, [vpcData, subnets]);
  
  // Available AZs
  const availableAZs = useMemo(() => {
    return getAvailabilityZones(provider, region);
  }, [provider, region]);
  
  // Find free CIDR blocks
  const findFreeBlocks = (requestedPrefix) => {
    if (!vpcData) return [];
    
    const vpcStart = ipToInt(vpcData.networkAddress);
    const vpcEnd = ipToInt(vpcData.broadcastAddress);
    const blockSize = Math.pow(2, 32 - requestedPrefix);
    
    // Get all allocated ranges sorted
    const allocated = subnets.map(s => {
      try {
        const data = parseCIDR(s.cidr);
        return { 
          start: ipToInt(data.networkAddress), 
          end: ipToInt(data.broadcastAddress) 
        };
      } catch (e) { return null; }
    }).filter(Boolean).sort((a, b) => a.start - b.start);
    
    const freeBlocks = [];
    let current = vpcStart;
    
    // Align to block boundary
    const alignToBlock = (ip) => {
      return Math.ceil(ip / blockSize) * blockSize;
    };
    
    allocated.forEach(block => {
      let aligned = alignToBlock(current);
      while (aligned + blockSize - 1 < block.start && aligned + blockSize - 1 <= vpcEnd) {
        if (aligned >= current) {
          freeBlocks.push({
            cidr: `${intToIp(aligned)}/${requestedPrefix}`,
            start: intToIp(aligned),
            end: intToIp(aligned + blockSize - 1),
            size: blockSize,
            contiguous: aligned === current
          });
        }
        aligned += blockSize;
      }
      current = block.end + 1;
    });
    
    // Check remaining space
    let aligned = alignToBlock(current);
    while (aligned + blockSize - 1 <= vpcEnd) {
      freeBlocks.push({
        cidr: `${intToIp(aligned)}/${requestedPrefix}`,
        start: intToIp(aligned),
        end: intToIp(aligned + blockSize - 1),
        size: blockSize,
        contiguous: aligned === current
      });
      aligned += blockSize;
    }
    
    return freeBlocks.slice(0, 10); // Limit to 10
  };
  
  // Add subnet
  const handleAddSubnet = (newSubnet) => {
    setSubnets(prev => [...prev, { ...newSubnet, id: Date.now() }]);
    setShowAddModal(false);
  };
  
  // Remove subnet
  const handleRemoveSubnet = (id) => {
    setSubnets(prev => prev.filter(s => s.id !== id));
    if (selectedSubnet?.id === id) setSelectedSubnet(null);
  };
  
  // Quick add patterns
  const handleQuickAdd = (pattern) => {
    if (!vpcData) return;
    
    const basePrefix = vpcData.prefix;
    let newSubnets = [];
    
    if (pattern === '3-tier-2az') {
      const subnetPrefix = basePrefix + 8;
      const splits = splitSubnet(vpcCidr, subnetPrefix).slice(0, 6);
      newSubnets = [
        { name: 'public-az1', cidr: splits[0], tier: 'public', az: availableAZs[0] },
        { name: 'public-az2', cidr: splits[1], tier: 'public', az: availableAZs[1] },
        { name: 'private-az1', cidr: splits[2], tier: 'private', az: availableAZs[0] },
        { name: 'private-az2', cidr: splits[3], tier: 'private', az: availableAZs[1] },
        { name: 'database-az1', cidr: splits[4], tier: 'database', az: availableAZs[0] },
        { name: 'database-az2', cidr: splits[5], tier: 'database', az: availableAZs[1] },
      ];
    } else if (pattern === '2-tier-3az') {
      const prefix2 = basePrefix + 8;
      const splits2 = splitSubnet(vpcCidr, prefix2).slice(0, 6);
      newSubnets = [
        { name: 'public-az1', cidr: splits2[0], tier: 'public', az: availableAZs[0] },
        { name: 'public-az2', cidr: splits2[1], tier: 'public', az: availableAZs[1] },
        { name: 'public-az3', cidr: splits2[2], tier: 'public', az: availableAZs[2] || availableAZs[0] },
        { name: 'private-az1', cidr: splits2[3], tier: 'private', az: availableAZs[0] },
        { name: 'private-az2', cidr: splits2[4], tier: 'private', az: availableAZs[1] },
        { name: 'private-az3', cidr: splits2[5], tier: 'private', az: availableAZs[2] || availableAZs[0] },
      ];
    }
    
    setSubnets(newSubnets.map((s, i) => ({ ...s, id: Date.now() + i })));
  };
  
  // Export
  const handleExport = (format) => {
    const { code } = generateIaC(format, provider, { vpcCidr, vpcName, region, subnets });
    const extensions = { terraform: '.tf', cloudformationYaml: '.yaml', pulumi: '.ts' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpc-config${extensions[format] || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', margin: 0 }}>
          VPC Planner
        </h1>
        <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
          Visual subnet hierarchy planning with IaC export
        </p>
      </motion.div>
      
      {/* VPC Configuration */}
      <GlassCard variant="glow" padding="lg">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>VPC Name</label>
            <input
              type="text"
              value={vpcName}
              onChange={(e) => setVpcName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>VPC CIDR</label>
            <input
              type="text"
              value={vpcCidr}
              onChange={(e) => setVpcCidr(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${vpcData ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                borderRadius: '0.5rem',
                color: vpcData ? '#4ade80' : '#f87171',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.entries(CLOUD_PROVIDERS).map(([id, p]) => (
                <option key={id} value={id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
          </div>
        </div>
        
        {/* Space analysis bar */}
        {spaceAnalysis && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>IP Space Utilization</span>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {spaceAnalysis.usedIPs.toLocaleString()} / {spaceAnalysis.totalIPs.toLocaleString()} IPs
              </span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '5px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spaceAnalysis.usedPercent}%` }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
                  borderRadius: '5px'
                }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {spaceAnalysis.remainingIPs.toLocaleString()} IPs remaining ({(100 - spaceAnalysis.usedPercent).toFixed(1)}%)
            </p>
          </div>
        )}
      </GlassCard>
      
      {/* Warnings */}
      {overlappingSubnets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f87171', margin: 0 }}>Overlapping Subnets Detected</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(248, 113, 113, 0.7)', marginTop: '0.25rem' }}>
              {overlappingSubnets.map(([a, b]) => `${a} ↔ ${b}`).join(', ')}
            </p>
          </div>
        </motion.div>
      )}
      
      {subnetsOutsideVpc.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fbbf24', margin: 0 }}>Subnets Outside VPC Range</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(251, 191, 36, 0.7)', marginTop: '0.25rem' }}>
              {subnetsOutsideVpc.join(', ')} - CIDR not within {vpcCidr}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Actions Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => setShowAddModal(true)} disabled={!vpcData}>
            + Add Subnet
          </Button>
          
          <button
            onClick={() => setShowFreeSpaceFinder(true)}
            disabled={!vpcData}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              color: vpcData ? '#c084fc' : '#4b5563',
              cursor: vpcData ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Find Space
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quick:</span>
            <button
              onClick={() => handleQuickAdd('3-tier-2az')}
              disabled={!vpcData}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: vpcData ? '#9ca3af' : '#4b5563',
                cursor: vpcData ? 'pointer' : 'not-allowed'
              }}
            >
              3-Tier 2-AZ
            </button>
            <button
              onClick={() => handleQuickAdd('2-tier-3az')}
              disabled={!vpcData}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: vpcData ? '#9ca3af' : '#4b5563',
                cursor: vpcData ? 'pointer' : 'not-allowed'
              }}
            >
              2-Tier 3-AZ
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {['tree', 'visual', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  backgroundColor: viewMode === mode ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: viewMode === mode ? 'white' : '#6b7280'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <ExportDropdown disabled={subnets.length === 0} onExport={handleExport} />
        </div>
      </div>
      
      {/* Subnet Display */}
      {subnets.length === 0 ? (
        <GlassCard padding="xl">
          <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌐</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'white', marginBottom: '0.5rem' }}>
              No Subnets Yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Start by adding subnets to your VPC or use a quick pattern to get started.
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)} disabled={!vpcData}>
              + Add First Subnet
            </Button>
          </div>
        </GlassCard>
      ) : (
        <>
          {viewMode === 'tree' && (
            <SubnetTree
              vpcCidr={vpcCidr}
              vpcName={vpcName}
              subnets={subnets}
              provider={provider}
              onSelect={setSelectedSubnet}
              onRemove={handleRemoveSubnet}
              selectedId={selectedSubnet?.id}
            />
          )}
          
          {viewMode === 'visual' && (
            <SubnetVisualizer
              vpcCidr={vpcCidr}
              subnets={subnets}
              provider={provider}
              onSelect={setSelectedSubnet}
            />
          )}
          
          {viewMode === 'hybrid' && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', 
              gap: '1.5rem',
              alignItems: 'start'
            }}>
              <SubnetTree
                vpcCidr={vpcCidr}
                vpcName={vpcName}
                subnets={subnets}
                provider={provider}
                onSelect={setSelectedSubnet}
                onRemove={handleRemoveSubnet}
                selectedId={selectedSubnet?.id}
              />
              <SubnetVisualizer
                vpcCidr={vpcCidr}
                subnets={subnets}
                provider={provider}
                onSelect={setSelectedSubnet}
              />
            </div>
          )}
        </>
      )}
      
      {/* Add Subnet Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddSubnetModal
            vpcCidr={vpcCidr}
            vpcData={vpcData}
            provider={provider}
            availableAZs={availableAZs}
            existingSubnets={subnets}
            findFreeBlocks={findFreeBlocks}
            onAdd={handleAddSubnet}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Free Space Finder Modal */}
      <AnimatePresence>
        {showFreeSpaceFinder && (
          <FreeSpaceFinderModal
            vpcData={vpcData}
            provider={provider}
            findFreeBlocks={findFreeBlocks}
            onSelectBlock={(cidr) => {
              setShowFreeSpaceFinder(false);
              setShowAddModal(true);
              // Note: The AddSubnetModal will need to accept an initial CIDR
            }}
            onClose={() => setShowFreeSpaceFinder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Enhanced AddSubnetModal with slider and auto-CIDR suggestions
 */
const AddSubnetModal = ({ vpcCidr, vpcData, provider, availableAZs, existingSubnets, findFreeBlocks, onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('');
  const [tier, setTier] = useState('private');
  const [az, setAz] = useState(availableAZs[0] || '');
  const [prefix, setPrefix] = useState(24);
  const [error, setError] = useState('');
  const [cidrMode, setCidrMode] = useState('auto'); // auto or manual
  
  const minPrefix = vpcData ? vpcData.prefix + 1 : 17;
  const maxPrefix = 28;
  
  // Get available CIDRs for selected prefix
  const availableCidrs = useMemo(() => {
    if (!vpcData) return [];
    return findFreeBlocks(prefix);
  }, [vpcData, prefix, findFreeBlocks]);
  
  // Auto-select first available CIDR
  useEffect(() => {
    if (cidrMode === 'auto' && availableCidrs.length > 0) {
      setCidr(availableCidrs[0].cidr);
    }
  }, [availableCidrs, cidrMode]);
  
  // Calculate usable hosts for current prefix
  const usableHosts = useMemo(() => {
    return getCloudUsableHosts(prefix, provider);
  }, [prefix, provider]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!isValidCIDR(cidr)) {
      setError('Invalid CIDR notation');
      return;
    }
    
    const overlaps = existingSubnets.some(s => doSubnetsOverlap(s.cidr, cidr));
    if (overlaps) {
      setError('CIDR overlaps with existing subnet');
      return;
    }
    
    onAdd({ name, cidr, tier, az });
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)'
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1
        }}
      >
        <GlassCard variant="elevated" padding="lg" animate={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Add New Subnet
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                color: '#6b7280',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Subnet Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="private-app-tier"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* AZ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Availability Zone
              </label>
              <select
                value={az}
                onChange={(e) => setAz(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {availableAZs.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            
            {/* Tier */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {Object.entries(SUBNET_TIERS).map(([id, tierConfig]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTier(id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: tier === id 
                        ? `1px solid ${tierConfig.color}50` 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: tier === id 
                        ? `${tierConfig.color}15` 
                        : 'rgba(255, 255, 255, 0.05)',
                      color: tier === id ? 'white' : '#9ca3af'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{tierConfig.icon}</span>
                    {tierConfig.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Size
              </label>
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>/{maxPrefix} (small)</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>/{minPrefix} (large)</span>
                </div>
                <input
                  type="range"
                  min={minPrefix}
                  max={maxPrefix}
                  value={prefix}
                  onChange={(e) => setPrefix(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #22d3ee ${((prefix - minPrefix) / (maxPrefix - minPrefix)) * 100}%, rgba(255,255,255,0.1) ${((prefix - minPrefix) / (maxPrefix - minPrefix)) * 100}%)`,
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'baseline', 
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: '#22d3ee' }}>/{prefix}</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>=</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#34d399' }}>
                    {usableHosts.usable.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>usable hosts</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', textAlign: 'center', marginTop: '0.5rem' }}>
                  {Math.pow(2, 32 - prefix).toLocaleString()} total IPs ({provider.toUpperCase()} reserves {usableHosts.reserved})
                </p>
              </div>
            </div>
            
            {/* CIDR Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>CIDR Block</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCidrMode('auto')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: cidrMode === 'auto' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: cidrMode === 'auto' ? '#22d3ee' : '#6b7280'
                    }}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setCidrMode('manual')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: cidrMode === 'manual' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: cidrMode === 'manual' ? '#22d3ee' : '#6b7280'
                    }}
                  >
                    Manual
                  </button>
                </div>
              </div>
              
              {cidrMode === 'auto' ? (
                <div>
                  {availableCidrs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {availableCidrs.slice(0, 4).map((block, i) => (
                        <button
                          key={block.cidr}
                          type="button"
                          onClick={() => setCidr(block.cidr)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: cidr === block.cidr 
                              ? '1px solid rgba(34, 211, 238, 0.5)' 
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: cidr === block.cidr 
                              ? 'rgba(34, 211, 238, 0.1)' 
                              : 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <div>
                            <span style={{ 
                              fontFamily: 'monospace', 
                              color: cidr === block.cidr ? '#22d3ee' : 'white',
                              fontWeight: 500
                            }}>
                              {block.cidr}
                            </span>
                            {i === 0 && (
                              <span style={{ 
                                marginLeft: '0.5rem', 
                                fontSize: '0.625rem', 
                                color: '#34d399',
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem'
                              }}>
                                Next free
                              </span>
                            )}
                          </div>
                          {block.contiguous && (
                            <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>✓ Contiguous</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: '#f87171', padding: '1rem', textAlign: 'center' }}>
                      No free /{prefix} blocks available in this VPC
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={cidr}
                  onChange={(e) => setCidr(e.target.value)}
                  placeholder={`10.0.1.0/${prefix}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              )}
            </div>
            
            {/* Error */}
            {error && (
              <p style={{ fontSize: '0.875rem', color: '#f87171', margin: 0 }}>{error}</p>
            )}
            
            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <Button variant="default" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Subnet
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

/**
 * FreeSpaceFinderModal - Find available CIDR blocks
 */
const FreeSpaceFinderModal = ({ vpcData, provider, findFreeBlocks, onSelectBlock, onClose }) => {
  const [hostsNeeded, setHostsNeeded] = useState(100);
  
  // Calculate recommended prefix based on hosts needed
  const recommendedPrefix = useMemo(() => {
    // Account for cloud provider reserved IPs
    const reservedCount = provider === 'traditional' ? 2 : provider === 'gcp' ? 4 : 5;
    const totalNeeded = hostsNeeded + reservedCount;
    
    // Find smallest prefix that fits
    for (let p = 28; p >= (vpcData?.prefix || 8) + 1; p--) {
      if (Math.pow(2, 32 - p) >= totalNeeded) {
        return p;
      }
    }
    return (vpcData?.prefix || 8) + 1;
  }, [hostsNeeded, provider, vpcData]);
  
  const freeBlocks = useMemo(() => {
    return findFreeBlocks(recommendedPrefix);
  }, [recommendedPrefix, findFreeBlocks]);
  
  const usableHosts = getCloudUsableHosts(recommendedPrefix, provider);
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)'
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          zIndex: 1,
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          padding: '20px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: 0 }}>
                Find Free Space
              </h2>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                Find available CIDR blocks in your VPC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        {/* Host Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            I need a subnet with at least:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              value={hostsNeeded}
              onChange={(e) => setHostsNeeded(Math.max(1, parseInt(e.target.value, 10) || 1))}
              style={{
                flex: 1,
                padding: '10px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '13px', color: '#6b7280' }}>usable hosts</span>
          </div>
        </div>
        
        {/* Recommended Block */}
        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Recommended</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#22d3ee', margin: 0 }}>
            /{recommendedPrefix}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {usableHosts.usable.toLocaleString()} usable hosts in {provider.toUpperCase()}
          </p>
        </div>
        
        {/* Available Blocks */}
        <div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
            Available /{recommendedPrefix} Blocks:
          </p>
          
          {freeBlocks.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              maxHeight: '180px', 
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {freeBlocks.slice(0, 10).map((block, i) => (
                <button
                  key={block.cidr}
                  onClick={() => onSelectBlock(block.cidr)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: i === 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: i === 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      color: block.contiguous ? '#34d399' : '#6b7280',
                      fontSize: '10px'
                    }}>
                      {block.contiguous ? '●' : '○'}
                    </span>
                    <span style={{ fontFamily: 'monospace', color: 'white', fontSize: '14px' }}>{block.cidr}</span>
                  </div>
                  {block.contiguous && (
                    <span style={{ 
                      fontSize: '10px', 
                      color: '#34d399',
                      padding: '2px 6px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      borderRadius: '4px'
                    }}>
                      Contiguous
                    </span>
                  )}
                </button>
              ))}
              {freeBlocks.length > 10 && (
                <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '4px' }}>
                  +{freeBlocks.length - 10} more blocks available
                </p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#f87171', textAlign: 'center', padding: '16px' }}>
              No free /{recommendedPrefix} blocks available
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VPCPlanner;
