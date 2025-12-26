import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Route, 
  Plus, 
  Trash2, 
  Edit2,
  Check,
  X,
  Code,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import { 
  isValidIP, 
  encodeRoute121, 
  encodeOption121, 
  bytesToHex,
  ipToHex
} from '../../../utils/dhcp';

const Option121Builder = ({ value, onChange, devMode }) => {
  const [routes, setRoutes] = useState([
    { id: 1, destination: '192.168.10.0', prefix: 24, gateway: '10.0.1.1' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ destination: '', prefix: 24, gateway: '' });
  const [nextId, setNextId] = useState(2);

  // Calculate encoded output
  const encodedBytes = encodeOption121(routes.filter(r => 
    isValidIP(r.destination) && isValidIP(r.gateway) && r.prefix >= 0 && r.prefix <= 32
  ));
  const hexOutput = bytesToHex(encodedBytes, ':');

  useEffect(() => {
    onChange(routes);
  }, [routes, onChange]);

  const addRoute = () => {
    setRoutes([...routes, { 
      id: nextId, 
      destination: '', 
      prefix: 24, 
      gateway: '' 
    }]);
    setEditingId(nextId);
    setEditForm({ destination: '', prefix: 24, gateway: '' });
    setNextId(nextId + 1);
  };

  const deleteRoute = (id) => {
    setRoutes(routes.filter(r => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEdit = (route) => {
    setEditingId(route.id);
    setEditForm({ 
      destination: route.destination, 
      prefix: route.prefix, 
      gateway: route.gateway 
    });
  };

  const saveEdit = () => {
    setRoutes(routes.map(r => 
      r.id === editingId 
        ? { ...r, ...editForm }
        : r
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    // If it's a new empty route, delete it
    const route = routes.find(r => r.id === editingId);
    if (route && !route.destination && !route.gateway) {
      deleteRoute(editingId);
    }
    setEditingId(null);
  };

  const isValidRoute = (route) => {
    return isValidIP(route.destination) && 
           isValidIP(route.gateway) && 
           route.prefix >= 0 && 
           route.prefix <= 32;
  };

  const getRouteBreakdown = (route) => {
    if (!isValidRoute(route)) return [];
    
    const encoded = encodeRoute121(route.destination, route.prefix, route.gateway);
    const breakdown = [];
    
    // Prefix length
    breakdown.push({
      hex: encoded[0].toString(16).padStart(2, '0'),
      desc: `/${route.prefix} prefix length`
    });
    
    // Significant octets
    const significantOctets = Math.ceil(route.prefix / 8);
    const destBytes = route.destination.split('.').map(Number);
    for (let i = 0; i < significantOctets; i++) {
      breakdown.push({
        hex: destBytes[i].toString(16).padStart(2, '0'),
        desc: `Destination octet ${i + 1}`
      });
    }
    
    // Gateway
    const gwBytes = route.gateway.split('.').map(Number);
    breakdown.push({
      hex: gwBytes.map(b => b.toString(16).padStart(2, '0')).join(':'),
      desc: `Gateway ${route.gateway}`
    });
    
    return breakdown;
  };

  return (
    <GlassCard className="p-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Route size={20} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
            Option 121 - Classless Static Routes
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            RFC 3442 classless static route configuration
          </p>
        </div>
      </div>

      {/* Routes Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 80px 1fr 100px',
          gap: '16px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          fontSize: '12px',
          fontWeight: '600',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <span>#</span>
          <span>Destination</span>
          <span>Prefix</span>
          <span>Next Hop</span>
          <span>Actions</span>
        </div>

        {/* Routes */}
        <AnimatePresence>
          {routes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                borderBottom: index < routes.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
              }}
            >
              {editingId === route.id ? (
                /* Edit Mode */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 80px 1fr 100px',
                  gap: '16px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  background: 'rgba(139, 92, 246, 0.05)'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>{index + 1}</span>
                  <input
                    type="text"
                    value={editForm.destination}
                    onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                    placeholder="192.168.10.0"
                    autoFocus
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${editForm.destination && !isValidIP(editForm.destination) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                      borderRadius: '6px',
                      color: '#f1f5f9',
                      fontSize: '14px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>/</span>
                    <input
                      type="number"
                      value={editForm.prefix}
                      onChange={(e) => setEditForm({ ...editForm, prefix: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="32"
                      style={{
                        width: '50px',
                        padding: '8px 6px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editForm.gateway}
                    onChange={(e) => setEditForm({ ...editForm, gateway: e.target.value })}
                    placeholder="10.0.1.1"
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${editForm.gateway && !isValidIP(editForm.gateway) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                      borderRadius: '6px',
                      color: '#f1f5f9',
                      fontSize: '14px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={saveEdit}
                      disabled={!isValidIP(editForm.destination) || !isValidIP(editForm.gateway)}
                      style={{
                        padding: '8px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '6px',
                        color: '#22c55e',
                        cursor: 'pointer',
                        opacity: isValidIP(editForm.destination) && isValidIP(editForm.gateway) ? 1 : 0.5
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 80px 1fr 100px',
                  gap: '16px',
                  padding: '12px 16px',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>{index + 1}</span>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '14px',
                    color: isValidIP(route.destination) ? '#f1f5f9' : '#ef4444'
                  }}>
                    {route.destination || <span style={{ color: '#64748b' }}>—</span>}
                  </span>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '14px',
                    color: '#22d3ee'
                  }}>
                    /{route.prefix}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRight size={14} style={{ color: '#64748b' }} />
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '14px',
                      color: isValidIP(route.gateway) ? '#f1f5f9' : '#ef4444'
                    }}>
                      {route.gateway || <span style={{ color: '#64748b' }}>—</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => startEdit(route)}
                      style={{
                        padding: '8px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#a78bfa',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Route Button */}
        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={addRoute}
            style={{
              padding: '10px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22c55e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Plus size={16} />
            Add Route
          </button>
        </div>
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
          {hexOutput || '(no valid routes)'}
        </div>

        {/* Dev Mode Breakdown */}
        {devMode && routes.filter(isValidRoute).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '12px',
              color: '#22c55e',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              <Code size={16} />
              Route Encoding Breakdown
            </div>
            
            {routes.filter(isValidRoute).map((route, routeIndex) => (
              <div key={route.id} style={{ marginBottom: routeIndex < routes.length - 1 ? '16px' : 0 }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Route {routeIndex + 1}: {route.destination}/{route.prefix} via {route.gateway}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                  {getRouteBreakdown(route).map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '16px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#22d3ee', minWidth: '100px' }}>{item.hex}</span>
                      <span style={{ color: '#64748b' }}>=</span>
                      <span style={{ color: '#e2e8f0' }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};

export default Option121Builder;

