import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Paper } from '@mui/material';

export interface MarkdownReportProps {
  /** Markdown 文本。 */
  content: string;
  /** 最大高度（px），超出滚动；不传则不限制。 */
  maxHeight?: number;
  /** 是否显示外边框。 */
  bordered?: boolean;
}

/**
 * Markdown 报告渲染组件（react-markdown）。
 * 样式由 index.css 的 .markdown-body 提供，不依赖 Tailwind。
 */
export function MarkdownReport({ content, maxHeight, bordered = true }: MarkdownReportProps): React.ReactElement {
  return (
    <Paper
      variant={bordered ? 'outlined' : 'elevation'}
      className="markdown-body"
      sx={{
        p: 2,
        overflow: 'auto',
        maxHeight: maxHeight ?? 'none',
        background: '#fff',
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Paper>
  );
}

/** 单宽文本展示（引用来源、prompt 预览等）。 */
export function CodeBlock({ text, maxHeight = 360 }: { text: string; maxHeight?: number }): React.ReactElement {
  return (
    <Box className="pre-block" sx={{ maxHeight }}>
      {text}
    </Box>
  );
}
