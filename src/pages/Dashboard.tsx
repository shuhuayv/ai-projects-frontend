import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardActions, Grid, Stack, Typography } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { apiGet } from '../api/http';
import { StatusPanel, ServiceStatus } from '../components/StatusPanel';
import { HONESTY } from '../components/HonestyBadge';
import { RAG_PORT, REVIEWER_PORT } from '../config/endpoints';

interface ProjectCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  badges: React.ReactNode;
  notes: string[];
}

const PROJECTS: ProjectCard[] = [
  {
    title: 'RAG 知识库问答',
    subtitle: 'ai-knowledge-rag · :8080',
    icon: <HubIcon sx={{ fontSize: 40 }} />,
    to: '/rag',
    color: '#1565c0',
    badges: (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {HONESTY.ragEmbeddingMock}
        {HONESTY.ragRetrievePseudo}
        {HONESTY.ragChatReal}
      </Stack>
    ),
    notes: [
      '文档上传 → 解析切分 → 向量化索引',
      '问答：检索增强生成，返回 answer / references / promptPreview',
      'Chat 支持真实智谱（后端 AI_MOCK_ENABLED=false）',
    ],
  },
  {
    title: 'Code Reviewer 代码评审',
    subtitle: 'ai-code-reviewer · :8081',
    icon: <RateReviewIcon sx={{ fontSize: 40 }} />,
    to: '/reviewer',
    color: '#6a1b9a',
    badges: (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {HONESTY.reviewerRuleMock}
        {HONESTY.reviewerAiLimited}
      </Stack>
    ),
    notes: [
      '创建仓库 → 克隆 → 扫描 → 创建评审任务',
      'Mock 规则评审 / 真实 AI JSON 评审（依后端配置）',
      '问题表格 + Markdown 报告 + 原始 Markdown 导出',
    ],
  },
];

/** 轻量探测：用已代理的列表接口判断后端是否可达。 */
async function probe(path: string): Promise<{ reachable: boolean; error?: string }> {
  try {
    await apiGet(path);
    return { reachable: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '不可达';
    return { reachable: false, error: msg };
  }
}

export function Dashboard(): React.ReactElement {
  const [services, setServices] = useState<ServiceStatus[]>(() => [
    { name: 'RAG 知识库', basePath: '/api/documents', port: RAG_PORT },
    { name: 'Code Reviewer', basePath: '/api/repos', port: REVIEWER_PORT },
  ]);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    const [rag, rev] = await Promise.all([probe('/api/documents'), probe('/api/repos')]);
    setServices([
      { name: 'RAG 知识库', basePath: '/api/documents', port: RAG_PORT, ...rag },
      { name: 'Code Reviewer', basePath: '/api/repos', port: REVIEWER_PORT, ...rev },
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        项目总览
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        两个 AI 后端项目的统一操作控制台。点击卡片进入对应流水线。
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {PROJECTS.map((p) => (
          <Grid item xs={12} md={6} key={p.to}>
            <Card
              variant="outlined"
              sx={{ height: '100%', borderTop: `4px solid ${p.color}`, display: 'flex', flexDirection: 'column' }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box sx={{ color: p.color }}>{p.icon}</Box>
                  <Box>
                    <Typography variant="h6">{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.subtitle}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 1.5 }}>{p.badges}</Box>

                <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                  {p.notes.map((n) => (
                    <Typography component="li" variant="body2" color="text.secondary" key={n}>
                      {n}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
              <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                <Button
                  component={RouterLink}
                  to={p.to}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ backgroundColor: p.color, '&:hover': { backgroundColor: p.color } }}
                >
                  进入 {p.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <StatusPanel
        services={services}
        loading={loading}
        onRefresh={checkHealth}
        error={
          services.every((s) => s.reachable === false)
            ? '两个后端均不可达，请确认 ai-knowledge-rag(:8080) 与 ai-code-reviewer(:8081) 已启动。'
            : undefined
        }
      />
    </Box>
  );
}
