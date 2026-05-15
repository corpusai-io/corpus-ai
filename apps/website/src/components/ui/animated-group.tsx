'use client';

import { motion, type Variants } from 'framer-motion';
import React from 'react';

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

const defaultContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const defaultItem: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
  },
};

export function AnimatedGroup({ children, className, variants }: AnimatedGroupProps) {
  const containerVariants = variants?.container ?? defaultContainer;
  const itemVariants = variants?.item ?? defaultItem;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) =>
        child ? (
          <motion.div variants={itemVariants} style={{ display: 'contents' }}>
            {child}
          </motion.div>
        ) : null
      )}
    </motion.div>
  );
}
