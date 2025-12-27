import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, UsageExamples } from '../../common';
import { getURLState, updateURLState } from '../../../utils/urlState';

import ProviderSelector from './ProviderSelector';
import SubnetInput from './SubnetInput';
import SubnetDetails from './SubnetDetails';
import IPv6Toggle from './IPv6Toggle';
import ShareButton from './ShareButton';
import IaCExport from './IaCExport';

// Usage examples for Subnet Calculator
const subnetExamples = [
  {
    id: 'aws-vpc',
    title: 'AWS VPC Planning',
    category: 'AWS',
    icon: '☁️',
    iconBg: 'rgba(255, 153, 0, 0.15)',
    iconColor: '#ff9900',
    description: 'Calculate usable IPs for a typical AWS VPC subnet, accounting for 5 reserved addresses.',
    sampleInput: '10.0.1.0/24',
    expectedOutput: `Total IPs: 256
Reserved (AWS): 5
Usable Hosts: 251
Range: 10.0.1.4 - 10.0.1.254`,
    steps: [
      'Select "AWS" as cloud provider',
      'Enter CIDR: 10.0.1.0/24',
      'Note: AWS reserves .0 (network), .1 (router), .2 (DNS), .3 (future), .255 (broadcast)'
    ],
    applyData: { provider: 'aws', cidr: '10.0.1.0/24', ipVersion: 'ipv4' }
  },
  {
    id: 'azure-subnet',
    title: 'Azure VNet Subnet',
    category: 'Azure',
    icon: '🔷',
    iconBg: 'rgba(0, 120, 212, 0.15)',
    iconColor: '#0078d4',
    description: 'Size a subnet for Azure virtual machines with gateway requirements.',
    sampleInput: '172.16.0.0/22',
    expectedOutput: `Total IPs: 1,024
Reserved (Azure): 5
Usable Hosts: 1,019
Range: 172.16.0.4 - 172.16.3.254`,
    steps: [
      'Select "Azure" as cloud provider',
      'Enter CIDR: 172.16.0.0/22',
      'Azure reserves first 4 and last IP in each subnet'
    ],
    applyData: { provider: 'azure', cidr: '172.16.0.0/22', ipVersion: 'ipv4' }
  },
  {
    id: 'gcp-subnet',
    title: 'GCP Private Subnet',
    category: 'GCP',
    icon: '🔴',
    iconBg: 'rgba(234, 67, 53, 0.15)',
    iconColor: '#ea4335',
    description: 'Plan a GCP subnet for a microservices cluster with proper IP allocation.',
    sampleInput: '192.168.10.0/23',
    expectedOutput: `Total IPs: 512
Reserved (GCP): 4
Usable Hosts: 508
Range: 192.168.10.1 - 192.168.11.253`,
    steps: [
      'Select "GCP" as cloud provider',
      'Enter CIDR: 192.168.10.0/23',
      'GCP reserves network, gateway, second-to-last, and broadcast'
    ],
    applyData: { provider: 'gcp', cidr: '192.168.10.0/23', ipVersion: 'ipv4' }
  },
  {
    id: 'small-subnet',
    title: 'Small Office Network',
    category: 'Traditional',
    icon: '🏢',
    iconBg: 'rgba(34, 211, 238, 0.15)',
    iconColor: '#22d3ee',
    description: 'Calculate a /28 subnet for a small office with limited devices.',
    sampleInput: '192.168.1.0/28',
    expectedOutput: `Total IPs: 16
Reserved: 2
Usable Hosts: 14
Range: 192.168.1.1 - 192.168.1.14`,
    steps: [
      'Select "Traditional" provider',
      'Enter CIDR: 192.168.1.0/28',
      'Perfect for small networks: printer, router, ~12 devices'
    ],
    applyData: { provider: 'traditional', cidr: '192.168.1.0/28', ipVersion: 'ipv4' }
  },
  {
    id: 'ipv6-subnet',
    title: 'IPv6 /64 Network',
    category: 'IPv6',
    icon: '🌐',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#a855f7',
    description: 'Explore the vast address space of a standard IPv6 /64 subnet.',
    sampleInput: '2001:db8::/64',
    expectedOutput: `Total IPs: 18,446,744,073,709,551,616
Usable: Virtually unlimited
Standard for single network segment`,
    steps: [
      'Toggle to "IPv6" mode',
      'Enter prefix: 2001:db8::/64',
      '/64 is the standard size for a single LAN segment'
    ],
    applyData: { provider: 'aws', cidr: '2001:db8::/64', ipVersion: 'ipv6' }
  }
];

/**
 * SubnetCalculator - Main cloud-native subnet calculator module
 */
const SubnetCalculator = () => {
  // State
  const [provider, setProvider] = useState('aws');
  const [ipVersion, setIpVersion] = useState('ipv4');
  const [cidr, setCidr] = useState('');
  const [subnetData, setSubnetData] = useState(null);
  
  // Load state from URL on mount
  useEffect(() => {
    const urlState = getURLState();
    if (urlState && urlState.module === 'subnet-calculator') {
      if (urlState.provider) setProvider(urlState.provider);
      if (urlState.ipVersion) setIpVersion(urlState.ipVersion);
      if (urlState.cidr) setCidr(urlState.cidr);
    }
  }, []);
  
  // Update URL when state changes
  useEffect(() => {
    if (cidr) {
      updateURLState({
        module: 'subnet-calculator',
        provider,
        ipVersion,
        cidr
      });
    }
  }, [provider, ipVersion, cidr]);
  
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
  };
  
  const handleIPVersionChange = (newVersion) => {
    setIpVersion(newVersion);
    setCidr('');
    setSubnetData(null);
  };
  
  const handleValidChange = (data) => {
    setSubnetData(data);
  };

  // Handle applying an example
  const handleApplyExample = (data) => {
    if (data.provider) setProvider(data.provider);
    if (data.ipVersion) setIpVersion(data.ipVersion);
    if (data.cidr) setCidr(data.cidr);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Usage Examples */}
      <UsageExamples 
        examples={subnetExamples}
        onApplyExample={handleApplyExample}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between', 
            gap: '1rem' 
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.875rem', 
                fontWeight: 700, 
                color: 'white',
                fontFamily: 'var(--font-display)',
                margin: 0
              }}>
                Subnet Calculator
              </h1>
              <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                Cloud-native IP calculator with AWS, Azure & GCP awareness
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShareButton 
                state={{ provider, ipVersion, cidr }}
              />
              <IaCExport 
                subnetData={subnetData}
                provider={provider}
              />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Controls */}
      <GlassCard variant="glow" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Provider & IP Version */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div data-tour="cloud-provider">
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#9ca3af',
                marginBottom: '0.5rem'
              }}>
                Cloud Provider
              </label>
              <ProviderSelector 
                selected={provider}
                onChange={handleProviderChange}
              />
            </div>
            
            <div data-tour="ip-version">
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#9ca3af',
                marginBottom: '0.5rem'
              }}>
                IP Version
              </label>
              <IPv6Toggle
                ipVersion={ipVersion}
                onChange={handleIPVersionChange}
              />
            </div>
          </div>
          
          {/* CIDR Input */}
          <div data-tour="cidr-input">
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#9ca3af',
              marginBottom: '0.5rem'
            }}>
              Enter CIDR Notation
            </label>
            <SubnetInput
              value={cidr}
              onChange={setCidr}
              onValidChange={handleValidChange}
              ipVersion={ipVersion}
            />
          </div>
        </div>
      </GlassCard>
      
      {/* Results */}
      <SubnetDetails
        subnetData={subnetData}
        provider={provider}
        ipVersion={ipVersion}
      />
      
      {/* Additional info for empty state */}
      {!subnetData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="lg">
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 500, 
              color: 'white', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Why Cloud-Native Matters
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'rgba(234, 179, 8, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#facc15' }}>🔶</span>
                </div>
                <h4 style={{ fontWeight: 500, color: 'white', margin: 0 }}>AWS</h4>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  Reserves 5 IPs: network, VPC router, DNS, future use, and broadcast
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#3b82f6' }}>🔷</span>
                </div>
                <h4 style={{ fontWeight: 500, color: 'white', margin: 0 }}>Azure</h4>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  Reserves 5 IPs: network, gateway, 2 for DNS, and broadcast
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#ef4444' }}>🔴</span>
                </div>
                <h4 style={{ fontWeight: 500, color: 'white', margin: 0 }}>GCP</h4>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  Reserves 4 IPs: network, gateway, second-to-last, and broadcast
                </p>
              </div>
            </div>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#4b5563', 
              marginTop: '1.5rem',
              textAlign: 'center'
            }}>
              Traditional calculators show 254 usable hosts for a /24, but AWS only gives you 251!
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default SubnetCalculator;

