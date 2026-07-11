import React from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Alert, Stack } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { theme, AURORA } from './theme';
import { LiquidBackground } from './components/LiquidBackground';
import { PageTransition } from './components/PageTransition';
import { LiquidButton } from './components/LiquidButton';
import { FeatureIcon } from './components/FeatureIcon';
import { Dashboard } from './pages/Dashboard';
import { RagPipeline } from './pages/RagPipeline';
import { RagAsk } from './pages/RagAsk';
import { ReviewerPipeline } from './pages/ReviewerPipeline';
import { ReviewerReport } from './pages/ReviewerReport';

/** 顶部导航项定义（path 一字不改）。 */
const NAV_ITEMS = [
  { to: '/', label: '总览', icon: <DashboardIcon fontSize="small" /> },
  { to: '/rag', label: 'RAG 知识库', icon: <MenuBookIcon fontSize="small" /> },
  { to: '/reviewer', label: 'Code Reviewer', icon: <RateReviewIcon fontSize="small" /> },
];

function NavBar(): React.ReactElement {
  const location = useLocation();
  return (
    <AppBar position="sticky" color="transparent">
      <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
        {/* 悬浮玻璃胶囊 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            px: 1.5,
            py: 0.8,
            borderRadius: 999,
            background: AURORA.bgGlassStrong,
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(186,196,255,0.22)',
            boxShadow: '0 10px 40px -12px rgba(7,9,26,0.8)',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          <MenuBookIcon sx={{ fontSize: 20 }} />
          {NAV_ITEMS.map((item) => {
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <LiquidButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                color="inherit"
                startIcon={item.icon}
                variant={active ? 'contained' : 'text'}
                sx={{
                  borderRadius: 999,
                  background: active ? AURORA.gradPrimary : 'transparent',
                  color: active ? '#fff' : 'inherit',
                  boxShadow: active ? '0 6px 18px -6px rgba(91,127,224,0.7)' : 'none',
                  border: '1px solid transparent',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: active ? AURORA.gradPrimary : 'rgba(186,196,255,0.12)',
                    boxShadow: active
                      ? '0 8px 22px -6px rgba(91,127,224,0.8)'
                      : '0 4px 14px -8px rgba(186,196,255,0.3)',
                  },
                  textTransform: 'none',
                }}
              >
                {item.label}
              </LiquidButton>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function GlobalHonestyBanner(): React.ReactElement {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <strong>本地 Demo · 诚实边界：</strong> 无登录/权限、无高并发承诺。
      RAG 检索使用真实智谱 embedding-3 1024 维向量（references 为真实语义召回）；
      Chat 生成模式以每次问答接口响应为准（真实 / Mock 不在此预先声明）。
      Code Reviewer 真实 AI 当前仅评审默认前 3 个核心文件、最多少量 issues，非完整商业 SaaS。
    </Alert>
  );
}

/**
 * 应用外壳：必须在 <BrowserRouter> 内部调用 useLocation()。
 * 路由 path 一字不改（/、/rag、/rag/ask、/reviewer、/reviewer/report/:taskId）。
 */
function AppShell(): React.ReactElement {
  const location = useLocation();
  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 3, position: 'relative' }}>
        <GlobalHonestyBanner />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/rag" element={<PageTransition><RagPipeline /></PageTransition>} />
            <Route path="/rag/ask" element={<PageTransition><RagAsk /></PageTransition>} />
            <Route path="/reviewer" element={<PageTransition><ReviewerPipeline /></PageTransition>} />
            <Route path="/reviewer/report/:taskId" element={<PageTransition><ReviewerReport /></PageTransition>} />
            <Route path="*" element={<PageTransition><Dashboard /></PageTransition>} />
          </Routes>
        </AnimatePresence>
        <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
          AI Projects Frontend · 仅供本地联调与演示
        </Box>
      </Container>
    </>
  );
}

export function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <LiquidBackground />
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
