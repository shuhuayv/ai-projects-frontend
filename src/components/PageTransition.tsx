import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

// 显式 4 元组类型，规避 framer-motion 对 readonly / number[] 的 TS 报错
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const motionTokens = {
  duration: { fast: 0.18, base: 0.3, slow: 0.5 },
  ease: EASE,
  spring: { type: 'spring' as const, stiffness: 260, damping: 24 },
};

export interface PageTransitionProps { children: ReactNode; }

export function PageTransition({ children }: PageTransitionProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease }}
    >
      {children}
    </motion.div>
  );
}
