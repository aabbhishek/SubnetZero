import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  Server,
  FileCode,
  Terminal,
  Code
} from 'lucide-react';
import { 
  DHCP_SERVER_TYPES, 
  generateDhcpConfig
} from '../../../utils/dhcp';

const serverIcons = {
  iscDhcp: Server,
  keaDhcp: FileCode,
  dnsmasq: Terminal,
  windowsDhcp: Terminal,
  ciscoIos: Server,
  rawHex: Code
};

const DHCPExport = ({ 
  isOpen, 
  onClose, 
  option43Bytes,
  option121Routes,
  standardOptions
}) => {
  const [selectedServer, setSelectedServer] = useState('iscDhcp');
  const [copied, setCopied] = useState(false);

  // Build full config for export
  const fullConfig = useMemo(() => {
    const opts = standardOptions || {};
    return {
      subnet: opts.gateway ? opts.gateway.split('.').slice(0, 3).join('.') + '.0' : '10.0.1.0',
      netmask: opts.subnetMask || '255.255.255.0',
      rangeStart: opts.gateway ? opts.gateway.split('.').slice(0, 3).join('.') + '.20' : '10.0.1.20',
      rangeEnd: opts.gateway ? opts.gateway.split('.').slice(0, 3).join('.') + '.250' : '10.0.1.250',
      gateway: opts.gateway || '10.0.1.1',
      dns: (opts.dnsServers || []).filter(Boolean),
      domain: opts.domainName || '',
      leaseTime: opts.leaseTime || 28800,
      scopeName: 'Scope1',
      poolName: 'POOL1',
      options: {
        option43: option43Bytes || [],
        option121: option121Routes || [],
        option119: (opts.domainSearch || []).filter(Boolean)
      }
    };
  }, [standardOptions, option43Bytes, option121Routes]);

  const generatedCode = useMemo(() => {
    return generateDhcpConfig(selectedServer, fullConfig);
  }, [selectedServer, fullConfig]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const serverType = DHCP_SERVER_TYPES[selectedServer];
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dhcp-config${serverType.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          maxHeight: 'calc(100vh - 40px)',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(34, 211, 238, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Download size={18} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
                Export DHCP Configuration
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Generate configuration for your DHCP server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Server Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: '500', 
              color: '#e2e8f0', 
              marginBottom: '10px' 
            }}>
              Server Type
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: '8px' 
            }}>
              {Object.entries(DHCP_SERVER_TYPES).map(([key, server]) => {
                const Icon = serverIcons[key] || Server;
                const isSelected = selectedServer === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedServer(key)}
                    style={{
                      padding: '10px 8px',
                      background: isSelected 
                        ? 'rgba(34, 211, 238, 0.15)' 
                        : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isSelected 
                        ? 'rgba(34, 211, 238, 0.4)' 
                        : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: '8px',
                      color: isSelected ? '#22d3ee' : '#e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: '11px', fontWeight: '500' }}>{server.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Code */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Code Header */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.5)'
            }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {DHCP_SERVER_TYPES[selectedServer].description}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '5px 10px',
                    background: copied 
                      ? 'rgba(34, 197, 94, 0.2)' 
                      : 'rgba(139, 92, 246, 0.1)',
                    border: `1px solid ${copied 
                      ? 'rgba(34, 197, 94, 0.4)' 
                      : 'rgba(139, 92, 246, 0.3)'}`,
                    borderRadius: '5px',
                    color: copied ? '#22c55e' : '#a78bfa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '5px 10px',
                    background: 'rgba(34, 211, 238, 0.1)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    borderRadius: '5px',
                    color: '#22d3ee',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
            
            {/* Code Content */}
            <div style={{
              padding: '14px',
              maxHeight: '350px',
              overflowY: 'auto',
              overflowX: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#e2e8f0',
                whiteSpace: 'pre',
                tabSize: 4
              }}>
                {generatedCode}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DHCPExport;
