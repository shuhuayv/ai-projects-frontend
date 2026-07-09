import { apiGet, apiPost } from './http';
import {
  RepoResponse,
  RepoCloneResponse,
  CodeScanResponse,
  ReviewTaskResponse,
  ReviewTaskDetailResponse,
  ReviewIssueResponse,
  ReviewReportResponse,
  CreateRepoRequest,
  CreateReviewTaskRequest,
} from './types';

/**
 * Code Reviewer（ai-code-reviewer，默认 :8081）接口封装。
 * 所有路径使用相对路径 /api/...，由 Vite dev proxy 转发。
 *
 * 注意：getReportMarkdown 返回裸 String（text/markdown），不经过 ApiResponse 包裹，
 * http.ts 已对该路径特判，这里直接返回 string。
 */
export const reviewerApi = {
  /** 创建仓库。 */
  createRepo(request: CreateRepoRequest): Promise<RepoResponse> {
    return apiPost<RepoResponse>('/api/repos', request);
  },

  /** 克隆仓库到本地。 */
  cloneRepo(repoId: number | string): Promise<RepoCloneResponse> {
    return apiPost<RepoCloneResponse>(`/api/repos/${repoId}/clone`);
  },

  /** 扫描本地仓库代码文件。 */
  scanRepo(repoId: number | string): Promise<CodeScanResponse> {
    return apiPost<CodeScanResponse>(`/api/repos/${repoId}/scan`);
  },

  /** 创建评审任务（Mock 规则 / 真实 AI，取决于后端配置）。 */
  createReview(request: CreateReviewTaskRequest): Promise<ReviewTaskResponse> {
    return apiPost<ReviewTaskResponse>('/api/reviews/tasks', request);
  },

  /** 评审任务详情。 */
  getTaskDetail(taskId: number | string): Promise<ReviewTaskDetailResponse> {
    return apiGet<ReviewTaskDetailResponse>(`/api/reviews/tasks/${taskId}`);
  },

  /** 评审问题列表。 */
  getIssues(taskId: number | string): Promise<ReviewIssueResponse[]> {
    return apiGet<ReviewIssueResponse[]>(`/api/reviews/tasks/${taskId}/issues`);
  },

  /** 评审报告（JSON，含 markdownContent）。 */
  getReport(taskId: number | string): Promise<ReviewReportResponse> {
    return apiGet<ReviewReportResponse>(`/api/reviews/tasks/${taskId}/report`);
  },

  /** 评审报告（裸 Markdown 文本，特判路径）。 */
  getReportMarkdown(taskId: number | string): Promise<string> {
    return apiGet<string>(`/api/reviews/tasks/${taskId}/report/markdown`);
  },
};
