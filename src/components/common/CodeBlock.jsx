import React from 'react';
import { motion } from 'framer-motion';
import CopyButton from './CopyButton';

/**
 * CodeBlock - Glassmorphic code display with syntax highlighting hints
 */
const CodeBlock = ({
  code,
  language = 'plaintext',
  title = '',
  showLineNumbers = false,
  maxHeight = '400px',
  className = '',
  onCopy,
}) => {
  // Simple syntax highlighting for common patterns
  const highlightCode = (text) => {
    if (!text) return '';
    
    // Escape HTML first
    let highlighted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Apply highlighting based on language
    switch (language) {
      case 'hcl':
      case 'terraform':
        highlighted = highlighted
          // Comments
          .replace(/(#.*)$/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>')
          // Strings
          .replace(/(".*?")/g, '<span style="color: #34d399;">$1</span>')
          // Keywords
          .replace(/\b(resource|variable|output|module|provider|data|locals|terraform)\b/g, '<span style="color: #a78bfa; font-weight: 500;">$1</span>')
          // Properties
          .replace(/(\w+)\s*=/g, '<span style="color: #22d3ee;">$1</span> =')
          // Booleans
          .replace(/\b(true|false|null)\b/g, '<span style="color: #fbbf24;">$1</span>');
        break;
        
      case 'yaml':
        highlighted = highlighted
          // Comments
          .replace(/(#.*)$/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>')
          // Keys
          .replace(/^(\s*)(\w+):/gm, '$1<span style="color: #22d3ee;">$2</span>:')
          // Strings
          .replace(/:\s*(['"].*?['"])/g, ': <span style="color: #34d399;">$1</span>')
          // Booleans and numbers
          .replace(/:\s*(true|false|null|\d+)/g, ': <span style="color: #fbbf24;">$1</span>');
        break;
        
      case 'json':
        highlighted = highlighted
          // Strings (keys and values)
          .replace(/"([^"]+)":/g, '<span style="color: #22d3ee;">"$1"</span>:')
          .replace(/:\s*"([^"]+)"/g, ': <span style="color: #34d399;">"$1"</span>')
          // Booleans and numbers
          .replace(/:\s*(true|false|null|\d+)/g, ': <span style="color: #fbbf24;">$1</span>');
        break;
        
      case 'typescript':
      case 'javascript':
        highlighted = highlighted
          // Comments
          .replace(/(\/\/.*$)/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>')
          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6b7280; font-style: italic;">$1</span>')
          // Strings
          .replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, '<span style="color: #34d399;">$1</span>')
          // Keywords
          .replace(/\b(import|export|from|const|let|var|function|class|interface|type|new|return|if|else|for|while|async|await)\b/g, '<span style="color: #a78bfa; font-weight: 500;">$1</span>')
          // Numbers
          .replace(/\b(\d+)\b/g, '<span style="color: #fbbf24;">$1</span>');
        break;
        
      default:
        // No highlighting
        break;
    }
    
    return highlighted;
  };
  
  const lines = code?.split('\n') || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      style={{
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      {(title || language) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {/* Traffic lights */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <span style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.8)'
              }} />
              <span style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(234, 179, 8, 0.8)'
              }} />
              <span style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.8)'
              }} />
            </div>
            
            {title && (
              <span style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace'
              }}>
                {title}
              </span>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {language && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textTransform: 'uppercase',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace'
              }}>
                {language}
              </span>
            )}
            <CopyButton text={code} size="sm" onCopy={onCopy} />
          </div>
        </div>
      )}
      
      {/* Code Content */}
      <div style={{
        overflow: 'auto',
        maxHeight: maxHeight
      }}>
        <pre style={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.8125rem',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          lineHeight: 1.7
        }}>
          {showLineNumbers ? (
            <table style={{
              borderCollapse: 'collapse',
              width: '100%'
            }}>
              <tbody>
                {lines.map((line, index) => (
                  <tr 
                    key={index}
                    style={{
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      textAlign: 'right',
                      paddingRight: '1.25rem',
                      paddingLeft: '0.5rem',
                      color: '#4b5563',
                      userSelect: 'none',
                      width: '3rem',
                      verticalAlign: 'top',
                      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '0.75rem'
                    }}>
                      {index + 1}
                    </td>
                    <td
                      style={{
                        color: '#e5e7eb',
                        whiteSpace: 'pre',
                        paddingLeft: '1.25rem'
                      }}
                      dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code
              style={{
                color: '#e5e7eb',
                display: 'block'
              }}
              dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
            />
          )}
        </pre>
      </div>
      
      {/* Copy button for no-header variant */}
      {!title && !language && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem'
        }}>
          <CopyButton text={code} size="sm" onCopy={onCopy} />
        </div>
      )}
    </motion.div>
  );
};

export default CodeBlock;
