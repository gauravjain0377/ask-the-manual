/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  total: number;
  message: string;
  fileName?: string;
  icon?: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, message, fileName, icon }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          className="elevated-card w-full max-w-xl space-y-8 px-10 py-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {icon && <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">{icon}</div>}
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink">{message}</h2>
            <p className="text-sm text-ink-soft/80" title={fileName}>{fileName || ''}</p>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-soft">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent via-accent-soft to-accent-emerald"
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft/60">
            Step {progress} of {total}
          </div>
        </motion.div>
    </div>
  );
};

export default ProgressBar;