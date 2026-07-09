import React from 'react';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ragApi } from '../api/rag';
import { ApiClientError, toErrorMessage } from '../api/http';
import { Link as RouterLink } from 'react-router-dom';
import { RagAskResponse } from '../api/types';
import { MarkdownReport, CodeBlock } from '../components/MarkdownReport';
import { HONESTY, HonestyBadge } from '../components/HonestyBadge';

export function RagAsk(): React.ReactElement {
  const [question, setQuestion] = useState('');
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resp, setResp] = useState<RagAskResponse | null>(null);
  const [hasIndexed, setHasIndexed] = useState<boolean>(() => {
    try { return sessionStorage.getItem('ragIndexedDocId') != null; } catch { return false; }
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
      try { sessionStorage.setItem('ragIndexedDocId', '1'); setHasIndexed(true); } catch { /* ignore */ }
    } catch (e) {
      const msg = toErrorMessage(e);
      const isServerError =
        e instanceof ApiClientError &&
        (e.status === 500 || /服务器内部|Internal\s*Server/i.test(msg));
      setError(
        isServerError
          ? '当前没有可检索的已索引文档，或 Qdrant / 后端检索失败，请先完成文档索引。'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const onTopKChange = (e: SelectChangeEvent<number>) => setTopK(Number(e.target.value));

  // 根据后端返回的 provider / model 判断 Chat 是否为真实 AI（保守默认 Mock）。
  const isRealChat =
    !!resp && resp.provider !== 'mock' && resp.provider !== '' && resp.model !== 'mock' && resp.model !== '';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        RAG 问答
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        输入问题并指定检索 TopK，基于已索引文档生成回答与引用来源。
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {HONESTY.ragEmbeddingMock}
        {HONESTY.ragRetrievePseudo}
      </Stack>

      {!hasIndexed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          请先到 <RouterLink to="/rag">RAG 文档流水线</RouterLink> 完成上传、解析和向量化索引，再进行问答。
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleAsk}
              disabled={loading}
            >
              提问
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {resp && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            {isRealChat ? HONESTY.ragChatReal : HONESTY.ragChatMock}
            <HonestyBadge tone="info" label={`Provider: ${resp.provider || '-'}`} />
            <HonestyBadge tone="info" label={`Model: ${resp.model || '-'}`} />
            <Chip size="small" label={`耗时 ${resp.costMs} ms`} variant="outlined" />
            <Chip size="small" label={`引用 ${resp.referenceCount} 条`} variant="outlined" />
          </Stack>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              回答
            </Typography>
            <MarkdownReport content={resp.answer} bordered={false} />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              引用来源（references · 演示性召回）
            </Typography>
            {resp.references.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                未返回引用来源。
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>文档ID</TableCell>
                    <TableCell>Chunk</TableCell>
                    <TableCell>相似度</TableCell>
                    <TableCell>内容片段</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resp.references.map((ref, i) => (
                    <TableRow key={ref.chunkId ?? i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{ref.documentId}</TableCell>
                      <TableCell>{ref.chunkIndex}</TableCell>
                      <TableCell>{ref.score != null ? ref.score.toFixed(4) : '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>{ref.content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Prompt 预览
            </Typography>
            <CodeBlock text={resp.promptPreview || '(空)'} maxHeight={300} />
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
