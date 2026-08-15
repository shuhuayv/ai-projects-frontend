# Interview Narrative — ai-projects-frontend

## 30 秒

我做了一个 React + TypeScript 的统一前端控制台，把两个独立 AI 后端——RAG 知识库问答和 AI Code Reviewer——通过类型化 API 客户端和 Vite 代理整合到一个界面里。我加了 27 个 Vitest 契约/组件测试，并完成了一次受控的前端代理 REAL RAG 请求和 Reviewer 报告只读集成验证，同时严格区分了「受控验证」与「全面 E2E」的边界。

## 90 秒

从架构上说，前端用相对 `/api` 路径配合 Vite dev proxy，把请求转发到 RAG(:8080) 和 Reviewer(:8081)，代码不感知后端地址。我做了统一的 `ApiResponse` unwrap 拦截层，并对 Reviewer 的 raw `text/markdown` 端点做了特判。UI 上有 `HonestyBadge`，配合 `isRealChatProvider` 把 Mock 和真实 zhipu/glm-4.5-air 模式诚实标注，避免把 Mock 误展示为真实能力。

验证层面，我没有做浏览器自动化 E2E，而是通过一次受控代理请求证明前端能打到真实 RAG 后端并拿到 REAL 元数据（embedding-3 / 1024 / REAL，fallback=false），且副作用仅限 append-only 审计日志；同时只读读取了冻结 Reviewer 的既有 task9 报告。27 个测试覆盖了 API 路径契约、模式标注和 raw Markdown 处理。

## 3 分钟

整体是一个「体验 / 联调壳」：它不持有任何密钥，只消费后端契约，目标是把两个后端的真实能力和边界如实呈现给用户。

**React 架构**：Vite + React 18 + TypeScript + MUI，5 个页面（Dashboard / RagPipeline / RagAsk / ReviewerPipeline / ReviewerReport），MarkdownReport 用 remark-gfm 渲染 GFM 表格，并把 Reviewer 的 3.Issues 解析成响应式卡片。

**API 契约**：`http.ts` 拦截器以 HTTP 2xx 判成功并统一 unwrap；对 `/report/markdown` 的裸 `text/markdown` 返回单独分支处理。代理路径在契约测试里被钉死，防止重构改坏路由。

**Vite proxy**：开发期相对 `/api/*` 转发，避免 CORS 与硬编码后端地址。

**后端分离**：前端只连 RAG 与 Reviewer，不引入第三后端；`isRealChatProvider` 按 provider/model 规则判定 REAL，防止 Mock 误标。

**RAG REAL 元数据**：受控一次代理 ask 拿到 provider=zhipu / model=glm-4.5-air / embedding-3 / 1024 / REAL / fallback=false，前端据此展示 REAL 徽标。

**Reviewer 报告读取**：只读读取冻结 Reviewer 既有 task9 的 issues / report / raw Markdown，不创建新 task。

**exactly-one 变更纪律**：一次 REAL ask 足以证明契约打通，且把审计日志 +1 精确归因，不引入额外后端写入、不做负载测试。

**测试与边界**：6 文件 27 测试全过；明确不声称浏览器自动化 E2E、不声称 RAG 精度验证、不声称通过前端创建真实 Reviewer 全流程。整个交付在冻结基线上只新增文档与预批准的契约测试，production 源码零改动。
