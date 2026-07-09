import { createTheme } from '@mui/material/styles';

/** 全局 MUI 主题：干净的蓝色主色 + 紫色辅助色，适合控制台风格。 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#6a1b9a' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  typography: {
    fontFamily:
      '"Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});
