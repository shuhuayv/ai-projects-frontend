import React from 'react';
import { Box } from '@mui/material';
import { AURORA } from '../theme';

export interface FeatureIconProps {
  /** 任意图标节点（通常是 MUI icon）。 */
  icon: React.ReactNode;
  /** 容器尺寸（正方形，默认 48）。 */
  size?: number;
  /** 圆角渐变背景（默认 AURORA.gradIcon）。 */
  gradient?: string;
}

/**
 * 圆角渐变图标容器：将图标置于蓝紫渐变方块中，呼应极光主题。
 */
export function FeatureIcon({ icon, size = 48, gradient = AURORA.gradIcon }: FeatureIconProps): React.ReactElement {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '14px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F4F6FF',
        flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 8px 22px -8px rgba(76,123,217,0.55), inset 0 1px 0 rgba(255,255,255,0.28)',
      }}
    >
      {icon}
    </Box>
  );
}
