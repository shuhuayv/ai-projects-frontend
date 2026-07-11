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
  /** 新增：Embedding 提供方（如 zhipu）。 */
  embeddingProvider?: string;
  /** 新增：Embedding 模型（如 embedding-3）。 */
  embeddingModel?: string;
  /** 新增：Embedding 维度（Integer，可空）。 */
  embeddingDimensions?: number | null;
  /** 新增：索引版本（如 v1）。 */
  indexVersion?: string;
}

// ===================== RAG：Embedding 服务状态 =====================

/** GET /api/embedding/status 返回（data 为松散对象，固定 7 字段，全部 optional 以兼容旧后端）。 */
export interface EmbeddingStatus {
  provider?: string;
  model?: string;
  dimensions?: number;
  mode?: string;
  collectionName?: string;
  fallbackEnabled?: boolean;
  /** true 表示后端环境变量存在（绝不返回 Key 本身）。 */
  apiKeyConfigured?: boolean;
}

// ===================== RAG：语义检索 =====================

export interface SearchRequest {
  query: string;
  topK?: number;
}

export interface SearchResultItem {
  documentId: number;
  chunkId: number;
  /** 可空（旧后端可能缺省）。 */
  chunkIndex?: number | null;
  content: string;
  /** 余弦相似度 [0,1]，可空。 */
  score?: number | null;
  collectionName: string;
}

export interface SearchResponse {
  query: string;
  topK: number;
  resultCount: number;
  results: SearchResultItem[];
  costMs: number;
  /** 新增：检索候选数。 */
  retrievalCandidateCount?: number;
  /** 新增：检索返回数。 */
  retrievalReturnedCount?: number;
}

// ===================== RAG：RAG 问答 =====================

export interface RagAskRequest {
  question: string;
  topK?: number;
}

export interface RagReferenceItem {
  documentId: number;
  chunkId: number;
  /** 可空（旧后端可能缺省）。 */
  chunkIndex?: number | null;
  content: string;
  /** 余弦相似度 [0,1]，可空。 */
  score?: number | null;
}

export interface RagAskResponse {
  question: string;
  answer: string;
  topK: number;
  referenceCount: number;
  references: RagReferenceItem[];
  promptPreview: string;
  costMs: number;
  // ===== 检索层 / Embedding 透明字段（旧后端可能缺失，全部 optional） =====
  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  embeddingMode?: string;
  collectionName?: string;
  retrievalTopK?: number;
  retrievalMinScore?: number;
  retrievalCandidateCount?: number;
  retrievalReturnedCount?: number;
  fallbackUsed?: boolean;
  retrievalQualityNote?: string;
  // ===== Chat 层 =====
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
