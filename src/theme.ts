import { createTheme } from '@mui/material/styles';

/**
 * Aurora Galaxy × Liquid Ripple 主题（mode: 'dark'）。
 * 蓝紫极光渐变星空 + 玻璃质感；冷蓝主色 + 紫罗兰强调。
 * 语义色均为极光调（蓝紫 + 柔和粉紫），避免高饱和荧光。
 * 导出 AURORA 供组件复用渐变 / 强调色。
 */
export const AURORA = {
  bgBase: '#07091A', // 极光基底
  bgDeep: '#0B1030', // 深空
  bgElevated: '#141A3A', // 玻璃纸面基础
  bgGlass: 'rgba(20, 26, 58, 0.55)', // 半透明玻璃
  bgGlassStrong: 'rgba(16, 20, 48, 0.80)', // 强玻璃（导航胶囊 / 弹层）
  divider: 'rgba(180, 190, 255, 0.14)',
  borderStrong: 'rgba(186, 196, 255, 0.28)',
  textPrimary: '#F4F6FF',
  textSecondary: 'rgba(230, 235, 255, 0.66)',
  primary: '#5B7FE0', // 冷蓝（主色）
  primaryLight: '#8AA6F2',
  primaryDark: '#3F5FB8',
  secondary: '#9B6FD4', // 紫罗兰（强调 / 次按钮）
  secondaryLight: '#B694E6',
  secondaryDark: '#7A52B0',
  success: '#5BB98C',
  successDark: '#3F956E',
  warning: '#E0A45C',
  warningDark: '#B97E3A',
  error: '#E2728C',
  info: '#6AA0E0',
  gradPrimary: 'linear-gradient(135deg, #4C7BD9 0%, #7146A7 100%)',
  gradIcon: 'linear-gradient(145deg, rgba(76,123,217,0.95) 0%, rgba(113,70,167,0.95) 100%)',
  gradBrand: 'linear-gradient(120deg, #263E89 0%, #7146A7 48%, #B35A9B 100%)',
};

/**
 * 字体栈。
 * - 正文：Inter 优先，后接中文回退（PingFang SC / 微软雅黑 / Noto Sans SC）。
 * - 代码/路径：JetBrains Mono 优先，后接等宽回退。
 * 在任何非 MUI 控制的纯 DOM（如 .markdown-body / .pre-block）中也复用这两个常量。
 */
export const FONT_SANS =
  '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
export const FONT_MONO =
  '"JetBrains Mono", "Fira Code", "SFMono-Regular", "Menlo", monospace';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: AURORA.bgBase,
      paper: AURORA.bgGlass,
    },
    primary: {
      main: AURORA.primary,
      light: AURORA.primaryLight,
      dark: AURORA.primaryDark,
      contrastText: '#F4F6FF',
    },
    secondary: {
      main: AURORA.secondary,
      light: AURORA.secondaryLight,
      dark: AURORA.secondaryDark,
      contrastText: '#F4F6FF',
    },
    success: { main: AURORA.success, dark: AURORA.successDark, contrastText: '#04221A' },
    warning: { main: AURORA.warning, dark: AURORA.warningDark, contrastText: '#2A1C08' },
    error: { main: AURORA.error, contrastText: '#2A0E16' },
    info: { main: AURORA.info, contrastText: '#04263F' },
    text: {
      primary: AURORA.textPrimary,
      secondary: AURORA.textSecondary,
      disabled: 'rgba(230, 235, 255, 0.38)',
    },
    divider: AURORA.divider,
  },
  typography: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    htmlFontSize: 16,
    // 正文：14px / 行高 1.7，提升中文阅读舒适度
    body1: { fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 400 },
    // 辅助信息：13px / 行高 1.6
    body2: { fontSize: '0.8125rem', lineHeight: 1.6, fontWeight: 400 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: { fontSize: '0.6875rem', lineHeight: 1.5, letterSpacing: '0.08em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h5: { fontWeight: 700, lineHeight: 1.3 },
    h6: { fontWeight: 600, lineHeight: 1.35 },
    subtitle1: { fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, lineHeight: 1.45 },
  },
  shape: { borderRadius: 14 },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: { easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          transition:
            'background-color 200ms cubic-bezier(0.22,1,0.36,1), ' +
            'box-shadow 200ms cubic-bezier(0.22,1,0.36,1), ' +
            'border-color 200ms cubic-bezier(0.22,1,0.36,1), ' +
            'transform 200ms cubic-bezier(0.22,1,0.36,1)',
          '&:active': { transform: 'translateY(1px)' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: AURORA.bgGlass,
          border: `1px solid ${AURORA.divider}`,
          backdropFilter: 'blur(14px)',
          borderRadius: 16,
        },
      },
    },
    // 导航胶囊自行绘制玻璃，AppBar 透明。
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          color: AURORA.textPrimary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        outlined: { borderColor: AURORA.borderStrong },
        outlinedPrimary: { borderColor: 'rgba(91,127,224,0.5)', color: AURORA.primaryLight },
        outlinedSecondary: { borderColor: 'rgba(155,111,212,0.5)', color: AURORA.secondaryLight },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, backdropFilter: 'blur(6px)', border: `1px solid ${AURORA.divider}` },
        standardInfo: { backgroundColor: 'rgba(106,160,224,0.12)', color: AURORA.textPrimary },
        standardSuccess: { backgroundColor: 'rgba(91,185,140,0.12)', color: AURORA.textPrimary },
        standardWarning: { backgroundColor: 'rgba(224,164,92,0.12)', color: AURORA.textPrimary },
        standardError: { backgroundColor: 'rgba(226,114,140,0.12)', color: AURORA.textPrimary },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: AURORA.divider,
          // 增加单元格内边距（≥12px），长文本列不再拥挤
          padding: '14px 16px',
          verticalAlign: 'top',
          lineHeight: 1.6,
          // 长文本（文件路径 / 内容片段 / 修改建议）正确换行，避免重叠
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        },
        head: {
          color: AURORA.textSecondary, // 表头使用 AURORA 次要色
          backgroundColor: 'rgba(180,190,255,0.06)',
          fontWeight: 700, // 表头加粗
          fontSize: '0.8125rem', // 表头字号略小（13px）
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        },
        body: { fontSize: '0.875rem' },
        // size="small" 表格也保持 ≥12px 内边距，行高适当增加
        sizeSmall: { padding: '12px 16px' },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: AURORA.divider } } },
    MuiInputLabel: { styleOverrides: { root: { color: AURORA.textSecondary } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
        notchedOutline: { borderColor: AURORA.borderStrong },
      },
    },
  },
});
