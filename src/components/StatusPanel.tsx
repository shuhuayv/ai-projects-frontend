import React from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { LiquidButton } from './LiquidButton';

/** 单个后端服务的状态信息。 */
export interface ServiceStatus {
  name: string;
  basePath: string;
  port: number;
  reachable?: boolean;
  error?: string;
}

export interface StatusPanelProps {
  services: ServiceStatus[];
  /** 后端依赖说明（MySQL / Redis / Qdrant 等），仅展示。 */
  dependencies?: string[];
  /** 全局错误提示（如某流水线失败）。 */
  error?: string;
  loading?: boolean;
  /** 点击「刷新状态」时触发。 */
  onRefresh?: () => void;
}

/**
 * 后端状态面板：展示各后端可达性、依赖状态与错误提示。
 * 可达性由页面通过轻量接口探测后传入，本组件只做展示。
 */
export function StatusPanel({
  services,
  dependencies = ['MySQL', 'Redis', 'Qdrant（RAG）'],
  error,
  loading = false,
  onRefresh,
}: StatusPanelProps): React.ReactElement {
  return (
    <Paper variant="outlined" sx={{ p: 2, background: 'transparent', backdropFilter: 'blur(10px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6">后端状态</Typography>
        {onRefresh && (
          <LiquidButton
            size="small"
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            刷新状态
          </LiquidButton>
        )}
      </Stack>

      <Stack spacing={1}>
        {services.map((svc) => (
          <Stack
            key={svc.name}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 0.5,
              borderRadius: 1,
              transition: 'background 0.25s ease',
              '&:hover': { background: 'rgba(186,196,255,0.06)' },
            }}
          >
            {svc.reachable === true ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : svc.reachable === false ? (
              <ErrorOutlineIcon color="error" fontSize="small" />
            ) : (
              <CircularProgress size={14} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {svc.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {svc.basePath} → :{svc.port}
            </Typography>
            {svc.reachable === false && svc.error && (
              <Typography variant="caption" color="error.main">
                （{svc.error}）
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          后端依赖（需本地就绪）：{dependencies.join(' / ')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
