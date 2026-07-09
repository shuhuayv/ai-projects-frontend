/**
 * 端点配置（开发期相对路径）。
 *
 * 前端统一以相对路径 /api/... 发起请求，由 Vite dev proxy 按前缀转发：
 *   /api/rag | /api/documents | /api/search -> ai-knowledge-rag (http://localhost:8080)
 *   /api/repos | /api/reviews                 -> ai-code-reviewer (http://localhost:8081)
 *
 * 因此 RAG_BASE / REVIEWER_BASE 在开发期均为空字符串（相对路径）。
 * 若将来前后端同源部署或走网关，可在此统一改成绝对 baseURL。
 */
export const RAG_BASE = '';
export const REVIEWER_BASE = '';

/** 后端端口约定（仅用于 UI 展示与状态探测说明）。 */
export const RAG_PORT = 8080;
export const REVIEWER_PORT = 8081;
