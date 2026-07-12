import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MarkdownReport } from '../components/MarkdownReport';

const theme = createTheme();
const wrap = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('MarkdownReport - GFM 表格渲染', () => {
  it('将 GFM 表格渲染为 table 并包裹在响应式滚动容器内', () => {
    const md = [
      '| 名称 | 说明 |',
      '| --- | --- |',
      '| RAG | 检索增强生成 |',
      '| Reviewer | 代码评审 |',
    ].join('\n');
    wrap(<MarkdownReport content={md} />);

    // 表头与表体文本均被渲染
    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByText('说明')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
    expect(screen.getByText('检索增强生成')).toBeInTheDocument();

    // remark-gfm 生成真实 <table>，且外层为响应式横向滚动容器
    const table = document.querySelector('.markdown-table-scroll table');
    expect(table).not.toBeNull();
    expect(table!.querySelectorAll('tbody tr').length).toBe(2);
  });
});

describe('MarkdownReport - 3.Issues 卡片布局', () => {
  it('从 3.Issues 六列表格提取并渲染问题卡片', () => {
    const md = [
      '# 评审报告',
      '',
      '## 3. Issues',
      '',
      '| 编号 | 文件 | 风险 | 问题类型 | 问题描述 | 修改建议 |',
      '| --- | --- | --- | --- | --- | --- |',
      '| 1 | src/main/Service.java | 警告 | NULL_CHECK | 可能为 null | 加判空 |',
      '| 2 | src/main/Controller.java | 错误 | SECURITY | 硬编码密钥 | 用环境变量 |',
    ].join('\n');
    wrap(<MarkdownReport content={md} />);

    // 提取出 2 张卡片
    const cards = document.querySelectorAll('.issue-card');
    expect(cards.length).toBe(2);

    // 问题描述与文件信息可见
    expect(screen.getByText('可能为 null')).toBeInTheDocument();
    expect(screen.getByText('硬编码密钥')).toBeInTheDocument();
    expect(screen.getByText('src/main/Service.java')).toBeInTheDocument();

    // 卡片网格（响应式布局容器）存在
    expect(document.querySelector('.issue-card-grid')).not.toBeNull();
  });
});
