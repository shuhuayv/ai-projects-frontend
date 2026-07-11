import React from 'react';
import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import { ragApi } from '../api/rag';
import { isRealChatProvider } from '../api/chat';
import { ApiClientError, toErrorMessage } from '../api/http';
import { Link as RouterLink } from 'react-router-dom';
import { RagAskResponse } from '../api/types';
import { MarkdownReport, PromptPreview } from '../components/MarkdownReport';
import { HONESTY } from '../components/HonestyBadge';
import { LiquidCard } from '../components/LiquidCard';
import { LiquidButton } from '../components/LiquidButton';
import { FeatureIcon } from '../components/FeatureIcon';
import { ReferenceCard } from '../components/ReferenceCard';
import { AURORA } from '../theme';

/** 单字段展示（空值降级为 '-'）。 */
function MetaField({
  label,
  value,
  emphasize,
  positive,
}: {
  label: string;
  value?: React.ReactNode;
  emphasize?: boolean;
  positive?: boolean;
}): React.ReactElement {
  return (
    <Grid item xs={6} sm={4} md={3}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: emphasize ? 700 : 600,
          color: positive ? AURORA.success : emphasize ? AURORA.textPrimary : AURORA.textSecondary,
        }}
      >
        {value ?? '-'}
      </Typography>
    </Grid>
  );
}

export function RagAsk(): React.ReactElement {
  const [question, setQuestion] = useState('');
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resp, setResp] = useState<RagAskResponse | null>(null);
  const [hasIndexed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ragIndexedDocId') != null;
    } catch {
      return false;
    }
  });

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('请输入问题');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const r = await ragApi.ask(question.trim(), topK);
      setResp(r);
    } catch (e) {
      const msg = toErrorMessage(e);
      const isServerError =
        e instanceof ApiClientError && (e.status === 500 || /服务器内部|Internal\s*Server/i.test(msg));
      const isNoContext = /未检索到|无有效上下文|没有可检索|尚未索引/i.test(msg);
      const isRateLimit = /速率限制|请求频率|请求过多|1302|1305|429/i.test(msg);
      const isTimeout = /响应超时|Read timed out|timeout/i.test(msg);
      const isChatError = /AI API|返回内容为空|Chat|回答生成/i.test(msg);
      setError(
        isRateLimit
          ? '智谱模型当前请求过多，系统已自动重试；请等待 30-60 秒后再提问。'
          : isTimeout
            ? '智谱模型响应超时，文档检索正常；请稍后重新提问。'
            : isNoContext
          ? '当前没有可检索的已索引文档，请先完成文档解析与向量化索引。'
          : isChatError
            ? '文档检索已完成，但回答生成失败，请检查 Chat 模型配置后重试。'
            : isServerError
              ? 'RAG 后端处理失败，请查看 rag-fixed.log；这不代表文档一定未索引。'
              : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const onTopKChange = (e: SelectChangeEvent<number>) => setTopK(Number(e.target.value));

  // 检索层真实：后端返回 embeddingMode === 'REAL' 或 embeddingProvider === 'zhipu'。
  const isRealRetrieval = !!resp && (resp.embeddingMode === 'REAL' || resp.embeddingProvider === 'zhipu');
  // 生成层真实（Chat 层）：provider / model 均非 mock（undefined / 空串 / 大小写鲁棒）。
  const isRealChat = !!resp && isRealChatProvider(resp.provider, resp.model);

  const embeddingModeText =
    resp?.embeddingMode === 'REAL' ? 'REAL' : resp?.embeddingMode === 'MOCK' ? 'MOCK' : '-';

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <FeatureIcon icon={<ChatIcon sx={{ fontSize: 24 }} />} size={44} />
        <Typography variant="h4">RAG 问答</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        输入问题并指定检索 TopK，基于已索引文档生成回答与引用来源。
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {/* 检索层：真实语义检索（真实 Embedding） */}
        {HONESTY.ragRetrieveReal}
        {/* 生成层：由 live 响应决定 */}
        {resp ? (isRealChat ? HONESTY.ragChatReal : HONESTY.ragChatMock) : (
          <Chip size="small" label="Chat: 等待响应" variant="outlined" />
        )}
      </Stack>

      {!hasIndexed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          请先到 <RouterLink to="/rag">RAG 文档流水线</RouterLink> 完成上传、解析和向量化索引，再进行问答。
        </Alert>
      )}

      <LiquidCard variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="问题（必填）"
            placeholder="例如：这份文档主要讲了什么？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="topk-label">检索 TopK</InputLabel>
              <Select labelId="topk-label" label="检索 TopK" value={topK} onChange={onTopKChange}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LiquidButton
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleAsk}
              disabled={loading}
            >
              提问
            </LiquidButton>
          </Stack>
        </Stack>
      </LiquidCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {resp && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip size="small" label={`耗时 ${resp.costMs} ms`} variant="outlined" />
            <Chip size="small" label={`引用 ${resp.referenceCount} 条`} variant="outlined" />
          </Stack>

          {/* 检索层 / 生成层 分组状态（来自后端响应，空值降级） */}
          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              能力边界（来自后端响应）
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              检索层 / Embedding
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <MetaField label="Mode" value={embeddingModeText} emphasize={isRealRetrieval} positive={isRealRetrieval} />
              <MetaField label="Provider" value={resp.embeddingProvider} />
              <MetaField label="Model" value={resp.embeddingModel} />
              <MetaField
                label="Dimensions"
                value={resp.embeddingDimensions != null ? String(resp.embeddingDimensions) : undefined}
              />
              <MetaField label="Collection" value={resp.collectionName} />
              <MetaField
                label="Fallback Used"
                value={resp.fallbackUsed != null ? (resp.fallbackUsed ? '是' : '否') : undefined}
              />
            </Grid>

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              生成层 / Chat
            </Typography>
            <Grid container spacing={1.5}>
              <MetaField label="Provider" value={resp.provider} emphasize={isRealChat} positive={isRealChat} />
              <MetaField label="Model" value={resp.model} />
            </Grid>

            {isRealRetrieval && !isRealChat && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                检索使用真实 zhipu embedding-3 1024D；答案生成当前返回 provider={resp.provider || '-'} / model={resp.model || '-'}（以接口响应为准）。
              </Alert>
            )}
          </LiquidCard>

          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              回答
            </Typography>
            <MarkdownReport content={resp.answer} bordered={false} />
          </LiquidCard>

          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              检索引用来源
            </Typography>
            {resp.references.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                未返回引用来源。
              </Typography>
            ) : (
              <Stack spacing={1}>
                {resp.references.map((ref, i) => (
                  <ReferenceCard
                    key={`${ref.documentId}-${ref.chunkId}-${ref.chunkIndex ?? 'n'}-${i}`}
                    item={ref}
                    index={i}
                  />
                ))}
              </Stack>
            )}
          </LiquidCard>

          <LiquidCard variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Prompt 预览
            </Typography>
            <PromptPreview text={resp.promptPreview || '(空)'} maxHeight={480} />
          </LiquidCard>
        </Stack>
      )}
    </Box>
  );
}
