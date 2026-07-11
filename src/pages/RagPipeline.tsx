import React from 'react';
import { useRef, useState } from 'react';
import { Alert, Box, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Link as RouterLink } from 'react-router-dom';
import { ragApi } from '../api/rag';
import { toErrorMessage } from '../api/http';
import { StepWizard, WizardStep, StepStatus } from '../components/StepWizard';
import { HONESTY } from '../components/HonestyBadge';
import { LiquidCard } from '../components/LiquidCard';
import { LiquidButton } from '../components/LiquidButton';
import { FeatureIcon } from '../components/FeatureIcon';
import { DocumentUploadResponse, DocumentParseResponse, DocumentIndexResponse } from '../api/types';
import { AURORA } from '../theme';

type StepKey = 'upload' | 'parse' | 'index';
type StepState = Record<StepKey, { status: StepStatus; message?: string }>;

const INITIAL: StepState = {
  upload: { status: 'idle' },
  parse: { status: 'idle' },
  index: { status: 'idle' },
};

const ACCEPT = '.txt,.pdf';

export function RagPipeline(): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<number | null>(null);
  const [steps, setSteps] = useState<StepState>(INITIAL);
  const [uploadResp, setUploadResp] = useState<DocumentUploadResponse | null>(null);
  const [parseResp, setParseResp] = useState<DocumentParseResponse | null>(null);
  const [indexResp, setIndexResp] = useState<DocumentIndexResponse | null>(null);
  const [error, setError] = useState<string>('');

  const setStep = (key: StepKey, status: StepStatus, message?: string) =>
    setSteps((prev) => ({ ...prev, [key]: { status, message } }));
  const activeStep = (() => {
    if (steps.index.status === 'success') return 2;
    if (steps.parse.status === 'success') return 2; // parse 完成 → 激活 index 步骤（显示"生成向量索引"按钮）
    if (docId !== null) return 1; // 已上传 → 激活 parse 步骤
    return 0;
  })();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError('');
    if (f && !/\.(txt|pdf)$/i.test(f.name)) {
      setError('仅支持 TXT / PDF 文件');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setStep('upload', 'loading');
    try {
      const resp = await ragApi.uploadDocument(file);
      setUploadResp(resp);
      setDocId(resp.id);
      setStep('upload', 'success', `${resp.fileName} · 状态 ${resp.status}`);
    } catch (e) {
      setStep('upload', 'error', toErrorMessage(e));
    }
  };

  const handleParse = async () => {
    if (docId === null) return;
    setError('');
    setStep('parse', 'loading');
    try {
      const resp = await ragApi.parseDocument(docId);
      setParseResp(resp);
      setStep('parse', 'success', `切分完成，共 ${resp.chunkCount} 个 Chunk`);
    } catch (e) {
      setStep('parse', 'error', toErrorMessage(e));
    }
  };

  const handleIndex = async () => {
    if (docId === null) return;
    setError('');
    setStep('index', 'loading');
    try {
      const resp = await ragApi.indexDocument(docId);
      setIndexResp(resp);
      setStep('index', 'success', `写入 ${resp.vectorCount} 条向量 · ${resp.collectionName}`);
      try {
        sessionStorage.setItem('ragIndexedDocId', String(resp.documentId));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setStep('index', 'error', toErrorMessage(e));
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      key: 'upload',
      label: '1. 上传文档',
      description: '上传 TXT / PDF 到知识库，返回文档 ID 与状态。',
      ...steps.upload,
    },
    {
      key: 'parse',
      label: '2. 解析切分',
      description: '解析文档内容并切分为 Chunk，入库。',
      ...steps.parse,
    },
    {
      key: 'index',
      label: '3. 向量化索引',
      description: '生成 Embedding（真实语义向量）并写入向量库。',
      ...steps.index,
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <FeatureIcon icon={<MenuBookIcon sx={{ fontSize: 24 }} />} size={44} />
        <Typography variant="h4">RAG 文档流水线</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        上传文档并完成「解析 → 向量化」后，即可前往问答页体验 RAG 问答。
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {HONESTY.ragRetrieveReal}
        {HONESTY.ragChatRuntime}
      </Stack>

      <LiquidCard variant="outlined" sx={{ p: 3, mb: 2 }}>
        <StepWizard
          steps={wizardSteps}
          activeStep={activeStep}
          renderActions={(step) => {
            if (step.key === 'upload') {
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LiquidButton
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={steps.upload.status === 'loading'}
                  >
                    选择文件
                    <input ref={fileInputRef} hidden accept={ACCEPT} type="file" onChange={onFileChange} />
                  </LiquidButton>
                  <LiquidButton
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file || steps.upload.status === 'loading'}
                  >
                    上传文档
                  </LiquidButton>
                  {file && <Chip size="small" label={file.name} color="primary" variant="outlined" />}
                </Stack>
              );
            }
            if (step.key === 'parse') {
              return (
                <LiquidButton
                  variant="contained"
                  onClick={handleParse}
                  disabled={docId === null || steps.parse.status === 'loading' || steps.index.status === 'success'}
                >
                  解析并切分
                </LiquidButton>
              );
            }
            return (
              <LiquidButton
                variant="contained"
                onClick={handleIndex}
                disabled={docId === null || steps.index.status === 'loading' || steps.index.status === 'success'}
              >
                生成向量索引
              </LiquidButton>
            );
          }}
        />
      </LiquidCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {steps.index.status === 'success' && indexResp && (
        <LiquidCard variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            处理结果
          </Typography>
          <Grid container spacing={1.5}>
            {uploadResp && (
              <Grid item xs={6} sm={4} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  文档ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {uploadResp.id}
                </Typography>
              </Grid>
            )}
            {parseResp && (
              <Grid item xs={6} sm={4} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Chunk 数
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: AURORA.primaryLight }}>
                  {parseResp.chunkCount}
                </Typography>
              </Grid>
            )}
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                向量数
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: AURORA.secondaryLight }}>
                {indexResp.vectorCount}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                状态
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: AURORA.success }}>
                {indexResp.status}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Embedding Provider
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {indexResp.embeddingProvider ?? '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Embedding Model
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {indexResp.embeddingModel ?? '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                维度
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {indexResp.embeddingDimensions != null ? indexResp.embeddingDimensions : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                索引版本
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {indexResp.indexVersion ?? '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">
                集合 (Collection)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                {indexResp.collectionName ?? '-'}
              </Typography>
            </Grid>
          </Grid>
          {indexResp.message && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              {indexResp.message}
            </Alert>
          )}
          <Box sx={{ mt: 1.5 }}>
            <LiquidButton component={RouterLink} to="/rag/ask" variant="outlined" endIcon={<ArrowForwardIcon />}>
              前往 RAG 问答
            </LiquidButton>
          </Box>
        </LiquidCard>
      )}

      {steps.parse.status === 'success' && steps.index.status !== 'success' && (
        <LiquidCard variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            处理结果
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {uploadResp && <Chip label={`文档ID: ${uploadResp.id}`} variant="outlined" />}
            {parseResp && <Chip label={`Chunk 数: ${parseResp.chunkCount}`} color="primary" variant="outlined" />}
          </Stack>
          <Alert severity="info" sx={{ mt: 1.5 }}>
            已完成解析，请继续生成向量索引后再问答。
          </Alert>
        </LiquidCard>
      )}
    </Box>
  );
}
