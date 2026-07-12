import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MarkdownReport } from '../components/MarkdownReport';

const theme = createTheme();
const wrap = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('响应式布局容器', () => {
  it('Issues 表格转为卡片网格，且不再渲染原生 table 滚动容器', () => {
    const md = [
      '## 3. Issues',
      '',
      '| 编号 | 文件 | 风险 | 问题类型 | 问题描述 | 修改建议 |',
      '| --- | --- | --- | --- | --- | --- |',
      '| 1 | src/main/Service.java | 警告 | NULL_CHECK | 可能为 null | 加判空 |',
    ].join('\n');
    wrap(<MarkdownReport content={md} />);

    // 报告容器（带响应式 padding 的 Paper）
    expect(document.querySelector('.markdown-report-paper')).not.toBeNull();
    // 问题卡片网格（响应式栅格布局）
    expect(document.querySelector('.issue-card-grid')).not.toBeNull();
    // Issues 表格被转换为卡片，因此不应再出现原生 table 滚动容器
    expect(document.querySelector('.markdown-table-scroll')).toBeNull();
    // 至少渲染出一张问题卡片
    expect(document.querySelectorAll('.issue-card').length).toBeGreaterThan(0);
  });

  it('普通 GFM 表格渲染横向滚动容器（窄屏溢出处理）', () => {
    const md = [
      '## 依赖清单',
      '',
      '| 名称 | 版本 | 说明 |',
      '| --- | --- | --- |',
      '| spring-boot | 4.1 | 后端框架 |',
    ].join('\n');
    wrap(<MarkdownReport content={md} />);

    // 非 Issues 的普通表格应渲染为带滚动容器的 <table>
    const scroll = document.querySelector('.markdown-table-scroll');
    expect(scroll).not.toBeNull();
    expect(scroll?.querySelector('table')).not.toBeNull();
  });
});
