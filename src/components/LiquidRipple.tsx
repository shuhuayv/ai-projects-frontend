import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from './PageTransition';

export interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

export interface LiquidRippleProps {
  /** 由父组件维护的活动 ripple 列表。 */
  ripples: Ripple[];
  /** 水滴环颜色。 */
  color?: string;
  /** 单个 ripple 动画完成后的清理回调。 */
  onComplete?: (key: number) => void;
}

/**
 * 通用水滴环渲染层。
 * 中心透明，冰青色环向外扩散，最后渐隐。
 */
export function LiquidRipple({
  ripples,
  color = 'rgba(150,225,240,0.72)',
  onComplete,
}: LiquidRippleProps): React.ReactElement {
  return (
    <AnimatePresence>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.key}
          aria-hidden="true"
          data-liquid-ripple="true"
          initial={{ scale: 0, opacity: 0.72 }}
          animate={{ scale: 1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          onAnimationComplete={() => onComplete?.(ripple.key)}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            marginLeft: -ripple.size / 2,
            marginTop: -ripple.size / 2,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
            background: `radial-gradient(
              circle,
              rgba(150,225,240,0) 26%,
              ${color} 48%,
              rgba(150,225,240,0) 70%
            )`,
          }}
        />
      ))}
    </AnimatePresence>
  );
}
