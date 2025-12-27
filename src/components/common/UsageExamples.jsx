import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UsageExamples - Collapsible examples section for each module
 */
const UsageExamples = ({ examples, onApplyExample }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeExample, setActiveExample] = useState(null);

  const BookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );

  const ChevronIcon = ({ isOpen }) => (
    <motion.svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );

  const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const LightbulbIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M12 8a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V17h4v-1.5c1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z" />
    </svg>
  );

  return (
    <div style={{
      marginBottom: '1.5rem',
      borderRadius: '12px',
      background: 'rgba(34, 211, 238, 0.03)',
      border: '1px solid rgba(34, 211, 238, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header - Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#22d3ee',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(34, 211, 238, 0.2)'
          }}>
            <LightbulbIcon />
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '0.875rem',
              color: '#fff'
            }}>
              Usage Examples
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              marginTop: '2px'
            }}>
              {examples.length} real-world scenarios to get you started
            </div>
          </div>
        </div>
        <ChevronIcon isOpen={isExpanded} />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 1rem 1rem 1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem'
            }}>
              {examples.map((example, index) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: activeExample === example.id 
                      ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: activeExample === example.id 
                      ? '1px solid rgba(34, 211, 238, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setActiveExample(activeExample === example.id ? null : example.id)}
                  onMouseEnter={(e) => {
                    if (activeExample !== example.id) {
                      e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeExample !== example.id) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }
                  }}
                >
                  {/* Example Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: example.iconBg || 'rgba(34, 211, 238, 0.1)',
                      color: example.iconColor || '#22d3ee',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {example.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: '#fff',
                        marginBottom: '0.25rem'
                      }}>
                        {example.title}
                      </h4>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        fontSize: '0.65rem',
                        fontWeight: 500
                      }}>
                        {example.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ 
                    margin: '0 0 0.75rem 0', 
                    fontSize: '0.8rem', 
                    color: '#9ca3af',
                    lineHeight: 1.5
                  }}>
                    {example.description}
                  </p>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {activeExample === example.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        {/* Sample Input */}
                        {example.sampleInput && (
                          <div style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            marginBottom: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <div style={{ 
                              fontSize: '0.65rem', 
                              color: '#6b7280', 
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600
                            }}>
                              Sample Input
                            </div>
                            <code style={{
                              display: 'block',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8rem',
                              color: '#22d3ee',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all'
                            }}>
                              {example.sampleInput}
                            </code>
                          </div>
                        )}

                        {/* Expected Output */}
                        {example.expectedOutput && (
                          <div style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(34, 197, 94, 0.05)',
                            marginBottom: '0.75rem',
                            border: '1px solid rgba(34, 197, 94, 0.1)'
                          }}>
                            <div style={{ 
                              fontSize: '0.65rem', 
                              color: '#6b7280', 
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600
                            }}>
                              Expected Output
                            </div>
                            <div style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: '#4ade80',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {example.expectedOutput}
                            </div>
                          </div>
                        )}

                        {/* Steps */}
                        {example.steps && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ 
                              fontSize: '0.65rem', 
                              color: '#6b7280', 
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600
                            }}>
                              Steps
                            </div>
                            <ol style={{
                              margin: 0,
                              paddingLeft: '1.25rem',
                              fontSize: '0.75rem',
                              color: '#d1d5db',
                              lineHeight: 1.7
                            }}>
                              {example.steps.map((step, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Check if applyData has meaningful content beyond just tab switching */}
                        {(() => {
                          const hasApplyData = example.applyData && onApplyExample;
                          const hasOnlyTabSwitch = hasApplyData && 
                            Object.keys(example.applyData).length === 1 && 
                            example.applyData.tab;
                          const hasFullAutomation = hasApplyData && !hasOnlyTabSwitch;

                          if (hasFullAutomation) {
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApplyExample(example.applyData);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(168, 85, 247, 0.2))',
                                  border: '1px solid rgba(34, 211, 238, 0.3)',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <PlayIcon />
                                Try This Example
                              </button>
                            );
                          } else if (hasOnlyTabSwitch) {
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onApplyExample(example.applyData);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(107, 114, 128, 0.2)',
                                    border: '1px solid rgba(107, 114, 128, 0.3)',
                                    borderRadius: '6px',
                                    color: '#d1d5db',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="9" y1="3" x2="9" y2="21" />
                                  </svg>
                                  Go to {example.applyData.tab === 'option43' ? 'Option 43' : 
                                         example.applyData.tab === 'option121' ? 'Option 121' : 
                                         example.applyData.tab === 'standard' ? 'Standard Options' : 
                                         example.applyData.tab} Tab
                                </button>
                                <div style={{
                                  padding: '0.5rem 0.625rem',
                                  borderRadius: '6px',
                                  background: 'rgba(251, 191, 36, 0.08)',
                                  border: '1px solid rgba(251, 191, 36, 0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <svg 
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="#fbbf24" 
                                    strokeWidth="2"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                  </svg>
                                  <span style={{ fontSize: '0.7rem', color: '#fbbf24' }}>
                                    Enter values manually after switching
                                  </span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div style={{
                                padding: '0.625rem 0.75rem',
                                borderRadius: '6px',
                                background: 'rgba(251, 191, 36, 0.08)',
                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem'
                              }}>
                                <svg 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="#fbbf24" 
                                  strokeWidth="2"
                                  style={{ marginTop: '2px', flexShrink: 0 }}
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="16" x2="12" y2="12" />
                                  <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <div style={{ fontSize: '0.75rem', color: '#d1d5db', lineHeight: 1.5 }}>
                                  <span style={{ color: '#fbbf24', fontWeight: 500 }}>Manual setup required</span>
                                  <br />
                                  Follow the steps above to configure this example.
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint */}
                  {activeExample !== example.id && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#4b5563',
                      marginTop: '0.5rem'
                    }}>
                      Click to see details →
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsageExamples;

