import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { reviewerApi } from '../api/reviewer';
import { toErrorMessage } from '../api/http';
import { StepWizard, WizardStep, StepStatus } from '../components/StepWizard';
import { HONESTY } from '../components/HonestyBadge';
import { LiquidCard } from '../components/LiquidCard';
import { LiquidButton } from '../components/LiquidButton';
import { FeatureIcon } from '../components/FeatureIcon';
import { ReviewTaskResponse } from '../api/types';

type StepKey = 'create' | 'clone' | 'scan' | 'review';
type StepState = Record<StepKey, { status: StepStatus; message?: string }>;

const INITIAL: StepState = {
  create: { status: 'idle' },
  clone: { status: 'idle' },
  scan: { status: 'idle' },
  review: { status: 'idle' },
};

const DEFAULT_URL = 'https://github.com/spring-projects/spring-petclinic';
const DEFAULT_BRANCH = 'main';

export function ReviewerPipeline(): React.ReactElement {
  const navigate = useNavigate();
  const [name, setName] = useState('spring-petclinic');
  const [url, setUrl] = useState(DEFAULT_URL);
  const [branch, setBranch] = useState(DEFAULT_BRANCH);
  const [description, setDescription] = useState('Spring PetClinic 演示仓库');
  const [language, setLanguage] = useState('Java');

  const [repoId, setRepoId] = useState<number | null>(null);
  const [steps, setSteps] = useState<StepState>(INITIAL);
  const [error, setError] = useState('');

  const setStep = (key: StepKey, status: StepStatus, message?: string) =>
    setSteps((prev) => ({ ...prev, [key]: { status, message } }));
  const activeStep = (() => {
    if (steps.review.status === 'success') return 3;
    if (steps.scan.status === 'success') return 3;
    if (steps.clone.status === 'success') return 2;
    if (steps.create.status === 'success' || repoId !== null) return 1;
    return 0;
  })();

  const formValid = name.trim() !== '' && url.trim() !== '' && branch.trim() !== '';

  const handleCreate = async () => {
    if (!formValid) {
      setError('仓库名称、URL、分支均为必填');
      return;
    }
    setError('');
    setStep('create', 'loading');
    try {
      const repo = await reviewerApi.createRepo({
        name: name.trim(),
        url: url.trim(),
        branch: branch.trim(),
        description: description.trim() || undefined,
        language: language.trim() || undefined,
      });
      setRepoId(repo.id);
      setStep('create', 'success', `仓库 #${repo.id} 已创建`);
    } catch (e) {
      setStep('create', 'error', toErrorMessage(e));
    }
  };

  const handleClone = async () => {
    if (repoId === null) return;
    setError('');
    setStep('clone', 'loading');
    try {
      const r = await reviewerApi.cloneRepo(repoId);
      setStep('clone', 'success', `克隆完成 · ${r.costMs} ms · ${r.localPath}`);
    } catch (e) {
      setStep('clone', 'error', toErrorMessage(e));
    }
  };

  const handleScan = async () => {
    if (repoId === null) return;
    setError('');
    setStep('scan', 'loading');
    try {
      const r = await reviewerApi.scanRepo(repoId);
      setStep('scan', 'success', `扫描 ${r.scannedFileCount} 文件 / ${r.totalLineCount} 行`);
    } catch (e) {
      setStep('scan', 'error', toErrorMessage(e));
    }
  };

  const handleReview = async () => {
    if (repoId === null) return;
    setError('');
    setStep('review', 'loading');
    try {
      const r: ReviewTaskResponse = await reviewerApi.createReview({
        repoId,
        reviewScope: 'FULL_REPO',
      });
      setStep('review', 'success', `评审完成，发现 ${r.issueCount} 个问题`);
      navigate(`/reviewer/report/${r.taskId}`, {
        state: {
          mode: r.mode,
          provider: r.provider,
          model: r.model,
          repoName: name,
          repoUrl: url,
          branch,
        },
      });
    } catch (e) {
      setStep('review', 'error', toErrorMessage(e));
    }
  };

  const wizardSteps: WizardStep[] = [
    { key: 'create', label: '1. 创建仓库', description: '登记仓库元数据（名称 / URL / 分支）。', ...steps.create },
    { key: 'clone', label: '2. 克隆仓库', description: '使用 JGit 将远程仓库克隆到本地。', ...steps.clone },
    { key: 'scan', label: '3. 扫描代码', description: '扫描本地仓库代码文件并入库。', ...steps.scan },
    { key: 'review', label: '4. 创建评审', description: '生成评审问题 + Markdown 报告（Mock / 真实 AI）。', ...steps.review },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <FeatureIcon icon={<RateReviewIcon sx={{ fontSize: 24 }} />} size={44} />
        <Typography variant="h4">Code Reviewer 流水线</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        依次完成「创建仓库 → 克隆 → 扫描 → 创建评审」，最后查看评审报告。
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {HONESTY.reviewerRuleMock}
        {HONESTY.reviewerAiLimited}
      </Stack>

      <LiquidCard variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          仓库信息
        </Typography>
        <Stack spacing={2} sx={{ mb: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="仓库名称（必填）" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="分支（必填）" value={branch} onChange={(e) => setBranch(e.target.value)} sx={{ minWidth: 180 }} />
          </Stack>
          <TextField label="仓库 URL（必填）" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="描述" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
            <TextField label="语言" value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ minWidth: 160 }} />
          </Stack>
        </Stack>
      </LiquidCard>

      <LiquidCard variant="outlined" sx={{ p: 3, mb: 2 }}>
        <StepWizard
          steps={wizardSteps}
          activeStep={activeStep}
          renderActions={(step) => {
            switch (step.key) {
              case 'create':
                return (
                  <LiquidButton variant="contained" onClick={handleCreate} disabled={!formValid || steps.create.status === 'loading'}>
                    创建仓库
                  </LiquidButton>
                );
              case 'clone':
                return (
                  <LiquidButton
                    variant="contained"
                    onClick={handleClone}
                    disabled={repoId === null || steps.clone.status === 'loading' || steps.clone.status === 'success' || steps.scan.status === 'success'}
                  >
                    克隆仓库
                  </LiquidButton>
                );
              case 'scan':
                return (
                  <LiquidButton
                    variant="contained"
                    onClick={handleScan}
                    disabled={repoId === null || steps.scan.status === 'loading' || steps.review.status === 'success'}
                  >
                    扫描代码
                  </LiquidButton>
                );
              default:
                return (
                  <LiquidButton
                    variant="contained"
                    onClick={handleReview}
                    disabled={repoId === null || steps.review.status === 'loading' || steps.review.status === 'success'}
                  >
                    创建评审任务
                  </LiquidButton>
                );
            }
          }}
        />
      </LiquidCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
