import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../common';
import { getURLState, updateURLState } from '../../../utils/urlState';

import ProviderSelector from './ProviderSelector';
import SubnetInput from './SubnetInput';
import SubnetDetails from './SubnetDetails';
import IPv6Toggle from './IPv6Toggle';
import ShareButton from './ShareButton';
import IaCExport from './IaCExport';

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
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            <div>
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
            
            <div>
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
          <div>
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

