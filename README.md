# ai-projects-frontend

**RAG 知识库问答** 与 **Code Reviewer 代码评审** 两个后端项目的统一前端控制台（Vite + React + TypeScript + MUI）。

> 本前端是「体验 / 联调壳」，目标是在浏览器里跑通两条业务流水线，并**如实呈现后端真实能力与边界**，不夸大。它不是一个独立的后端，也不是生产级 SaaS，更不是 spring-ai-backend-template 的前端。

## 项目定位（Project Positioning）

- 这是一个 **Vite + React + TypeScript + MUI** 的统一前端控制台，连接 **ai-knowledge-rag** 与 **ai-code-reviewer** 两个后端。
- 它**不是** spring-ai-backend-template 的前端（后者不是本前端的第三个运行时后端，禁止新增第三后端入口）。
- 它**不是**生产级 SaaS（无登录 / RBAC / 公网部署 / 生产流量验证）。
- 前端只消费后端暴露的 API 契约；真实 AI 能力来自已冻结的后端，前端不持有任何密钥。

## 真实能力边界（诚实口径）

- **RAG 真实联调已受控验证**：通过 Vite proxy 对冻结 RAG（:8080）的 `/api/rag/ask` 完成了 **一次受控的 REAL 请求**（provider=zhipu, model=glm-4.5-air, embedding-3 / 1024 / REAL, fallback=false）；该次请求预期只产生 append-only 的 `ai_call_log` 副作用，`kb_document` / `kb_chunk` / `kb_vector_record` 行数与 Qdrant point 数均未观察到变化。**这不等于**「RAG 精度由前端验证」或「全面浏览器 E2E」。
- **Code Reviewer 真实 AI 覆盖有限**：仅评前 3 文件 / 最多少量 issues；前端已强制标注，绝不可表述为「完整 SaaS / 全量评审」。
- **Reviewer 只读集成已验证**：通过 Vite proxy 读取了冻结 Reviewer 的既有 task 9 的 issues / report / raw Markdown（read-only）；本前端**未在本轮创建任何 Reviewer task**。
- **本地 Demo 运行时**：无登录 / 权限 / 高并发承诺；后端 Key 经环境变量 / Keychain 注入，前端不接触任何密钥。

## 技术栈

- Vite 5 + React 18 + TypeScript 5
- MUI 5（@mui/material + @mui/icons-material）+ Emotion
- axios + react-router-dom + react-markdown + **remark-gfm**（GFM 表格）
- framer-motion（动效）
- Vitest（组件 + 契约回归测试）

## 目录结构

```
src/
├── main.tsx / App.tsx          # 入口 + 路由 + 全局诚实边界横幅
├── theme.ts                    # MUI 主题
├── api/
│   ├── http.ts                 # 响应拦截器（HTTP 2xx 判成功 + /report/markdown 裸返回特判）
│   ├── rag.ts                  # RAG 接口封装（ask 超时 210s）
│   ├── reviewer.ts             # Code Reviewer 接口封装
│   ├── chat.ts                 # Chat provider/mode 判断（isRealChatProvider）
│   └── types.ts                # ApiResponse<T> / PageResult<T> / 各 DTO
├── config/endpoints.ts         # 请求基址（开发期相对路径走 proxy）
├── components/
│   ├── HonestyBadge.tsx        # Mock / 真实 / 伪向量 / 仅前3文件 等诚实标注
│   ├── MarkdownReport.tsx      # GFM 表格 + 3.Issues 卡片；named export: PromptPreview
│   ├── ReferenceCard.tsx       # RAG references 卡片
│   ├── StatusPanel.tsx         # 后端/依赖状态、错误提示
│   └── ...（FeatureIcon / HeroPreview / Liquid* / PageTransition / StepWizard 等 UI 组件）
└── pages/
    ├── Dashboard.tsx           # 总览：两个项目入口 + 诚实边界说明
    ├── RagPipeline.tsx         # 上传 → parse → index
    ├── RagAsk.tsx              # ask + references + Prompt 预览 + 动态 Chat 标识
    ├── ReviewerPipeline.tsx     # 建库 → clone → scan → review
    └── ReviewerReport.tsx      # 3.Issues 卡片 + Markdown 报告 + 原始 Markdown 折叠
```

> 注：`PromptPreview` **不是**独立文件 `components/PromptPreview.tsx`，而是 `MarkdownReport.tsx` 的 named export。

## 环境要求

- Node.js ≥ 18（本交付在 Node 22.22.2 下验证通过）
- 两个后端可运行于 **Mock 模式或真实智谱模式**（真实模式需本机 Key）：
  - `ai-knowledge-rag` → `http://localhost:8080`
  - `ai-code-reviewer` → `http://localhost:8081`

## 常用命令

```bash
npm install            # 或 npm ci（可复现）
npm run typecheck      # tsc -b --noEmit
npm run build          # tsc -b && vite build，产物 dist/
npm run test           # vitest run
npm run dev            # 开发服务器，默认 http://localhost:5173
npm run preview        # 预览构建产物
```

## 开发期代理（CORS 规避）

`vite.config.ts` 已配置 dev proxy，前端用相对路径 `/api/*` 转发：

| 前端请求前缀 | 转发到 |
|---|---|
| `/api/rag` `/api/documents` `/api/search` `/api/embedding` | `http://localhost:8080`（RAG） |
| `/api/repos` `/api/reviews` | `http://localhost:8081`（Code Reviewer） |

## 五个主要页面与两条业务链路

1. 启动两个后端（`mvn spring-boot:run`，Mock 或真实模式均可）。
2. 本目录 `npm run dev`，打开 `http://localhost:5173`。
3. **总览 Dashboard**：两个项目入口 + 诚实边界说明。
4. **RAG 流水线**：Dashboard → RAG Pipeline（上传 TXT/PDF → parse → index）→ **RAG Ask**（输入问题 → 看 answer + references + Prompt 预览；Chat 标识随响应在 Mock / 真实间切换）。
5. **Code Reviewer 流水线**：Dashboard → Reviewer Pipeline（填公开仓库 → clone → scan → review）→ **Reviewer Report**（3.Issues 卡片 + Markdown 报告 + 原始 Markdown 折叠）。

## 响应式与排版

- Markdown 报告支持 **GFM 表格**（横向滚动 + 表头吸顶）。
- Reviewer **3.Issues** 表格自动解析为**响应式卡片**（≥1080px 双列，窄屏单列），含风险等级色块（错误 / 警告 / 建议）、长文件路径换行。
- Prompt 预览分段排版，长文本可滚动，不撑破布局。
- 窄屏（≤720px）字号与内边距自适应。

## Verified Integration（受控集成验证）

> 以下为**已完成的一次性受控验证**，不是持续 / 自动化 E2E。

### RAG（受控一次代理 REAL ask）

- 经由 Vite proxy → 冻结 RAG :8080 → `/api/rag/ask`，**仅 1 次** HTTP POST 尝试。
- provider=zhipu / model=glm-4.5-air；embedding-3 / 1024 / REAL；fallback=false。
- 预期副作用：仅 append-only `ai_call_log` +1（`kb_document` / `kb_chunk` / `kb_vector_record` 行数不变，Qdrant point 数不变）。
- **未证明**：RAG 精度 / 全面浏览器 E2E。

### Reviewer（既有 task 只读代理读取）

- 经由 Vite proxy 读取冻结 Reviewer 既有 **task 9** 的 issues（HTTP 200, count=0）/ report（HTTP 200, JSON `markdownContent`）/ raw Markdown（HTTP 200, `text/markdown`）。
- **未创建**任何新的 Reviewer task；纯只读集成。

## 测试

```bash
npm run typecheck      # PASS
npm run test           # Vitest：6 files / 27 tests / 0 failed
npm run build          # PASS
```

- 测试覆盖：API 路径契约（ApiContract）、Chat 模式 REAL/Mock 标注（ChatModeBadge）、raw Markdown 端点特判（RawMarkdownErrorClient）、MarkdownReport / PromptPreview 渲染、响应式窄屏（ResponsiveLayout）。
- 无浏览器自动化测试（未安装 Playwright / Cypress / Puppeteer）。

## CI

GitHub Actions：`.github/workflows/ci.yml`（push / PR 到 `main`，Node 22 LTS，npm 缓存）：

1. `npm ci`
2. `npm test`
3. `npm run build`（含 `tsc -b` 类型检查）

> 注：CI 未单独跑 `typecheck` 脚本，类型检查由 `build` 步骤中的 `tsc -b` 承担；本地可用 `npm run typecheck` 单独校验。

## 已知限制 / 能力边界

- 真实 AI 评审覆盖有限（同后端边界），前端如实标注。
- **无浏览器自动化 E2E**（未安装 Playwright / Cypress / Puppeteer；无自动化端到端测试套件）。
- 无登录 / 权限 / 个人中心；无 SSE 流式输出（当前用 loading 态）。
- 未做部署 / 公网发布；生产部署需反向代理或后端 CORS 配置。
- 不接触任何 API Key / 数据库密码（均由后端 / Keychain 管理）。
- 无公网部署 / 无生产流量 / 负载验证。
- Reviewer 真实评审仍受后端 file / issue scope 限制。

## 面试亮点

- 受控联调壳：忠实反映后端 Mock / 真实模式与检索真实度，并精确区分「受控一次代理 REAL 验证」与「全面 E2E / 精度验证」的边界。
- GFM + Issues 卡片化 + Prompt 预览，工程化前端排版。
- 全局诚实边界横幅 + `isRealChatProvider` 防 Mock 误标为 REAL；演示时照实说，不夸大。

## 文档

- `docs/FINAL_ENGINEERING_FACTS.md` — 最终工程事实（基线 / 验证 / 边界 / caveats）
- `docs/FRONTEND_INTEGRATION_VERIFICATION.md` — 受控集成验证记录
- `docs/INTERVIEW_FRONTEND_DESIGN.md` — 面试设计问答
- `docs/RESUME_BULLETS.md` — 简历 bullets（三版）
- `docs/INTERVIEW_NARRATIVE.md` — 面试叙述（30s / 90s / 3min）
- `docs/DEMO_SCRIPT.md` — Demo 脚本
