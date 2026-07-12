import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PromptPreview } from '../components/MarkdownReport';

const theme = createTheme();
const wrap = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PromptPreview - Prompt 预览', () => {
  it('将原始 prompt 文本转换为分段 Markdown 并渲染', () => {
    const prompt = [
      '系统：你是一个知识库助手。',
      '用户问题：',
      '什么是 RAG？',
      '检索到的文档片段（共 1 条）：',
      '【片段 1】',
      '来源：文档 #1，Chunk #2，相似度：0.91',
      '内容：RAG 是检索增强生成。',
    ].join('\n');
    wrap(<PromptPreview text={prompt} />);

    expect(screen.getByText('用户问题')).toBeInTheDocument();
    expect(screen.getByText(/RAG 是检索增强生成/)).toBeInTheDocument();
    expect(screen.getByText(/相似度 0\.91/)).toBeInTheDocument();
  });

  it('空 prompt 显示占位提示', () => {
    wrap(<PromptPreview text="(空)" />);
    expect(screen.getByText(/暂无 Prompt 内容/)).toBeInTheDocument();
  });
});
