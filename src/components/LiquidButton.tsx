import { Button, ButtonProps } from '@mui/material';
import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  LiquidRipple,
  type Ripple,
} from './LiquidRipple';

export interface LiquidButtonProps extends ButtonProps {
  /** 水滴波纹颜色。 */
  rippleColor?: string;

  /** 兼容 react-router 的 Link 式跳转。 */
  to?: string;

  /** 兼容 react-router 的 replace。 */
  replace?: boolean;

  /** 兼容 react-router 的导航 state。 */
  state?: unknown;
}

export const LiquidButton = forwardRef<
  HTMLButtonElement,
  LiquidButtonProps
>(function LiquidButton(
  {
    rippleColor = 'rgba(150,225,240,0.72)',
    children,
    onPointerDown,
    sx,
    ...rest
  },
  ref,
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
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
    <Button
      ref={ref}
      disableRipple
      onPointerDown={handlePointerDown}
      sx={{
        position: 'relative',
        overflow: 'hidden',

        /*
         * 确保文字、图标及进度元素始终位于 ripple 上方。
         */
        '& > :not([data-liquid-ripple="true"])': {
          position: 'relative',
          zIndex: 1,
        },

        ...(sx as object),
      }}
      {...(rest as ButtonProps)}
    >
      {children}

      <LiquidRipple
        ripples={ripples}
        color={rippleColor}
        onComplete={removeRipple}
      />
    </Button>
  );
});
