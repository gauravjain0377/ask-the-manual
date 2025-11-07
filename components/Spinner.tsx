/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

const Spinner: React.FC = () => {
    return (
        <motion.span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-subtle"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <motion.span
                className="block h-3 w-3 rounded-full bg-gradient-to-br from-accent to-accent-emerald"
                animate={{ scale: [1, 0.6, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            />
        </motion.span>
    );
};

export default Spinner;
