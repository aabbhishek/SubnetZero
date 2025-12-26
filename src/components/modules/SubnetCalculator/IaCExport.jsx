import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button, CodeBlock } from '../../common';
import { generateIaC, IAC_FORMATS } from '../../../utils/iacGenerators';

/**
 * IaCExport - Export subnet config to Terraform/CloudFormation/Pulumi
 */
const IaCExport = ({
  subnetData,
  provider = 'aws',
  vpcCidr,
  vpcName = 'main-vpc',
  subnets = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('terraform');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // If no subnets provided, create a single subnet from subnetData
  const effectiveSubnets = subnets.length > 0 
    ? subnets 
    : subnetData 
      ? [{ 
          name: 'subnet-1', 
          cidr: `${subnetData.networkAddress}/${subnetData.prefix}`,
          tier: 'private',
          az: `${provider === 'aws' ? 'us-east-1a' : provider === 'azure' ? 'eastus' : 'us-central1-a'}`
        }]
      : [];
  
  const effectiveVpcCidr = vpcCidr || (subnetData ? `${subnetData.networkAddress}/${Math.max(subnetData.prefix - 8, 8)}` : '10.0.0.0/16');
  
  const handleExport = () => {
    const config = {
      vpcCidr: effectiveVpcCidr,
      vpcName,
      region: provider === 'aws' ? 'us-east-1' : provider === 'azure' ? 'eastus' : 'us-central1',
      subnets: effectiveSubnets
    };
    
    const { code } = generateIaC(selectedFormat, provider, config);
    setGeneratedCode(code);
    setIsOpen(true);
  };
  
  const formatOptions = Object.entries(IAC_FORMATS).map(([key, format]) => ({
    value: key,
    label: format.name,
    extension: format.extension,
    language: format.language
  }));
  
  const ExportIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
  
  const downloadCode = () => {
    const format = IAC_FORMATS[selectedFormat];
    const filename = `subnet-config${format.extension}`;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <>
      <Button
        variant="primary"
        size="md"
        icon={<ExportIcon />}
        onClick={handleExport}
        disabled={!subnetData && subnets.length === 0}
        className={className}
      >
        Export IaC
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal Container - Flex centered */}
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
                zIndex: 100,
                padding: '1rem'
              }}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '900px',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1
                }}
              >
                <GlassCard variant="elevated" padding="none" animate={false} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '85vh' }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  flexShrink: 0
                }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Export Infrastructure Code</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Ready-to-use code for your infrastructure
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '0.5rem',
                      color: '#9ca3af',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                
                {/* Format selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  overflowX: 'auto',
                  flexShrink: 0
                }}>
                  {formatOptions.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        setSelectedFormat(format.value);
                        const config = {
                          vpcCidr: effectiveVpcCidr,
                          vpcName,
                          region: provider === 'aws' ? 'us-east-1' : provider === 'azure' ? 'eastus' : 'us-central1',
                          subnets: effectiveSubnets
                        };
                        const { code } = generateIaC(format.value, provider, config);
                        setGeneratedCode(code);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: selectedFormat === format.value
                          ? 'linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: selectedFormat === format.value ? 'white' : '#9ca3af',
                        border: selectedFormat === format.value
                          ? '1px solid rgba(6, 182, 212, 0.3)'
                          : '1px solid transparent'
                      }}
                    >
                      {format.label}
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>{format.extension}</span>
                    </button>
                  ))}
                </div>
                
                {/* Code display */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem', minHeight: 0 }}>
                  <CodeBlock
                    code={generatedCode}
                    language={IAC_FORMATS[selectedFormat]?.language || 'plaintext'}
                    title={`subnet-config${IAC_FORMATS[selectedFormat]?.extension}`}
                    showLineNumbers
                    maxHeight="100%"
                  />
                </div>
                
                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  flexShrink: 0
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    Generated for {provider.toUpperCase()} • {effectiveSubnets.length} subnet(s)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ExportIcon />}
                      onClick={downloadCode}
                    >
                      Download File
                    </Button>
                  </div>
                </div>
              </GlassCard>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default IaCExport;

