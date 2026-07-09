import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 裸 String 端点：/api/reviews/tasks/{id}/report/markdown
 * 该接口不走 ApiResponse 包裹，直接返回 text/markdown 文本，需特判。
 */
const RAW_MARKDOWN_REGEX = /\/api\/reviews\/tasks\/[^/]+\/report\/markdown\/?$/;

/**
 * 统一客户端错误：把后端非 2xx、超时、网络异常归一化为含 message/status 的 Error，
 * 便于页面直接展示。
 */
export class ApiClientError extends Error {
  status?: number;
  raw?: unknown;

  constructor(message: string, status?: number, raw?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.raw = raw;
  }
}

/**
 * 全局 axios 实例。
 * baseURL 为空字符串：所有请求走相对路径 /api/...，由 Vite dev proxy 转发到对应后端。
 */
const http = axios.create({
  baseURL: '',
  timeout: 60_000,
});

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = response.config.url ?? '';

    // 特判：裸 Markdown 文本端点，直接返回字符串本身（不拆 .data）。
    if (RAW_MARKDOWN_REGEX.test(url)) {
      return response.data as unknown as AxiosResponse;
    }

    // 成功判定以 HTTP 2xx 为准（axios 默认行为），绝不依赖 body.code。
    // 统一拆出 ApiResponse 的 data 字段；若响应本身不是 ApiResponse 外壳则原样返回。
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as { data: unknown }).data as unknown as AxiosResponse;
    }
    return body as unknown as AxiosResponse;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const body = error.response?.data as { message?: string } | undefined;
    let message = body?.message ?? '';
    if (!message) {
      if (error.code === 'ECONNABORTED') {
        message = '请求超时，请确认后端已启动且可访问';
      } else if (error.code === 'ERR_NETWORK') {
        message = '网络错误，请确认后端已启动（RAG:8080 / Reviewer:8081）';
      } else {
        message = error.message || '请求失败，请稍后重试';
      }
    }
    return Promise.reject(new ApiClientError(message, status, error.response?.data));
  },
);

/** 业务请求封装：拦截器已拆出 data，这里将返回值断言为业务类型 T。 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get(url, config);
  return res as unknown as T;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.post(url, data, config);
  return res as unknown as T;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.delete(url, config);
  return res as unknown as T;
}

/** 将任意异常归一化为可读字符串，供页面 Alert 展示。 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return '未知错误';
}

export { http };
