# Interview — Frontend Design (20 Q&A)

> 全部回答以已闭环的受控验证为事实基础，不夸大。

### 1. 为什么做统一 Frontend Console？
有两个独立后端（RAG 知识库问答、AI Code Reviewer），各自暴露 HTTP API。统一控制台让用户在浏览器里跑通两条业务流水线，集中呈现后端真实能力与边界，避免为两个后端各写一套前端。

### 2. 为什么只连接 RAG + Reviewer，而不连接 Backend Template？
Backend Template 不是本前端的第三个运行时后端，它在本项目中仅作为独立脚手架/模板存在。前端职责是消费「已存在的两个业务后端」的契约；禁止新增第三后端入口，保持职责单一。

### 3. 为什么使用 Vite proxy？
开发期前端跑在 `localhost:5173`，后端在 `localhost:8080 / :8081`，存在 CORS 与端口差异。Vite dev proxy 用相对 `/api/*` 转发，前端代码只需写相对路径，无需在代码里硬编码后端 host/port，也绕开了 CORS。

### 4. 为什么 frontend API wrapper 使用相对 `/api`？
相对路径使请求默认发往同源（dev 下由 Vite proxy 转发，prod 下由反向代理/网关转发）。前端不感知具体后端地址，便于环境切换，也避免了把后端地址写死在前端源码里。

### 5. ApiResponse 为什么统一 unwrap？
后端返回结构不统一（有的包 `data`、有的裸返回、Markdown 端点裸返回 `text/markdown`）。`http.ts` 响应拦截器统一以 HTTP 2xx 判成功并做 unwrap，调用方拿到干净的领域对象，错误处理集中在一层。

### 6. 为什么 raw Markdown 端点需要特判？
Reviewer 的 `/report/markdown` 返回 `Content-Type: text/markdown` 的裸文本，而非 JSON。拦截器需识别该 content-type 走「直接返回字符串」分支，否则会被当成 JSON 解析而失败。这是契约差异驱动的特判，不是 hack。

### 7. PromptPreview 解决什么问题？
RAG 检索会生成较长的 Prompt 上下文；`PromptPreview` 把 Prompt 分段预览、长文本折叠/滚动，避免大段文本撑破布局，让用户在 Ask 页直观看到「喂给模型的上下文长什么样」。

### 8. MarkdownReport 为什么使用 remark-gfm？
Reviewer 报告含 GFM 表格（3.Issues 等）。`remark-gfm` 让 react-markdown 正确渲染表格、任务列表、删除线等 GitHub 风格语法，保证报告排版与 GitHub 一致。

### 9. Reviewer issues 为什么卡片/表格化？
Reviewer 返回的结构化 issue（风险等级、文件路径、建议）被解析为响应式卡片（≥1080px 双列，窄屏单列），用色块区分错误/警告/建议，长路径自动换行，提升可读性。

### 10. HonestyBadge 的工程意义是什么？
后端在 Mock 与真实模式间切换、且真实 AI 覆盖有限（Reviewer 仅前 3 文件）。`HonestyBadge` 在 UI 上动态标注 Mock / 真实 / 伪向量 / 仅前3文件 等状态，防止把 Mock 或有限能力误展示为「完整生产能力」——这是诚实工程的重要一环。

### 11. 为什么不能把 backend REAL 能力直接等同于 frontend REAL E2E？
前端只消费后端契约与响应元数据（如 provider/model/embeddingMode），它证明了「一次受控代理请求打到真实后端并拿到 REAL 元数据」，但**不等于**对前端做了完整浏览器端到端验证，也不等于验证了 RAG 精度。两者证据层级不同。

### 12. `isRealChatProvider` 如何避免 Mock 误标为 REAL？
该函数按 `(provider, model)` 白名单/规则判定：只有命中已知真实 provider（如 zhipu + glm-4.5-air）才标 REAL，否则标 Mock/未知。这样即便后端返回字段缺失或被 Mock 替换，前端也不会把 Mock 错误展示成真实 AI。

### 13. 为什么增加 API-path contract tests？
前端对代理路径（`/api/rag|documents|search|embedding` → RAG，`/api/repos|reviews` → Reviewer）有硬依赖。路径写错会导致整条链路静默失败。契约测试把这些路径钉死，防止重构时无意改坏代理路由。

### 14. 为什么不安装 Playwright/Cypress？
当前目标是受控代理集成 + 组件/契约回归，而非浏览器自动化 E2E。引入 E2E 框架会带来维护成本与 CI 复杂度，且本项目已有明确的「不声称浏览器 E2E」边界。测试策略聚焦单元/契约层。

### 15. 当前 controlled integration 验证了什么？
验证了：①前端经 Vite proxy 对冻结 RAG 成功发起**一次** REAL ask（provider/model/embedding 元数据均 REAL，fallback=false）；②前端经 proxy 只读读取冻结 Reviewer 既有 task9 的 issues/report/raw Markdown；③受控 ask 只产生 append-only 审计日志副作用，corpus / Qdrant 无观测变化。

### 16. RAG exactly-one ask 为什么只允许一次？
这是为了把「受控验证」与「生产流量」严格区分：一次代理 REAL ask 足以证明前端→真实后端的契约打通与 REAL 元数据正确，同时避免产生额外后端写入、避免把验证变成负载测试，也便于把副作用（ai_call_log +1）精确归因。

### 17. 为什么 `ai_call_log +1` 不属于 corpus mutation？
`ai_call_log` 是**追加式审计表**（每次请求记一行），与知识库内容（kb_document / kb_chunk / kb_vector_record）无关。+1 只是请求留痕，不改变任何语料或向量，因此不构成 corpus / vector mutation。

### 18. 为什么 Reviewer 使用 existing task9 而不创建新 task？
受控验证的目标是「前端能否正确读取并渲染冻结 Reviewer 的既有历史」。创建新 task 会引入后端写操作与额外状态，偏离「只读集成」目标，也违背「本 Gate 不创建 Reviewer task」的边界。

### 19. 为什么 Frontend 不接触 API key？
密钥（Zhipu key、DB 密码）由后端 / Keychain 在运行时注入后端进程，前端只发相对 `/api` 请求，绝不持有或转发任何 secret。这缩小了密钥暴露面，也与「前端不接触任何凭证」的边界一致。

### 20. 当前离 production 还缺什么？
无登录 / RBAC；无 SSE 流式输出（当前用 loading 态）；未做公网部署 / 反向代理 / CORS 生产配置；无生产流量、并发、负载验证；Reviewer 真实评审仍受后端 file/issue scope 限制；RAG 精度与全面浏览器 E2E 未经前端验证。
