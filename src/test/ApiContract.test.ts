import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ragApi, getEmbeddingStatus } from '../api/rag';
import { reviewerApi } from '../api/reviewer';

/**
 * Test #2 — API Contract Paths
 *
 * 对 ragApi / reviewerApi 使用 Vitest mock 拦截 apiGet / apiPost，
 * 验证关键路径与 frozen backend Controller 契约一致（防止 frontend 未来误改路径）。
 *
 * 不复制整个 backend Controller 代码，仅断言 frontend 发出的 method + path + 关键 body。
 */
vi.mock('../api/http', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  toErrorMessage: vi.fn(),
  ApiClientError: class {},
  http: {},
}));

import { apiGet, apiPost } from '../api/http';

const mockedApiGet = apiGet as unknown as ReturnType<typeof vi.fn>;
const mockedApiPost = apiPost as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ragApi — RAG 契约路径 (:8080)', () => {
  it('ask → POST /api/rag/ask，带超时 210000', async () => {
    mockedApiPost.mockResolvedValue({});
    await ragApi.ask('什么是检索增强生成？', 5);
    expect(mockedApiPost).toHaveBeenCalledTimes(1);
    expect(mockedApiPost).toHaveBeenCalledWith(
      '/api/rag/ask',
      { question: '什么是检索增强生成？', topK: 5 },
      { timeout: 210_000 },
    );
  });

  it('getEmbeddingStatus → GET /api/embedding/status', async () => {
    mockedApiGet.mockResolvedValue({ provider: 'zhipu', model: 'embedding-3' });
    const status = await getEmbeddingStatus();
    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/embedding/status');
    expect(status).toEqual({ provider: 'zhipu', model: 'embedding-3' });
  });
});

describe('reviewerApi — Reviewer 契约路径 (:8081)', () => {
  it('getReportMarkdown → GET /api/reviews/tasks/{id}/report/markdown（裸 Markdown）', async () => {
    mockedApiGet.mockResolvedValue('# 评审报告');
    const md = await reviewerApi.getReportMarkdown(9);
    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/reviews/tasks/9/report/markdown');
    expect(md).toBe('# 评审报告');
  });

  it('getTaskDetail → GET /api/reviews/tasks/{id}', async () => {
    mockedApiGet.mockResolvedValue({ id: 9, status: 'COMPLETED' });
    await reviewerApi.getTaskDetail(9);
    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/reviews/tasks/9');
  });

  it('getIssues → GET /api/reviews/tasks/{id}/issues', async () => {
    mockedApiGet.mockResolvedValue([]);
    await reviewerApi.getIssues(9);
    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/reviews/tasks/9/issues');
  });

  it('getReport → GET /api/reviews/tasks/{id}/report', async () => {
    mockedApiGet.mockResolvedValue({ markdownContent: '# x' });
    await reviewerApi.getReport(9);
    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/reviews/tasks/9/report');
  });
});
