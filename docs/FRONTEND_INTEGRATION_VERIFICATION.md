# Frontend Integration Verification — Controlled Record

> 这是最终受控集成记录。本 Gate（Final Delivery）**未重新触发**任何 REAL ask 或 Reviewer 写操作；以下事实来自上一 Gate 已闭环的受控验证。

---

## Frontend Contract Tests

- 框架：Vitest（`vitest run`），共 **6 test files / 27 tests / 0 failed**。
- 覆盖三类关键契约：
  1. **API 路径契约（ApiContract）**：前端相对 `/api/rag|documents|search|embedding` → RAG(:8080)、`/api/repos|reviews` → Reviewer(:8081) 的代理路径正确。
  2. **Chat 模式标注（ChatModeBadge）**：`isRealChatProvider(provider, model)` 能正确把 zhipu/glm-4.5-air 标为 REAL，避免 Mock 误标为 REAL。
  3. **raw Markdown 端点特判（RawMarkdownErrorClient）**：`/report/markdown` 裸返回（`text/markdown`）与普通 JSON 响应走不同解析路径。
- 其余：MarkdownReport / PromptPreview 渲染、ResponsiveLayout 窄屏。

---

## RAG（Controlled One-Attempt Proxy Ask）

- 通道：Vite proxy → 冻结 RAG `localhost:8080` → `POST /api/rag/ask`。
- 尝试次数：**1**（exactly one，不直连 8080）。
- 结果元数据：HTTP 200 / apiCode 0 / provider=zhipu / model=glm-4.5-air / embeddingProvider=zhipu / embeddingModel=embedding-3 / embeddingDimensions=1024 / embeddingMode=REAL / fallbackUsed=false / referenceCount=5 / costMs=3746。
- 审计日志副作用：append-only `ai_call_log` +1（id=69，可归属本次 ask）。
- Corpus / Qdrant 观测：`kb_document`/`kb_chunk`/`kb_vector_record` 行数不变；Qdrant point counts 不变。

---

## Reviewer（Existing Task9 Read-Only）

- 通道：Vite proxy → 冻结 Reviewer。
- 读取对象：既有 **task 9** 的 issues（HTTP 200, count=0）/ report（HTTP 200, JSON `markdownContent`）/ raw Markdown（HTTP 200, `text/markdown`）。
- 性质：**只读**；未创建任何新的 Reviewer task；Reviewer 数据库零写。

---

## What This Does Not Prove（明确不证明）

- ❌ 不是浏览器自动化 E2E（Playwright / Cypress / Puppeteer 均未安装，无自动化端到端测试套件）。
- ❌ 不是通过 Frontend 完成「真实 Reviewer 全流程创建」——只读取了既有 task9。
- ❌ 不是生产性能验证（无并发 / 负载 / 生产流量测试）。
- ❌ 不是 RAG benchmark 重跑。
- ❌ 不是模型精度测量（RAG 精度未由前端验证）。
