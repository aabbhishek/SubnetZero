/**
 * IaC Generators - Central Export
 * Supports Terraform, CloudFormation, and Pulumi
 */

export { generateTerraform, generateAWSTerraform, generateAzureTerraform, generateGCPTerraform } from './terraform';
export { generateCloudFormationYAML, generateCloudFormationJSON } from './cloudformation';
export { generatePulumi, generateAWSPulumi, generateAzurePulumi, generateGCPPulumi } from './pulumi';

/**
 * Available IaC formats
 */
export const IAC_FORMATS = {
  terraform: {
    id: 'terraform',
    name: 'Terraform',
    extension: '.tf',
    language: 'hcl',
    description: 'HashiCorp Configuration Language'
  },
  cloudformationYaml: {
    id: 'cloudformationYaml',
    name: 'CloudFormation (YAML)',
    extension: '.yaml',
    language: 'yaml',
    description: 'AWS CloudFormation template in YAML'
  },
  cloudformationJson: {
    id: 'cloudformationJson',
    name: 'CloudFormation (JSON)',
    extension: '.json',
    language: 'json',
    description: 'AWS CloudFormation template in JSON'
  },
  pulumi: {
    id: 'pulumi',
    name: 'Pulumi (TypeScript)',
    extension: '.ts',
    language: 'typescript',
    description: 'Pulumi infrastructure code in TypeScript'
  }
};

/**
 * Generate IaC code based on format and provider
 * @param {string} format - IaC format (terraform, cloudformationYaml, cloudformationJson, pulumi)
 * @param {string} provider - Cloud provider (aws, azure, gcp)
 * @param {Object} config - Configuration object
 * @returns {Object} - { code: string, format: Object }
 */
export function generateIaC(format, provider, config) {
  const { generateTerraform } = require('./terraform');
  const { generateCloudFormationYAML, generateCloudFormationJSON } = require('./cloudformation');
  const { generatePulumi } = require('./pulumi');
  
  let code;
  
  switch (format) {
    case 'terraform':
      code = generateTerraform(provider, config);
      break;
    case 'cloudformationYaml':
      code = generateCloudFormationYAML(config);
      break;
    case 'cloudformationJson':
      code = generateCloudFormationJSON(config);
      break;
    case 'pulumi':
      code = generatePulumi(provider, config);
      break;
    default:
      code = generateTerraform(provider, config);
  }
  
  return {
    code,
    format: IAC_FORMATS[format] || IAC_FORMATS.terraform
  };
}

const iacExports = {
  generateIaC,
  IAC_FORMATS
};

export default iacExports;

