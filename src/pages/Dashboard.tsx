import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Box, CardActions, Chip, Grid, Stack, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { apiGet } from '../api/http';
import { StatusPanel, ServiceStatus } from '../components/StatusPanel';
import { HONESTY } from '../components/HonestyBadge';
import { LiquidCard } from '../components/LiquidCard';
import { LiquidButton } from '../components/LiquidButton';
import { FeatureIcon } from '../components/FeatureIcon';
import { HeroPreview } from '../components/HeroPreview';
import { RAG_PORT, REVIEWER_PORT } from '../config/endpoints';
import { AURORA } from '../theme';

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
    icon: <MenuBookIcon sx={{ fontSize: 26 }} />,
    to: '/rag',
    color: AURORA.primary, // 冷蓝强调
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
    icon: <FeatureIcon icon={<RateReviewIcon sx={{ fontSize: 26 }} />} size={48} gradient={AURORA.gradIcon} />,
    to: '/reviewer',
    color: AURORA.secondary, // 紫罗兰强调
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
      {/* ============ Hero 区 ============ */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Chip
              label="AI Engineering Workspace"
              size="small"
              variant="outlined"
              sx={{
                mb: 1.5,
                borderRadius: 999,
                borderColor: AURORA.borderStrong,
                color: AURORA.textSecondary,
              }}
            />
            <Typography variant="h4" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
              AI Projects Console
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 460 }}>
              面向 RAG 知识库与 Code Reviewer 的统一操作控制台。上传文档、索引向量、发起评审 ——
              在一个玻璃化工作空间内完成。
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <LiquidButton component={RouterLink} to="/rag" variant="contained" startIcon={<MenuBookIcon />}>
                RAG 知识库
              </LiquidButton>
              <LiquidButton
                component={RouterLink}
                to="/reviewer"
                variant="outlined"
                startIcon={<RateReviewIcon />}
              >
                Code Reviewer
              </LiquidButton>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <HeroPreview />
          </Grid>
        </Grid>
      </Box>

      {/* ============ 大尺寸功能卡 ============ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {PROJECTS.map((p) => (
          <Grid item xs={12} md={6} key={p.to}>
            <LiquidCard
              variant="outlined"
              sx={{ height: '100%', borderTop: `4px solid ${p.color}`, display: 'flex', flexDirection: 'column' }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  {p.icon}
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
              </Box>
              <CardActions sx={{ mt: 'auto', px: 2.5, pb: 2.5 }}>
                <LiquidButton
                  component={RouterLink}
                  to={p.to}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ backgroundColor: p.color, '&:hover': { backgroundColor: p.color } }}
                >
                  进入 {p.title}
                </LiquidButton>
              </CardActions>
            </LiquidCard>
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
