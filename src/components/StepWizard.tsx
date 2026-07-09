import { Box, Step, StepContent, StepLabel, Stepper, Typography, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import React from 'react';

/** 单个步骤的状态。 */
export type StepStatus = 'idle' | 'active' | 'loading' | 'success' | 'error';

/** 单个步骤的展示定义（状态由页面维护，StepWizard 仅做展示）。 */
export interface WizardStep {
  key: string;
  label: string;
  description?: string;
  status: StepStatus;
  /** 成功 / 失败时的详情信息。 */
  message?: string;
}

export interface StepWizardProps {
  steps: WizardStep[];
  /** 当前激活步骤索引（高亮用）。 */
  activeStep: number;
  /** 每个步骤操作区（如按钮）的渲染函数，由页面注入业务逻辑。 */
  renderActions?: (step: WizardStep, index: number) => React.ReactNode;
}

function StepIcon({ status }: { status: StepStatus }): React.ReactNode {
  switch (status) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'loading':
      return <CircularProgress size={20} />;
    case 'active':
      return <RadioButtonUncheckedIcon color="primary" />;
    default:
      return <RadioButtonUncheckedIcon />;
  }
}

/**
 * 多步流程引导组件（展示型，单一职责）。
 * - 渲染 MUI Stepper，展示每步状态图标与说明
 * - 成功/失败消息展示在 StepContent 内
 * - 每步的操作按钮由 renderActions 注入，页面持有业务逻辑
 */
export function StepWizard({ steps, activeStep, renderActions }: StepWizardProps): React.ReactElement {
  return (
    <Stepper activeStep={activeStep} orientation="vertical" sx={{ width: '100%' }}>
      {steps.map((step, index) => (
        <Step key={step.key} completed={step.status === 'success'}>
          <StepLabel StepIconComponent={() => <StepIcon status={step.status} />} optional={
            step.status === 'loading' ? <Typography variant="caption">进行中…</Typography> : undefined
          }>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {step.label}
            </Typography>
          </StepLabel>
          <StepContent>
            {step.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {step.description}
              </Typography>
            )}

            {step.status === 'success' && step.message && (
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                ✓ {step.message}
              </Typography>
            )}
            {step.status === 'error' && step.message && (
              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                ✗ {step.message}
              </Typography>
            )}

            <Box sx={{ mb: 2, mt: 1 }}>{renderActions?.(step, index)}</Box>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
