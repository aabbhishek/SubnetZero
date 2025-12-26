import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Globe, 
  Server, 
  Clock, 
  HardDrive,
  Plus,
  Trash2,
  AlertCircle,
  Check
} from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import { isValidIP } from '../../../utils/dhcp';

// Move InputField OUTSIDE the component to prevent re-creation on each render
const InputField = ({ label, value, onChange, placeholder, icon: Icon, error, monospace = true }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '13px', 
      color: '#94a3b8', 
      marginBottom: '8px' 
    }}>
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          paddingRight: error ? '36px' : '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
          borderRadius: '6px',
          color: '#f1f5f9',
          fontSize: '14px',
          fontFamily: monospace ? 'monospace' : 'inherit',
          outline: 'none'
        }}
      />
      {error && (
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
  </div>
);

// Move IPListField OUTSIDE the component as well
const IPListField = ({ label, items, onAdd, onRemove, onUpdate, icon: Icon }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '13px', 
      color: '#94a3b8', 
      marginBottom: '8px' 
    }}>
      {Icon && <Icon size={14} />}
      {label}
    </label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder="10.0.0.10"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${item && !isValidIP(item) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            {item && isValidIP(item) && (
              <Check 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#22c55e'
                }} 
              />
            )}
          </div>
          {items.length > 1 && (
            <button
              onClick={() => onRemove(index)}
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
        onClick={onAdd}
        style={{
          padding: '8px 14px',
          background: 'rgba(34, 211, 238, 0.1)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '6px',
          color: '#22d3ee',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          width: 'fit-content'
        }}
      >
        <Plus size={14} />
        Add
      </button>
    </div>
  </div>
);

const StandardOptionsBuilder = ({ value, onChange, devMode }) => {
  const [options, setOptions] = useState({
    subnetMask: '255.255.255.0',
    gateway: '',
    dnsServers: [''],
    domainName: '',
    leaseTime: 28800, // 8 hours in seconds
    leaseTimeUnit: 'hours',
    enablePxe: false,
    tftpServer: '',
    bootFilename: '',
    ntpServers: [''],
    domainSearch: ['']
  });

  // Use useCallback to prevent recreation of handlers
  const updateOption = useCallback((key, val) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: val };
      onChange(newOptions);
      return newOptions;
    });
  }, [onChange]);

  const addToList = useCallback((key) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[key] = [...newOptions[key], ''];
      onChange(newOptions);
      return newOptions;
    });
  }, [onChange]);

  const removeFromList = useCallback((key, index) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[key] = newOptions[key].filter((_, i) => i !== index);
      onChange(newOptions);
      return newOptions;
    });
  }, [onChange]);

  const updateListItem = useCallback((key, index, val) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      newOptions[key] = [...newOptions[key]];
      newOptions[key][index] = val;
      onChange(newOptions);
      return newOptions;
    });
  }, [onChange]);

  const convertLeaseTime = () => {
    const val = parseInt(options.leaseTime) || 0;
    switch (options.leaseTimeUnit) {
      case 'minutes': return val * 60;
      case 'hours': return val * 3600;
      case 'days': return val * 86400;
      default: return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Essential Options */}
      <GlassCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(34, 211, 238, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Network size={18} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
              Essential Options
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Core network configuration
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <InputField
            label="Option 1 - Subnet Mask"
            value={options.subnetMask}
            onChange={(v) => updateOption('subnetMask', v)}
            placeholder="255.255.255.0"
            icon={Network}
            error={options.subnetMask && !isValidIP(options.subnetMask)}
          />
          
          <InputField
            label="Option 3 - Default Gateway"
            value={options.gateway}
            onChange={(v) => updateOption('gateway', v)}
            placeholder="10.0.1.1"
            icon={Globe}
            error={options.gateway && !isValidIP(options.gateway)}
          />
        </div>

        <IPListField
          label="Option 6 - DNS Servers"
          items={options.dnsServers}
          onAdd={() => addToList('dnsServers')}
          onRemove={(i) => removeFromList('dnsServers', i)}
          onUpdate={(i, v) => updateListItem('dnsServers', i, v)}
          icon={Server}
        />

        <InputField
          label="Option 15 - Domain Name"
          value={options.domainName}
          onChange={(v) => updateOption('domainName', v)}
          placeholder="corp.example.com"
          icon={Globe}
          monospace={false}
        />

        {/* Lease Time */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '13px', 
            color: '#94a3b8', 
            marginBottom: '8px' 
          }}>
            <Clock size={14} />
            Option 51 - Lease Time
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={options.leaseTime}
              onChange={(e) => updateOption('leaseTime', e.target.value)}
              min="1"
              style={{
                width: '120px',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <select
              value={options.leaseTimeUnit}
              onChange={(e) => updateOption('leaseTimeUnit', e.target.value)}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
            <span style={{ color: '#64748b', fontSize: '13px' }}>
              ({convertLeaseTime().toLocaleString()} seconds)
            </span>
          </div>
        </div>
      </GlassCard>

      {/* PXE Boot Options */}
      <GlassCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HardDrive size={18} style={{ color: '#fb923c' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
              Network Boot (PXE)
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Options 66 & 67 for PXE boot
            </p>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={() => updateOption('enablePxe', !options.enablePxe)}
            style={{
              position: 'relative',
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              background: options.enablePxe 
                ? 'linear-gradient(135deg, #fb923c, #f97316)' 
                : 'rgba(100, 116, 139, 0.3)',
              transition: 'background 0.3s ease',
              boxShadow: options.enablePxe 
                ? '0 0 12px rgba(249, 115, 22, 0.4)' 
                : 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: options.enablePxe ? '26px' : '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                transition: 'left 0.3s ease'
              }}
            />
          </button>
        </div>

        <motion.div
          animate={{ opacity: options.enablePxe ? 1 : 0.5 }}
          style={{ pointerEvents: options.enablePxe ? 'auto' : 'none' }}
        >
          <InputField
            label="Option 66 - TFTP Server"
            value={options.tftpServer}
            onChange={(v) => updateOption('tftpServer', v)}
            placeholder="tftp.example.com or 10.0.1.50"
            icon={Server}
            monospace={false}
          />
          
          <InputField
            label="Option 67 - Boot Filename"
            value={options.bootFilename}
            onChange={(v) => updateOption('bootFilename', v)}
            placeholder="pxelinux.0"
            icon={HardDrive}
            monospace={false}
          />
        </motion.div>
      </GlassCard>

      {/* Advanced Options */}
      <GlassCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={18} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
              Advanced Options
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              NTP, domain search, and more
            </p>
          </div>
        </div>

        <IPListField
          label="Option 42 - NTP Servers"
          items={options.ntpServers}
          onAdd={() => addToList('ntpServers')}
          onRemove={(i) => removeFromList('ntpServers', i)}
          onUpdate={(i, v) => updateListItem('ntpServers', i, v)}
          icon={Clock}
        />

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '13px', 
            color: '#94a3b8', 
            marginBottom: '8px' 
          }}>
            <Globe size={14} />
            Option 119 - Domain Search List
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.domainSearch.map((domain, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => updateListItem('domainSearch', index, e.target.value)}
                  placeholder="corp.example.com"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {options.domainSearch.length > 1 && (
                  <button
                    onClick={() => removeFromList('domainSearch', index)}
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
              onClick={() => addToList('domainSearch')}
              style={{
                padding: '8px 14px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '6px',
                color: '#a78bfa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                width: 'fit-content'
              }}
            >
              <Plus size={14} />
              Add Domain
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default StandardOptionsBuilder;
