import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { reviewerApi } from '../api/reviewer';
import { toErrorMessage } from '../api/http';
import { MarkdownReport, CodeBlock } from '../components/MarkdownReport';
import { HonestyBadge } from '../components/HonestyBadge';
import { LiquidCard } from '../components/LiquidCard';
import { LiquidButton } from '../components/LiquidButton';
import { FeatureIcon } from '../components/FeatureIcon';
import { ReviewIssueResponse, ReviewReportResponse } from '../api/types';

interface ReportNavState {
  mode?: string;
  provider?: string;
  model?: string;
  repoName?: string;
}

/** 从 Markdown 报告推断评审模式（后端未返回 mode 字段时的兜底）。 */
function inferModeFromMarkdown(md: string): 'AI' | 'MOCK' | 'unknown' {
  if (/真实\s*AI\s*评审/.test(md)) return 'AI';
  if (/Mock\s*规则驱动/.test(md)) return 'MOCK';
  return 'unknown';
}

/** 从 Markdown 报告中解析 Provider / Model 行。 */
function parseMarkdownField(md: string, field: string): string {
  const m = md.match(new RegExp(`>\\s*\\*\\*${field}\\*\\*:\\s*(.+)`));
  return m ? m[1].trim() : '';
}

const SEVERITY_COLOR: Record<string, 'error' | 'warning' | 'info'> = {
  ERROR: 'error',
  WARNING: 'warning',
  SUGGESTION: 'info',
};

export function ReviewerReport(): React.ReactElement {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ReportNavState | null) ?? null;

  const [taskInput, setTaskInput] = useState(taskId ?? '');
  const [issues, setIssues] = useState<ReviewIssueResponse[]>([]);
  const [report, setReport] = useState<ReviewReportResponse | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState(''); // 特判：裸 String 端点
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (id: string) => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) {
        setError('任务 ID 无效');
        return;
      }
      setError('');
      setLoading(true);
      try {
        const [issueList, reportResp] = await Promise.all([
          reviewerApi.getIssues(numericId),
          reviewerApi.getReport(numericId),
        ]);
        setIssues(issueList);
        setReport(reportResp);
        // 裸 Markdown 端点（特判）：直接拿到字符串，不经过 ApiResponse 包裹
        try {
          setRawMarkdown(await reviewerApi.getReportMarkdown(numericId));
        } catch {
          setRawMarkdown('');
        }
      } catch (e) {
        setError(toErrorMessage(e));
        setReport(null);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (taskId) void load(taskId);
  }, [taskId, load]);

  // 优先用导航传入的 mode/provider/model（来自创建评审响应，应用补丁 reviewer-mode-fields 后才有）；
  // 否则从 Markdown 报告文本推断。
  const mode =
    state?.mode === 'AI' ? 'AI' : state?.mode === 'MOCK' ? 'MOCK' : inferModeFromMarkdown(report?.markdownContent ?? '');
  const provider = state?.provider ?? parseMarkdownField(report?.markdownContent ?? '', 'Provider');
  const model = state?.model ?? parseMarkdownField(report?.markdownContent ?? '', 'Model');

  const isAi = mode === 'AI';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FeatureIcon icon={<RateReviewIcon sx={{ fontSize: 22 }} />} size={40} />
          <Typography variant="h4">评审报告</Typography>
        </Stack>
        <LiquidButton startIcon={<ArrowBackIcon />} onClick={() => navigate('/reviewer')} variant="outlined">
          返回流水线
        </LiquidButton>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }} alignItems="center">
        {isAi ? (
          <HonestyBadge tone="real" label="真实 AI 评审" />
        ) : (
          <HonestyBadge tone="mock" label="Mock 规则评审" />
        )}
        {isAi && <HonestyBadge tone="limited" />}
        {provider && <HonestyBadge tone="info" label={`Provider: ${provider}`} />}
        {model && <HonestyBadge tone="info" label={`Model: ${model}`} />}
        {taskId && <Chip size="small" label={`任务 #${taskId}`} variant="outlined" />}
      </Stack>

      <LiquidCard variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="任务 ID"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          />
          <LiquidButton variant="contained" onClick={() => load(taskInput)} disabled={loading}>
            查看
          </LiquidButton>
          {loading && <CircularProgress size={20} />}
        </Stack>
      </LiquidCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {report && (
        <Stack spacing={2}>
          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              总体评价
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {report.overallAssessment}
            </Typography>
          </LiquidCard>

          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              评审问题（{issues.length} 条）
            </Typography>
            {issues.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                未发现问题。
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>严重程度</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>文件</TableCell>
                    <TableCell>行</TableCell>
                    <TableCell>标题</TableCell>
                    <TableCell>修改建议</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <Chip
                          size="small"
                          color={SEVERITY_COLOR[issue.severity] ?? 'default'}
                          label={issue.severity}
                        />
                      </TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>{issue.filePath}</TableCell>
                      <TableCell>{issue.lineNumber}</TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>{issue.title}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{issue.suggestion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </LiquidCard>

          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Markdown 报告
            </Typography>
            <MarkdownReport content={report.markdownContent} maxHeight={520} />
          </LiquidCard>

          <Accordion sx={{ background: 'transparent', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">原始 Markdown 源（/report/markdown 裸 String 端点）</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock text={rawMarkdown || '(无原始 Markdown)'} maxHeight={420} />
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}
    </Box>
  );
}
