import { describe, it, expect, vi } from 'vitest';

/**
 * Test #3 — Raw Markdown / Error Client
 *
 * 验证 http.ts 响应拦截器对裸 Markdown 端点（/api/reviews/tasks/{id}/report/markdown）
 * 不会错误地 unwrap `.data`，而是返回原始 String；
 * 同时验证 ApiClientError / toErrorMessage 的确定性行为。
 *
 * 实现要点：不 mock axios 模块（避免 vi.hoist / vi.mock 提升导致的 TDZ 排序问题）。
 * 直接从 http.ts 导出的真实 http 实例读取已注册的响应拦截器处理器并调用，
 * 不引入 axios-mock-adapter / MSW / Playwright / Cypress 等新依赖。
 */
import { http, apiGet, ApiClientError, toErrorMessage } from '../api/http';

// http.ts 在模块加载时注册了恰好一个响应拦截器；直接读取其 fulfilled 处理器。
const responseInterceptor = (http.interceptors.response as unknown as {
  handlers: Array<{ fulfilled: (r: any) => any; rejected: (e: any) => any }>;
}).handlers[0].fulfilled;

describe('http.ts 响应拦截器 — 裸 Markdown 不 unwrap .data', () => {
  it('Markdown 端点：返回整个 body（不拆 .data）', () => {
    const wrapped = { code: 200, message: 'ok', data: 'INNER_SHOULD_NOT_APPEAR' };
    const result = responseInterceptor({
      config: { url: '/api/reviews/tasks/9/report/markdown' },
      data: wrapped,
    });
    // 关键断言：整体 body 被返回，而非内部的 data 字段
    expect(result).toEqual(wrapped);
    expect(result).not.toBe('INNER_SHOULD_NOT_APPEAR');
  });

  it('Markdown 端点：body 为纯字符串时原样返回', () => {
    const result = responseInterceptor({
      config: { url: '/api/reviews/tasks/9/report/markdown' },
      data: '# 评审报告\n\n内容',
    });
    expect(result).toBe('# 评审报告\n\n内容');
  });

  it('普通 ApiResponse 端点：拆出 .data 字段', () => {
    const wrapped = { code: 200, message: 'ok', data: 'INNER_PAYLOAD' };
    const result = responseInterceptor({
      config: { url: '/api/reviews/tasks/9' },
      data: wrapped,
    });
    expect(result).toBe('INNER_PAYLOAD');
  });

  it('apiGet 经 Markdown 端点返回原始 String（端到端穿过拦截器）', async () => {
    const originalGet = http.get;
    // 仅替换 http.get 的实现以触发真实拦截器，避免发起真实网络请求。
    (http as unknown as { get: typeof http.get }).get = vi.fn(
      async (url: string) => {
        const synthetic = {
          config: { url },
          data: '# 报告内容',
          status: 200,
          statusText: 'OK',
          headers: {},
          request: {},
        };
        return responseInterceptor(synthetic);
      },
    );
    try {
      const out = await apiGet<string>('/api/reviews/tasks/9/report/markdown');
      expect(out).toBe('# 报告内容');
    } finally {
      (http as unknown as { get: typeof http.get }).get = originalGet;
    }
  });
});

describe('ApiClientError + toErrorMessage — 确定性行为', () => {
  it('ApiClientError 携带 status 与 raw', () => {
    const e = new ApiClientError('服务异常', 500, { hint: 'x' });
    expect(e.name).toBe('ApiClientError');
    expect(e.message).toBe('服务异常');
    expect(e.status).toBe(500);
    expect(e.raw).toEqual({ hint: 'x' });
  });

  it('toErrorMessage 返回 ApiClientError.message', () => {
    expect(toErrorMessage(new ApiClientError('boom', 502))).toBe('boom');
  });

  it('toErrorMessage 返回普通 Error.message', () => {
    expect(toErrorMessage(new Error('plain error'))).toBe('plain error');
  });

  it('toErrorMessage 对非 Error 返回 未知错误', () => {
    expect(toErrorMessage('weird')).toBe('未知错误');
    expect(toErrorMessage(null)).toBe('未知错误');
    expect(toErrorMessage(undefined)).toBe('未知错误');
    expect(toErrorMessage(123)).toBe('未知错误');
  });
});
