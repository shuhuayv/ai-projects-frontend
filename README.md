# ai-projects-frontend

两个 AI 后端项目（**RAG 知识库问答** / **Code Reviewer 代码评审**）的统一 **Mock 可操作前端控制台**。

> 本前端是「体验 / 联调壳」，目标是在浏览器里跑通两条业务流水线，并**如实呈现能力与边界**，不夸大。

---

## 技术栈

- Vite 5 + React 18 + TypeScript 5
- MUI 5（@mui/material + @mui/icons-material）+ Emotion
- axios（HTTP 客户端）+ react-router-dom（路由）+ react-markdown（报告渲染）

## 目录结构

```
ai-projects-frontend/
├── vite.config.ts            # 开发期 dev proxy（见下）
├── package.json
├── src/
│   ├── main.tsx / App.tsx    # 入口 + 路由 + 全局诚实边界横幅
│   ├── theme.ts              # MUI 主题
│   ├── api/
│   │   ├── http.ts           # 响应拦截器：以 HTTP 2xx 判成功 + /report/markdown 裸返回特判
│   │   ├── rag.ts            # RAG 接口封装
│   │   ├── reviewer.ts       # Code Reviewer 接口封装
│   │   └── types.ts          # ApiResponse<T> / PageResult<T> / 各 DTO
│   ├── config/endpoints.ts   # 前端请求基址（开发期用相对路径，走 proxy）
│   ├── components/
│   │   ├── HonestyBadge.tsx  # Mock / 真实 / 伪向量 / 仅前3文件 等诚实标注
│   │   ├── StepWizard.tsx    # 多步流水线引导
│   │   ├── MarkdownReport.tsx
│   │   └── StatusPanel.tsx   # 后端/依赖状态、错误提示
│   └── pages/
│       ├── Dashboard.tsx          # 总览：两个项目入口 + 诚实边界说明
│       ├── RagPipeline.tsx        # 上传 → parse → index
│       ├── RagAsk.tsx             # ask + references 展示
│       ├── ReviewerPipeline.tsx   # 建库 → clone → scan → review
│       └── ReviewerReport.tsx     # issues 表格 + Markdown 报告 + 原始 Markdown 折叠
```

## 环境要求

- Node.js ≥ 18（本交付在 Node 22.22.2 下验证通过）
- 两个后端需在本地以 **Mock 模式** 启动（详见后端 `patches/README.md`）：
  - `ai-knowledge-rag` → `http://localhost:8080`
  - `ai-code-reviewer` → `http://localhost:8081`

## 常用命令

```bash
# 1. 安装依赖
npm install

# 2. 类型检查（tsc -b --noEmit）
npm run typecheck

# 3. 生产构建（tsc -b && vite build，产物在 dist/）
npm run build

# 4. 本地开发（默认 http://localhost:5173）
npm run dev

# 5. 预览构建产物
npm run preview
```

## 开发期代理（CORS 规避，无需后端改 CORS 也能联调）

`vite.config.ts` 已配置 dev proxy，前端统一用相对路径 `/api/*` 发起请求，Vite 按前缀转发：

| 前端请求前缀 | 转发到 |
|---|---|
| `/api/rag` `/api/documents` `/api/search` | `http://localhost:8080`（RAG） |
| `/api/repos` `/api/reviews` | `http://localhost:8081`（Code Reviewer） |

> 生产部署仍需反向代理 / Nginx 或后端 CorsConfig（见 `patches/`）。

## 跑通全链路（Mock 模式）

1. 按 `patches/README.md` 准备好两个后端并 `mvn spring-boot:run`（默认即 Mock 模式）。
2. 本目录执行 `npm run dev`，打开 `http://localhost:5173`。
3. **RAG 流水线**：Dashboard → RAG → 上传 TXT/PDF → parse → index → 切到「问答」页输入问题 → 看 answer + references。
4. **Code Reviewer 流水线**：Dashboard → Code Reviewer → 填公开仓库（默认预填 `spring-petclinic`）→ clone → scan → review → 看 issues 表格与 Markdown 报告。

## Mock 模式 vs 真实 AI 模式（仅标注，不强求每次都发现问题）

- 后端设 `AI_MOCK_ENABLED=false` + `ZHIPU_API_KEY` 即切换真实智谱。
- 前端 `HonestyBadge` 会据后端返回（RAG 的 `model`、Code Reviewer 补丁后的 `mode` 字段）自动从「Mock」翻到「真实 AI」。
- **真实 AI 评审当前仅评审有限文件（默认前 3 个核心文件）、最多少量 issues**，UI 已强制标注，绝不可表述为「完整 SaaS / 全量评审」。

## 诚实边界（UI 已全局强制呈现，演示时照实说）

- **RAG 检索是演示性伪向量**：Embedding 仍是 Mock（SHA-256 哈希伪向量），`references` 非真实语义召回。Chat 已支持真实智谱，但检索内核未接真实 Embedding。
- **Code Reviewer 真实 AI 覆盖有限**：仅评前 3 文件 / 最多少量 issues；不是商业级 SaaS。
- **本地 Demo**：无登录 / 无权限 / 无高并发承诺。

## 本轮未做（明确范围）

- ❌ 登录 / 权限 / 个人中心
- ❌ SSE / 流式输出（当前用 loading 态）
- ❌ 部署 / 公网发布
- ❌ 私有仓库凭证 / clone 私有库
- ❌ 真实 Embedding 接入（仅标注，未实现）
- ❌ 后端 `.git` 操作（补丁由你本地应用、提交）

详见 `DELIVERY-RUN-INSTRUCTIONS.md` 与 `DELIVERY-QA-REPORT.md`。
