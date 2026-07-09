import { apiPost } from './http';
import {
  DocumentUploadResponse,
  DocumentParseResponse,
  DocumentIndexResponse,
  SearchResponse,
  RagAskResponse,
} from './types';

/**
 * RAG（ai-knowledge-rag，默认 :8080）接口封装。
 * 所有路径使用相对路径 /api/...，由 Vite dev proxy 转发。
 */
export const ragApi = {
  /** 上传 TXT/PDF 文档（multipart/form-data）。 */
  uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiPost<DocumentUploadResponse>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 解析文档并切分为 Chunk。 */
  parseDocument(documentId: number | string): Promise<DocumentParseResponse> {
    return apiPost<DocumentParseResponse>(`/api/documents/${documentId}/parse`);
  },

  /** 生成 Embedding 并写入向量库（当前为 Mock 伪向量）。 */
  indexDocument(documentId: number | string): Promise<DocumentIndexResponse> {
    return apiPost<DocumentIndexResponse>(`/api/documents/${documentId}/index`);
  },

  /** 语义检索。 */
  search(query: string, topK = 5): Promise<SearchResponse> {
    return apiPost<SearchResponse>('/api/search', { query, topK });
  },

  /** RAG 问答（支持真实智谱 / Mock）。 */
  ask(question: string, topK = 5): Promise<RagAskResponse> {
    return apiPost<RagAskResponse>('/api/rag/ask', { question, topK });
  },
};
