/**
 * 全局类型定义：统一响应外壳 + 两个后端的所有 DTO。
 *
 * 字段命名严格对齐后端（Spring Boot + Jackson 默认驼峰）：
 *   ai-knowledge-rag  包名 com.shuhuayv.rag
 *   ai-code-reviewer  包名 com.shuhuayv.codereviewer
 */

// ===================== 统一响应外壳 =====================

/** 两个后端共享的响应外壳（RAG 成功 code=0，reviewer 成功 code=200）。 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页结果外壳。 */
export interface PageResult<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  records: T[];
}

// ===================== RAG：文档流水线 =====================

export interface DocumentUploadResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

export interface DocumentParseResponse {
  documentId: number;
  fileName: string;
  status: string;
  chunkCount: number;
  message: string;
}

export interface DocumentIndexResponse {
  documentId: number;
  status: string;
  chunkCount: number;
  vectorCount: number;
  collectionName: string;
  message: string;
}

// ===================== RAG：语义检索 =====================

export interface SearchRequest {
  query: string;
  topK?: number;
}

export interface SearchResultItem {
  documentId: number;
  chunkId: number;
  chunkIndex: number;
  content: string;
  score: number;
  collectionName: string;
}

export interface SearchResponse {
  query: string;
  topK: number;
  resultCount: number;
  results: SearchResultItem[];
  costMs: number;
}

// ===================== RAG：RAG 问答 =====================

export interface RagAskRequest {
  question: string;
  topK?: number;
}

export interface RagReferenceItem {
  documentId: number;
  chunkId: number;
  chunkIndex: number;
  content: string;
  score: number;
}

export interface RagAskResponse {
  question: string;
  answer: string;
  topK: number;
  referenceCount: number;
  references: RagReferenceItem[];
  promptPreview: string;
  costMs: number;
  provider: string;
  model: string;
}

// ===================== Code Reviewer：仓库 =====================

export interface CreateRepoRequest {
  name: string;
  url: string;
  branch: string;
  description?: string;
  language?: string;
}

export interface RepoResponse {
  id: number;
  name: string;
  url: string;
  branch: string;
  description: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepoCloneResponse {
  repoId: number;
  repoUrl: string;
  branch: string;
  localPath: string;
  status: string;
  message: string;
  costMs: number;
}

export interface CodeScanResponse {
  repoId: number;
  scannedFileCount: number;
  skippedFileCount: number;
  totalLineCount: number;
  languages: Record<string, number>;
  costMs: number;
}

// ===================== Code Reviewer：评审任务 =====================

export interface CreateReviewTaskRequest {
  repoId: number;
  commitId?: string;
  branch?: string;
  reviewScope?: string;
}

/**
 * 创建评审任务的响应。
 * mode / provider / model 由补丁 reviewer-mode-fields 补齐；
 * 未应用补丁时为 undefined，前端按保守诚实标签处理。
 */
export interface ReviewTaskResponse {
  taskId: number;
  repoId: number;
  status: string;
  issueCount: number;
  summary: string;
  createdAt: string;
  mode?: string;
  provider?: string;
  model?: string;
}

export interface ReviewTaskDetailResponse {
  id: number;
  repoId: number;
  commitId: string;
  branch: string;
  status: string;
  issueCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewIssueResponse {
  id: number;
  taskId: number;
  filePath: string;
  lineNumber: number;
  severity: string;
  category: string;
  title: string;
  description: string;
  suggestion: string;
  createdAt: string;
}

export interface ReviewReportResponse {
  id: number;
  taskId: number;
  summary: string;
  overallAssessment: string;
  markdownContent: string;
  createdAt: string;
}
