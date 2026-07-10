import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { EASE } from './PageTransition';
import { LiquidCard } from './LiquidCard';
import { FeatureIcon } from './FeatureIcon';
import { AURORA } from '../theme';

interface PreviewBlock {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}

/** 纯展示的控制台预览（不调用任何 API / 不读 state）。 */
const BLOCKS: PreviewBlock[] = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 22, color: '#F4F6FF' }} />,
    title: 'RAG 知识库',
    lines: ['文档上传 → 解析 → 向量索引', 'Embedding 为 Mock 伪向量'],
  },
  {
    icon: <RateReviewIcon sx={{ fontSize: 22, color: '#F4F6FF' }} />,
    title: 'Code Reviewer',
    lines: ['真实 AI 仅评前 3 文件', '问题表 + Markdown 报告'],
  },
  {
    icon: <StorageIcon sx={{ fontSize: 22, color: '#F4F6FF' }} />,
    title: '后端状态',
    lines: ['MySQL / Redis / Qdrant 就绪', 'RAG :8080 · Reviewer :8081'],
  },
];

export function HeroPreview(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <LiquidCard variant="outlined" sx={{ p: 2.5, height: '100%' }}>
        <Stack spacing={1.5}>
          {BLOCKS.map((b, i) => (
            <Box key={b.title}>
              {i > 0 && <Divider sx={{ mb: 1.5 }} />}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <FeatureIcon icon={b.icon} size={40} />
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {b.title}
                    </Typography>
                    <CheckCircleIcon sx={{ fontSize: 14, color: AURORA.success }} />
                  </Stack>
                  {b.lines.map((ln) => (
                    <Typography
                      key={ln}
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.5 }}
                    >
                      {ln}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </LiquidCard>
    </motion.div>
  );
}
