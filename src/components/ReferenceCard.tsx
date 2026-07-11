import React, { useState } from 'react';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RagReferenceItem } from '../api/types';
import { AURORA } from '../theme';

interface ReferenceCardProps {
  /** 引用序号（从 0 开始的数组下标）。 */
  index: number;
  /** 单条检索引用。 */
  item: RagReferenceItem;
}

/**
 * 单条检索引用（RagReferenceItem）的可展开卡片。
 * 默认折叠（限制高度 + 渐隐遮罩），可展开查看完整 content。
 *
 * score / chunkIndex 可空约定：
 *   - 空值一律显示 '-'，绝不伪造，也绝不转换为百分比。
 *   - score 有值时固定 4 位小数（toFixed(4)）。
 */
export function ReferenceCard({ index, item }: ReferenceCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const scoreText = item.score != null ? item.score.toFixed(4) : '-';
  const chunkIndexText = item.chunkIndex != null ? String(item.chunkIndex) : '-';
  const hasLongContent = !!item.content && item.content.length > 140;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: AURORA.divider,
        borderRadius: 2,
        p: 1.5,
        background: 'rgba(20,26,58,0.35)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={`#${index + 1}`} variant="outlined" />
        <Chip size="small" label={`文档 ${item.documentId}`} variant="outlined" />
        <Chip size="small" label={`Chunk ${item.chunkId}`} variant="outlined" />
        <Chip size="small" label={`ChunkIndex ${chunkIndexText}`} variant="outlined" />
        <Chip size="small" label={`相似度 ${scoreText}`} color="primary" variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="small"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? '折叠' : '展开'}
          aria-expanded={expanded}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={{
          maxHeight: expanded ? 'none' : 96,
          overflow: 'hidden',
          position: 'relative',
          ...(expanded
            ? {}
            : {
                maskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
              }),
        }}
      >
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, color: AURORA.textSecondary }}
        >
          {item.content || '(空)'}
        </Typography>
      </Box>

      {!expanded && hasLongContent && (
        <Typography
          variant="caption"
          sx={{ color: AURORA.info, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setExpanded(true)}
        >
          展开查看完整内容
        </Typography>
      )}
    </Box>
  );
}
