import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Paper } from '@mui/material';

export interface MarkdownReportProps {
  content: string;
  maxHeight?: number;
  bordered?: boolean;
}

interface IssueCardItem {
  number: string;
  file: string;
  risk: string;
  category: string;
  description: string;
  suggestion: string;
}

interface IssueTableSection {
  before: string;
  after: string;
  issues: IssueCardItem[];
}

const MARKDOWN_COMPONENTS: Components = {
  table: ({ node: _node, ...props }) => (
    <Box className="markdown-table-scroll">
      <table {...props} />
    </Box>
  ),
};

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of trimmed) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function columnIndex(headers: string[], candidates: RegExp[], fallback: number): number {
  const index = headers.findIndex((header) => candidates.some((candidate) => candidate.test(header)));
  return index >= 0 ? index : fallback;
}

/** 只识别 Reviewer 报告中 3. Issues 后面的六列表格。 */
function extractIssueTable(content: string): IssueTableSection | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const headingIndex = lines.findIndex((line) => /^#{1,6}\s+3\.\s*Issues\s*$/i.test(line.trim()));
  if (headingIndex < 0) return null;

  let tableStart = headingIndex + 1;
  while (tableStart < lines.length && !lines[tableStart].trim()) tableStart += 1;
  if (tableStart + 1 >= lines.length || !lines[tableStart].trim().startsWith('|')) return null;

  const headers = splitMarkdownRow(lines[tableStart]);
  const separator = splitMarkdownRow(lines[tableStart + 1]);
  const isSeparator = separator.length === headers.length
    && separator.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
  const headerText = headers.join(' ');
  if (!isSeparator || !/(文件|file)/i.test(headerText) || !/(问题描述|description)/i.test(headerText)) {
    return null;
  }

  let tableEnd = tableStart + 2;
  while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|')) tableEnd += 1;

  const numberAt = columnIndex(headers, [/^#$/, /编号/i], 0);
  const fileAt = columnIndex(headers, [/文件/i, /file/i], 1);
  const riskAt = columnIndex(headers, [/风险/i, /severity/i], 2);
  const categoryAt = columnIndex(headers, [/问题类型/i, /category/i, /type/i], 3);
  const descriptionAt = columnIndex(headers, [/问题描述/i, /description/i], 4);
  const suggestionAt = columnIndex(headers, [/修改建议/i, /suggestion/i, /recommendation/i], 5);

  const issues = lines.slice(tableStart + 2, tableEnd)
    .map(splitMarkdownRow)
    .filter((row) => row.some(Boolean))
    .map((row, index) => ({
      number: row[numberAt] || String(index + 1),
      file: row[fileAt] || '-',
      risk: row[riskAt] || '建议',
      category: row[categoryAt] || 'GENERAL',
      description: row[descriptionAt] || '-',
      suggestion: row[suggestionAt] || '-',
    }));

  if (!issues.length) return null;
  return {
    before: lines.slice(0, tableStart).join('\n').trimEnd(),
    after: lines.slice(tableEnd).join('\n').trimStart(),
    issues,
  };
}

function riskTone(risk: string): 'error' | 'warning' | 'suggestion' {
  if (/错误|严重|高风险|error|critical/i.test(risk)) return 'error';
  if (/警告|中风险|warning/i.test(risk)) return 'warning';
  return 'suggestion';
}

function IssueCards({ issues }: { issues: IssueCardItem[] }): React.ReactElement {
  return (
    <div className="issue-card-grid" role="list" aria-label="代码评审问题">
      {issues.map((issue, index) => (
        <article className="issue-card" role="listitem" key={`${issue.number}-${issue.file}-${index}`}>
          <header className="issue-card-header">
            <span className="issue-number">#{issue.number}</span>
            <span className={`issue-risk issue-risk-${riskTone(issue.risk)}`}>{issue.risk}</span>
            <span className="issue-category">{issue.category}</span>
          </header>

          <div className="issue-file" title={issue.file}>
            <span className="issue-field-label">文件</span>
            <code>{issue.file}</code>
          </div>

          <div className="issue-content-block">
            <div className="issue-field-label">问题描述</div>
            <p>{issue.description}</p>
          </div>

          <div className="issue-content-block issue-suggestion-block">
            <div className="issue-field-label">修改建议</div>
            <p>{issue.suggestion}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function promptToMarkdown(text: string): string {
  const source = text.replace(/\r\n/g, '\n').trim();
  if (!source || source === '(空)') return '### Prompt 状态\n\n> 暂无 Prompt 内容。';
  if (source === '[无有效上下文]') return '### Prompt 状态\n\n> 当前检索没有有效上下文。';

  const output: string[] = [];
  let mode: 'system' | 'question' | 'context' = 'system';
  let systemHeadingAdded = false;

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line === '用户问题：') {
      output.push('### 用户问题');
      mode = 'question';
      continue;
    }
    const contextHeading = line.match(/^检索到的文档片段（共\s*(\d+)\s*条）：$/);
    if (contextHeading) {
      output.push(`### 检索上下文 · ${contextHeading[1]} 条`);
      mode = 'context';
      continue;
    }
    if (line === '---') {
      output.push('---');
      continue;
    }
    const fragmentHeading = line.match(/^【片段\s*(\d+)】$/);
    if (fragmentHeading) {
      output.push(`#### 片段 ${fragmentHeading[1]}`);
      continue;
    }
    const sourceMeta = line.match(/^来源：文档\s*#(\d+)，Chunk\s*#(\d+)，相似度：([\d.]+)$/);
    if (sourceMeta) {
      output.push(`**文档 #${sourceMeta[1]}**　·　**Chunk #${sourceMeta[2]}**　·　**相似度 ${sourceMeta[3]}**`);
      continue;
    }
    if (line.startsWith('内容：')) {
      output.push(line.slice('内容：'.length).trim());
      continue;
    }
    if (mode === 'system') {
      if (!systemHeadingAdded) {
        output.push('### 系统指令');
        systemHeadingAdded = true;
      }
      output.push(`- ${line}`);
      continue;
    }
    output.push(line);
  }
  return output.join('\n\n');
}

export function MarkdownReport({ content, maxHeight, bordered = true }: MarkdownReportProps): React.ReactElement {
  const issueSection = extractIssueTable(content);

  return (
    <Paper
      variant={bordered ? 'outlined' : 'elevation'}
      className="markdown-body markdown-report-paper"
      sx={{
        p: { xs: 1.5, md: 2.25 },
        overflow: 'auto',
        maxHeight: maxHeight ?? 'none',
        background: 'transparent',
        backdropFilter: 'blur(10px)',
      }}
    >
      {issueSection ? (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {issueSection.before}
          </ReactMarkdown>
          <IssueCards issues={issueSection.issues} />
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {issueSection.after}
          </ReactMarkdown>
        </>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {content}
        </ReactMarkdown>
      )}
    </Paper>
  );
}

export function PromptPreview({ text, maxHeight = 440 }: { text: string; maxHeight?: number }): React.ReactElement {
  return (
    <Paper
      variant="outlined"
      className="markdown-body prompt-preview"
      sx={{ maxHeight, overflow: 'auto', p: { xs: 1.5, md: 2.25 } }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {promptToMarkdown(text)}
      </ReactMarkdown>
    </Paper>
  );
}

export function CodeBlock({ text, maxHeight = 360 }: { text: string; maxHeight?: number }): React.ReactElement {
  return (
    <Box className="pre-block" sx={{ maxHeight }}>
      {text}
    </Box>
  );
}
