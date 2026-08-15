# Final Engineering Facts — ai-projects-frontend

> 本文件是 Frontend 最终交付的权威事实清单。所有陈述均来自上一 Gate 已闭环的受控验证，本 Gate 未重新调用任何后端 AI。

---

## Production Implementation Baseline

```
e4a706abc09e9475aa53e5757c8158f16c9b6c78
```

说明：这是 production 前端实现基线（origin/main 在交付时的 SHA）。它是 Frontend 实际生产实现代码的基准，与下面的 contract-test 提交必须区分。

---

## Contract Test Commit

```
8f2df0ae5adf4f8bac0cdea69c8815c9b1d3f161
```

说明：这是一个 **test-only** 的回归增强提交，仅新增/修改 3 个测试文件（ApiContract / ChatModeBadge / RawMarkdownErrorClient），production 代码与 package 零改动。其父提交即 Production Implementation Baseline。

---

## Current Verified Frontend

- 技术栈：Vite / React / TypeScript / MUI，Axios 网络层，react-markdown + remark-gfm 渲染。
- 5 个主要页面：Dashboard / RagPipeline / RagAsk / ReviewerPipeline / ReviewerReport。
- Vite proxy：前端用相对 `/api/*` 路径转发到 RAG(:8080) 与 Code Reviewer(:8081)。
- API 客户端：RAG 与 Reviewer 两套 typed API client + 统一 `ApiResponse<T>` unwrap。
- Markdown：`MarkdownReport.tsx`（含 named export `PromptPreview`）+ `HonestyBadge.tsx`（Mock/真实/伪向量/仅前3文件 等诚实标注）。
- 测试：Vitest 6 files / 27 tests / 0 failed。
- 质量：TypeScript typecheck PASS，Vite build PASS。
- CI：GitHub Actions `ci.yml`（Node 22，npm ci → npm test → npm run build）。

---

## Controlled RAG Integration

- 经由 Vite proxy → 冻结 RAG :8080 → `/api/rag/ask`，**exactly one**（仅 1 次）HTTP POST 尝试。
- provider=zhipu / model=glm-4.5-air；embedding provider=zhipu / model=embedding-3 / dimensions=1024 / mode=REAL；fallback=false；referenceCount=5；costMs=3746。
- 前端 `isRealChatProvider(zhipu, glm-4.5-air)` 判定为 REAL。
- 预期副作用：仅 append-only `ai_call_log` +1（id=69, api_type=RAG_ASK, provider=zhipu, model=glm-4.5-air, status=SUCCESS, cost_ms=3746）。
- 观测：`kb_document` / `kb_chunk` / `kb_vector_record` 行数在 ask 前后保持不变；Qdrant point counts 保持不变。

---

## RAG Evidence Caveat（重要）

上一 Gate 的受控 ask **没有保存完整** `active count / deleted count / active IDs` 的 pre/post 快照。因此最终权威事实的准确表述是：

```
RAG_CORPUS_MUTATION_EVIDENCE_LEVEL = NO_OBSERVED_ROW_COUNT_OR_VECTOR_POINT_MUTATION
```

即「在受控 Frontend→RAG ask 中，`kb_document`/`kb_chunk`/`kb_vector_record` 行数均保持不变，Qdrant point counts 保持不变；未观察到 corpus / vector mutation」。

**这不是** exhaustively row-hashed proof，也不是逐行证明整个 corpus 绝无任何字段变化。不要为了补证据再次调用 REAL ask。

---

## Controlled Reviewer Integration

- 经由 Vite proxy 读取冻结 Reviewer 的 **既有 task 9**：issues（HTTP 200, count=0）/ report（HTTP 200, JSON `markdownContent`）/ raw Markdown（HTTP 200, `text/markdown`）。
- 纯只读集成；**未创建**任何新的 Reviewer task。
- `REVIEWER_DATABASE_WRITE_EXECUTED=NO`。

---

## Boundaries（能力边界）

- 无浏览器自动化（未安装 Playwright / Cypress / Puppeteer；无自动化端到端测试套件）。
- 无新建 Reviewer task（Frontend 未在本轮创建真实评审任务）。
- 前端不持有任何 REAL 凭证（API key / DB 密码均在后端 / Keychain）。
- 无直接数据库访问。
- 非生产级 SaaS（无登录 / RBAC / 公网部署 / 生产流量与负载验证）。
- 无 SSE 流式输出。
- RAG「精度」与「全面浏览器 E2E」**未经前端验证**。
