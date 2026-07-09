import React from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box, Alert, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HubIcon from '@mui/icons-material/Hub';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import { theme } from './theme';
import { Dashboard } from './pages/Dashboard';
import { RagPipeline } from './pages/RagPipeline';
import { RagAsk } from './pages/RagAsk';
import { ReviewerPipeline } from './pages/ReviewerPipeline';
import { ReviewerReport } from './pages/ReviewerReport';

/** 顶部导航项定义。 */
const NAV_ITEMS = [
  { to: '/', label: '总览', icon: <MenuBookIcon fontSize="small" /> },
  { to: '/rag', label: 'RAG 知识库', icon: <HubIcon fontSize="small" /> },
  { to: '/reviewer', label: 'Code Reviewer', icon: <RateReviewIcon fontSize="small" /> },
];

function NavBar(): React.ReactElement {
  const location = useLocation();
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexShrink: 0, mr: 3, fontWeight: 700 }}>
          AI 项目控制台
        </Typography>
        <Stack direction="row" spacing={1}>
          {NAV_ITEMS.map((item) => {
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                color="inherit"
                startIcon={item.icon}
                variant={active ? 'contained' : 'text'}
                sx={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  textTransform: 'none',
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function GlobalHonestyBanner(): React.ReactElement {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <strong>本地 Demo · 诚实边界：</strong> 无登录/权限、无高并发承诺。
      RAG 的 Embedding 为 SHA-256 伪向量、检索为演示性伪向量（references 非真实语义召回）；
      Code Reviewer 真实 AI 当前仅评审默认前 3 个核心文件、最多少量 issues，非完整商业 SaaS。
    </Alert>
  );
}

export function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <GlobalHonestyBanner />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rag" element={<RagPipeline />} />
            <Route path="/rag/ask" element={<RagAsk />} />
            <Route path="/reviewer" element={<ReviewerPipeline />} />
            <Route path="/reviewer/report/:taskId" element={<ReviewerReport />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Container>
        <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
          AI Projects Frontend · 仅供本地联调与演示
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
