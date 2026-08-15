# Demo Script — ai-projects-frontend

> 默认 **不重新触发 REAL ask**（不在 Demo 中再次调用 Zhipu）。如需现场 REAL ask，须单独受控授权，不是默认步骤。

## 时长与目标
- 2–4 分钟，聚焦「统一控制台 + 诚实边界 + 受控集成证据」。
- 使用既有数据 / 既有 Reviewer task 与已验证事实说明，避免任何新的后端写入。

## 流程

1. **Dashboard**
   - 打开 `localhost:5173`，展示两个项目入口（RAG / Code Reviewer）与全局诚实边界横幅。
   - 一句话定位：这是连接两个已冻结 AI 后端的统一前端控制台，不是生产 SaaS。

2. **RAG Pipeline 页面**
   - 走「上传 TXT/PDF → parse → index」流程（可用既有已索引数据，无需重新上传）。
   - 强调前端只发相对 `/api/rag/*`，由 Vite proxy 转发到 RAG(:8080)。

3. **RAG Ask 页面**
   - 说明 Ask 会拿 answer + references + Prompt 预览。
   - 指出 `HonestyBadge` 随每次响应在 Mock / 真实间标注。

4. **解释 REAL / Mock 徽标**
   - 讲解 `isRealChatProvider(zhipu, glm-4.5-air)` 为何不会把 Mock 误标为 REAL。
   - 引用已闭环事实：上一 Gate 已通过一次受控代理 REAL ask 验证 provider=zhipu / model=glm-4.5-air / embedding-3 / 1024 / REAL / fallback=false，且只产生 append-only `ai_call_log` +1。

5. **Reviewer Pipeline 页面**
   - 走「填公开仓库 → clone → scan → review」流程（可引用既有结果）。

6. **Reviewer Report 既有 task**
   - 打开既有 **task 9**：展示 issues（卡片化 3.Issues）/ report / raw Markdown。
   - 强调这是**只读**读取冻结 Reviewer 的既有历史，本轮未创建新 task。

7. **raw Markdown**
   - 展示 `/report/markdown` 裸 `text/markdown` 渲染，说明前端对此端点的特判处理。

8. **tests / CI**
   - 展示 `npm run test` → Vitest 6 files / 27 tests / 0 failed。
   - 说明 CI（`ci.yml`）：npm ci → npm test → npm run build。

9. **limitations**
   - 明确：无浏览器自动化 E2E（Playwright/Cypress 未装）、无登录/RBAC、无公网部署、RAG 精度与全面 E2E 未经前端验证、Reviewer 真实评审受后端 scope 限制。

## 如需现场 REAL ask（非默认）
- 必须单独、显式受控授权；确认后端处于真实智谱模式且有凭证。
- 仅允许 **一次** 代理 ask，演示后说明 append-only 审计副作用，不做第二次。
- 不属于默认 Demo 步骤；默认 Demo 只复用已验证事实。
