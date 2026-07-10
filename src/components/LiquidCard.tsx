import { Card, CardProps } from '@mui/material';
import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import { EASE } from './PageTransition';
import {
  LiquidRipple,
  type Ripple,
} from './LiquidRipple';

/*
 * 用 as any 规避 framer-motion 与 MUI Card 的 ref 类型冲突。
 */
const MotionCard = motion(Card as any);

export interface LiquidCardProps extends CardProps {
  /** 是否启用 hover 上浮动效，默认启用。 */
  hoverable?: boolean;

  /** 点击水滴环颜色。 */
  rippleColor?: string;
}

export const LiquidCard = forwardRef<
  HTMLDivElement,
  LiquidCardProps
>(function LiquidCard(
  {
    hoverable = true,
    rippleColor = 'rgba(150,225,240,0.58)',
    children,
    sx,
    onPointerDown,
    ...rest
  },
  ref,
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const farthestX = Math.max(x, rect.width - x);
      const farthestY = Math.max(y, rect.height - y);
      const size = Math.hypot(farthestX, farthestY) * 2;

      const ripple: Ripple = {
        key: idRef.current++,
        x,
        y,
        size,
      };

      setRipples((current) => [...current, ripple]);
      onPointerDown?.(event);
    },
    [onPointerDown],
  );

  const removeRipple = useCallback((key: number) => {
    setRipples((current) =>
      current.filter((ripple) => ripple.key !== key),
    );
  }, []);

  return (
    <MotionCard
      ref={ref}
      onPointerDown={handlePointerDown}
      whileHover={hoverable ? { y: -6 } : undefined}
      transition={{ duration: 0.3, ease: EASE }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(159,176,195,0.14)',

        /*
         * 卡片内容始终位于 ripple 上层。
         */
        '& > :not([data-liquid-ripple="true"])': {
          position: 'relative',
          zIndex: 1,
        },

        '&:hover': {
          borderColor: 'rgba(94,200,216,0.45)',
          boxShadow:
            '0 12px 40px -12px rgba(7,11,18,0.8), ' +
            '0 0 0 1px rgba(94,200,216,0.12)',
        },

        ...(sx as object),
      }}
      {...rest}
    >
      {children}

      <LiquidRipple
        ripples={ripples}
        color={rippleColor}
        onComplete={removeRipple}
      />
    </MotionCard>
  );
});
