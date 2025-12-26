import React from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

/**
 * PrivacyBadge - Shows "Data never leaves your browser" messaging
 */
const PrivacyBadge = ({ className = '' }) => {
  const ShieldIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
  
  return (
    <Tooltip
      content={
        <div className="max-w-[250px]">
          <p className="font-medium mb-1">🔒 100% Client-Side</p>
          <p className="text-xs text-gray-400">
            All calculations happen in your browser. No data is ever sent to any server. 
            Your network configurations stay completely private.
          </p>
        </div>
      }
      position="bottom"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          inline-flex items-center gap-2
          px-3 py-1.5
          bg-green-500/10
          border border-green-500/20
          rounded-full
          text-xs font-medium text-green-400
          cursor-help
          ${className}
        `}
      >
        <ShieldIcon />
        <span>Data never leaves your browser</span>
      </motion.div>
    </Tooltip>
  );
};

export default PrivacyBadge;

