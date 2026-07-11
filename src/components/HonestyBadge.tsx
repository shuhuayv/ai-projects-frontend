import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import Filter3Icon from '@mui/icons-material/Filter3';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * 诚实边界徽标类型。
 * 用于在界面上醒目标注「Mock / 真实 / 伪向量 / 仅前 N 文件」等能力边界，不误导使用者。
 */
export type HonestyTone =
  | 'mock' // Mock 演示
  | 'real' // 真实 AI
  | 'pseudo' // 伪向量（演示性检索）
  | 'limited' // 能力有限（仅评审部分文件）
  | 'demo' // 本地 Demo
  | 'info'; // 一般说明

interface TonePreset {
  label: string;
  color: ChipProps['color'];
  icon: React.ReactElement;
}

const TONE_PRESETS: Record<HonestyTone, TonePreset> = {
  mock: { label: 'Mock 演示', color: 'default', icon: <ScienceIcon fontSize="small" /> },
  real: { label: '真实 AI', color: 'success', icon: <VerifiedIcon fontSize="small" /> },
  pseudo: { label: '伪向量', color: 'warning', icon: <ShieldIcon fontSize="small" /> },
  limited: { label: '仅前 3 文件', color: 'warning', icon: <Filter3Icon fontSize="small" /> },
  demo: { label: '本地 Demo', color: 'info', icon: <InfoIcon fontSize="small" /> },
  info: { label: '说明', color: 'info', icon: <InfoIcon fontSize="small" /> },
};

/** 按 tone 着色的玻璃描边 / 文字色。 */
const TONE_STYLE: Record<HonestyTone, { border: string; color: string }> = {
  mock: { border: 'rgba(155,111,212,0.55)', color: '#B694E6' }, // 紫罗兰
  real: { border: 'rgba(91,185,140,0.60)', color: '#7FD3A8' }, // success
  pseudo: { border: 'rgba(106,160,224,0.55)', color: '#9CC2F0' }, // 冰青 / info 蓝
  limited: { border: 'rgba(106,160,224,0.55)', color: '#9CC2F0' }, // 冰青
  demo: { border: 'rgba(106,160,224,0.55)', color: '#9CC2F0' }, // info 蓝
  info: { border: 'rgba(106,160,224,0.55)', color: '#9CC2F0' }, // info 蓝
};

export interface HonestyBadgeProps {
  tone: HonestyTone;
  /** 自定义文案，覆盖默认 label。 */
  label?: string;
  /** 额外说明（显示为 tooltip / 副标题）。 */
  tooltip?: string;
  size?: 'small' | 'medium';
}

/**
 * 诚实边界徽标组件：以玻璃 pill 标注当前能力的真实/演示边界。
 */
export function HonestyBadge({ tone, label, tooltip, size = 'small' }: HonestyBadgeProps): React.ReactElement {
  const preset = TONE_PRESETS[tone];
  const style = TONE_STYLE[tone];
  return (
    <Chip
      size={size}
      color={preset.color}
      icon={preset.icon}
      label={label ?? preset.label}
      variant="outlined"
      title={tooltip}
      sx={{
        fontWeight: 600,
        borderRadius: 999,
        backdropFilter: 'blur(6px)',
        borderColor: style.border,
        color: style.color,
      }}
    />
  );
}

/** 常用诚实标签组合（避免页面内重复书写）。 */
export const HONESTY = {
  ragEmbeddingMock: (
    <HonestyBadge tone="pseudo" label="Embedding: Mock 伪向量" tooltip="使用 SHA-256 哈希生成伪向量，非真实语义向量" />
  ),
  ragRetrievePseudo: (
    <HonestyBadge tone="pseudo" label="检索: 演示性伪向量" tooltip="references 为演示性召回，非真实语义检索" />
  ),
  ragChatReal: <HonestyBadge tone="real" label="Chat: 真实智谱" tooltip="后端 AI_MOCK_ENABLED=false 时调用真实智谱" />,
  ragChatMock: <HonestyBadge tone="mock" label="Chat: Mock" tooltip="后端默认 AI_MOCK_ENABLED=true" />,
  ragChatRuntime: (
    <HonestyBadge
      tone="info"
      label="Chat 模式：以问答响应为准"
      tooltip="Chat 真实 / Mock 以每次问答接口响应为准，首页不预探测"
    />
  ),
  reviewerRuleMock: <HonestyBadge tone="mock" label="Mock 规则评审" tooltip="基于内置规则生成评审意见" />,
  reviewerAiLimited: (
    <HonestyBadge tone="limited" label="真实 AI: 仅前 3 文件" tooltip="真实 AI 当前仅评审默认前3个核心文件，最多少量 issues" />
  ),
  localDemo: <HonestyBadge tone="demo" label="本地 Demo · 无登录权限" tooltip="本地演示，无登录/权限，无高并发承诺" />,
  ragEmbeddingReal: (
    <HonestyBadge tone="real" label="Embedding: 真实向量" tooltip="使用真实语义向量（非 SHA-256 伪向量）" />
  ),
  ragRetrieveReal: (
    <HonestyBadge tone="real" label="检索: 真实语义检索" tooltip="references 为真实语义召回（真实 Embedding）" />
  ),
} as const;
