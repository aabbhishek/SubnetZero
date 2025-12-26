import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Wifi, 
  Server, 
  Radio, 
  Phone, 
  Settings,
  ChevronDown,
  Code,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { 
  VENDOR_TEMPLATES, 
  isValidIP, 
  ipToHex, 
  bytesToHex 
} from '../../../utils/dhcp';

const vendorIcons = {
  ciscoWLC: Wifi,
  arubaController: Radio,
  ubiquitiUnifi: Server,
  meraki: Wifi,
  polycomPhones: Phone,
  custom: Settings
};

const Option43Builder = ({ value, onChange, devMode }) => {
  const [selectedVendor, setSelectedVendor] = useState('ciscoWLC');
  const [vendorConfig, setVendorConfig] = useState({
    ciscoWLC: { controllerIPs: [''] },
    arubaController: { controllerIPs: [''] },
    ubiquitiUnifi: { controllerUrl: '' },
    meraki: { controllerIPs: [''] },
    polycomPhones: { provisioningUrl: '' },
    custom: { entries: [{ type: 1, value: [] }] }
  });
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const template = VENDOR_TEMPLATES[selectedVendor];
  const config = vendorConfig[selectedVendor];
  const Icon = vendorIcons[selectedVendor];

  // Encode current configuration
  const encodedBytes = template.encode(config);
  const hexOutput = bytesToHex(encodedBytes, ':');

  // Update parent
  React.useEffect(() => {
    onChange(encodedBytes);
  }, [encodedBytes, onChange]);

  const handleAddIP = () => {
    const newConfig = { ...vendorConfig };
    newConfig[selectedVendor].controllerIPs.push('');
    setVendorConfig(newConfig);
  };

  const handleRemoveIP = (index) => {
    const newConfig = { ...vendorConfig };
    newConfig[selectedVendor].controllerIPs.splice(index, 1);
    setVendorConfig(newConfig);
  };

  const handleIPChange = (index, value) => {
    const newConfig = { ...vendorConfig };
    newConfig[selectedVendor].controllerIPs[index] = value;
    setVendorConfig(newConfig);
  };

  const handleUrlChange = (field, value) => {
    const newConfig = { ...vendorConfig };
    newConfig[selectedVendor][field] = value;
    setVendorConfig(newConfig);
  };

  const getBreakdown = () => {
    const breakdown = [];
    let i = 0;
    
    if (selectedVendor === 'ciscoWLC') {
      config.controllerIPs.forEach(ip => {
        if (isValidIP(ip)) {
          breakdown.push({ label: 'f1', desc: 'Type 241 (Cisco WLC IP)' });
          breakdown.push({ label: '04', desc: 'Length 4 bytes' });
          breakdown.push({ label: ipToHex(ip), desc: ip });
        }
      });
    } else if (selectedVendor === 'arubaController' || selectedVendor === 'meraki') {
      config.controllerIPs.forEach(ip => {
        if (isValidIP(ip)) {
          breakdown.push({ label: '01', desc: 'Type 1 (Controller IP)' });
          breakdown.push({ label: '04', desc: 'Length 4 bytes' });
          breakdown.push({ label: ipToHex(ip), desc: ip });
        }
      });
    } else if (selectedVendor === 'ubiquitiUnifi') {
      const url = config.controllerUrl;
      if (url) {
        breakdown.push({ label: '01', desc: 'Type 1 (Controller URL)' });
        breakdown.push({ label: url.length.toString(16).padStart(2, '0'), desc: `Length ${url.length} bytes` });
        breakdown.push({ label: '...', desc: `"${url}"` });
      }
    }
    
    return breakdown;
  };

  return (
    <GlassCard className="p-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Settings size={20} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
            Option 43 - Vendor Specific
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Configure vendor-specific DHCP options with TLV encoding
          </p>
        </div>
      </div>

      {/* Vendor Template Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
          Vendor Template
        </label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVendorDropdown(!showVendorDropdown)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} style={{ color: '#a78bfa' }} />
              {template.name}
            </span>
            <ChevronDown size={18} style={{ 
              color: '#94a3b8',
              transform: showVendorDropdown ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s'
            }} />
          </button>

          <AnimatePresence>
            {showVendorDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  zIndex: 50
                }}
              >
                {Object.entries(VENDOR_TEMPLATES).map(([key, tmpl]) => {
                  const ItemIcon = vendorIcons[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedVendor(key);
                        setShowVendorDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: selectedVendor === key ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: 'none',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = selectedVendor === key ? 'rgba(139, 92, 246, 0.2)' : 'transparent'}
                    >
                      <ItemIcon size={18} style={{ color: '#a78bfa' }} />
                      <div>
                        <div>{tmpl.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tmpl.description}</div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Vendor Configuration */}
      <div style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        marginBottom: '24px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '16px' }}>
          {template.name} Configuration
        </h4>

        {/* IP List Fields */}
        {(selectedVendor === 'ciscoWLC' || selectedVendor === 'arubaController' || selectedVendor === 'meraki') && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              Controller IPs
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.controllerIPs.map((ip, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => handleIPChange(index, e.target.value)}
                      placeholder="10.0.100.10"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${ip && !isValidIP(ip) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
                        borderRadius: '6px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                    />
                    {ip && !isValidIP(ip) && (
                      <AlertCircle 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: '#ef4444'
                        }} 
                      />
                    )}
                  </div>
                  {config.controllerIPs.length > 1 && (
                    <button
                      onClick={() => handleRemoveIP(index)}
                      style={{
                        padding: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddIP}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  width: 'fit-content'
                }}
              >
                <Plus size={16} />
                Add Controller IP
              </button>
            </div>
          </div>
        )}

        {/* URL Fields */}
        {selectedVendor === 'ubiquitiUnifi' && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              Controller URL
            </label>
            <input
              type="text"
              value={config.controllerUrl}
              onChange={(e) => handleUrlChange('controllerUrl', e.target.value)}
              placeholder="http://unifi.local:8080/inform"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        )}

        {selectedVendor === 'polycomPhones' && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              Provisioning Server URL
            </label>
            <input
              type="text"
              value={config.provisioningUrl}
              onChange={(e) => handleUrlChange('provisioningUrl', e.target.value)}
              placeholder="http://provisioning.example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        )}
      </div>

      {/* Encoded Output */}
      <div style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '12px' }}>
          Encoded Output
        </h4>
        
        <div style={{
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#22d3ee',
          wordBreak: 'break-all'
        }}>
          <span style={{ color: '#94a3b8' }}>Hex: </span>
          {hexOutput || '(no data)'}
        </div>

        {/* Dev Mode Breakdown */}
        {devMode && encodedBytes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '12px',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              <Code size={16} />
              TLV Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {getBreakdown().map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '16px',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#22d3ee', minWidth: '120px' }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>=</span>
                  <span style={{ color: '#e2e8f0' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};

export default Option43Builder;

