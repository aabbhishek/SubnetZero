import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Network, 
  Route, 
  Download,
  Code,
  ToggleLeft,
  ToggleRight,
  Zap
} from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import Option43Builder from './Option43Builder';
import StandardOptionsBuilder from './StandardOptionsBuilder';
import Option121Builder from './Option121Builder';
import DHCPExport from './DHCPExport';

const tabs = [
  { id: 'standard', name: 'Standard Options', icon: Network, description: 'Essential DHCP options' },
  { id: 'option43', name: 'Option 43', icon: Settings, description: 'Vendor-specific TLV' },
  { id: 'option121', name: 'Option 121', icon: Route, description: 'Classless static routes' }
];

const DHCPBuilder = () => {
  const [activeTab, setActiveTab] = useState('standard');
  const [devMode, setDevMode] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // State for each builder
  const [option43Bytes, setOption43Bytes] = useState([]);
  const [option121Routes, setOption121Routes] = useState([]);
  const [standardOptions, setStandardOptions] = useState({});

  const handleOption43Change = useCallback((bytes) => {
    setOption43Bytes(bytes);
  }, []);

  const handleOption121Change = useCallback((routes) => {
    setOption121Routes(routes);
  }, []);

  const handleStandardChange = useCallback((options) => {
    setStandardOptions(options);
  }, []);

  return (
    <div style={{ 
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={24} style={{ color: '#fb923c' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#f1f5f9',
                  margin: 0
                }}>
                  DHCP Option Builder
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#94a3b8',
                  margin: '4px 0 0 0'
                }}>
                  Visual TLV construction with multi-format export
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Dev Mode Toggle */}
            <button
              onClick={() => setDevMode(!devMode)}
              style={{
                padding: '10px 16px',
                background: devMode 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${devMode 
                  ? 'rgba(139, 92, 246, 0.4)' 
                  : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '8px',
                color: devMode ? '#a78bfa' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {devMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <Code size={16} />
              Dev Mode
            </button>

            {/* Export Button */}
            <button
              onClick={() => setShowExport(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '8px',
                color: '#22d3ee',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Download size={16} />
              Export Config
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: isActive 
                  ? 'rgba(249, 115, 22, 0.15)' 
                  : 'rgba(15, 23, 42, 0.6)',
                border: isActive 
                  ? '2px solid rgba(249, 115, 22, 0.5)' 
                  : '2px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: isActive ? '#fb923c' : '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
              }}
            >
              <Icon size={18} />
              <span>{tab.name}</span>
              {isActive && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#fb923c'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'standard' && (
          <StandardOptionsBuilder 
            value={standardOptions}
            onChange={handleStandardChange}
            devMode={devMode}
          />
        )}
        
        {activeTab === 'option43' && (
          <Option43Builder 
            value={option43Bytes}
            onChange={handleOption43Change}
            devMode={devMode}
          />
        )}
        
        {activeTab === 'option121' && (
          <Option121Builder 
            value={option121Routes}
            onChange={handleOption121Change}
            devMode={devMode}
          />
        )}
      </motion.div>

      {/* Quick Summary Card */}
      <GlassCard className="p-6" style={{ marginTop: '24px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#f1f5f9',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={18} style={{ color: '#fb923c' }} />
          Configuration Summary
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          {/* Standard Options Summary */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Network size={16} style={{ color: '#22d3ee' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
                Standard Options
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {standardOptions.gateway && (
                <div>Gateway: <span style={{ color: '#f1f5f9' }}>{standardOptions.gateway}</span></div>
              )}
              {standardOptions.dnsServers?.filter(Boolean).length > 0 && (
                <div>DNS: <span style={{ color: '#f1f5f9' }}>{standardOptions.dnsServers.filter(Boolean).length} server(s)</span></div>
              )}
              {standardOptions.domainName && (
                <div>Domain: <span style={{ color: '#f1f5f9' }}>{standardOptions.domainName}</span></div>
              )}
              {!standardOptions.gateway && !standardOptions.domainName && (
                <span style={{ color: '#64748b' }}>Not configured</span>
              )}
            </div>
          </div>

          {/* Option 43 Summary */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Settings size={16} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
                Option 43
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {option43Bytes.length > 0 ? (
                <div>
                  <span style={{ color: '#f1f5f9' }}>{option43Bytes.length} bytes</span> encoded
                </div>
              ) : (
                <span style={{ color: '#64748b' }}>Not configured</span>
              )}
            </div>
          </div>

          {/* Option 121 Summary */}
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Route size={16} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
                Option 121
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {option121Routes.length > 0 ? (
                <div>
                  <span style={{ color: '#f1f5f9' }}>{option121Routes.length} route(s)</span> configured
                </div>
              ) : (
                <span style={{ color: '#64748b' }}>No routes</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Export Modal */}
      <DHCPExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        option43Bytes={option43Bytes}
        option121Routes={option121Routes}
        standardOptions={standardOptions}
      />
    </div>
  );
};

export default DHCPBuilder;

