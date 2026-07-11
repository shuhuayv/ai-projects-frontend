# ai-projects-frontend

**RAG 知识库问答** 与 **Code Reviewer 代码评审** 两个后端项目的统一前端控制台（Vite + React + TypeScript + MUI）。

> 本前端是「体验 / 联调壳」，目标是在浏览器里跑通两条业务流水线，并**如实呈现后端真实能力与边界**（检索层真实语义召回、Chat 模式随每次响应动态标注、Reviewer 3.Issues 卡片化），不夸大。

## 真实能力边界（诚实口径）

- **RAG 检索 = 真实联调**：后端检索层为真实智谱 `embedding-3`（1024 维）向量 + Qdrant，前端 `references` 为真实语义召回；Chat 生成层模式以**每次问答接口响应**为准（本地 Demo 含真实 Zhipu Chat，前端动态从 Mock 翻到「真实 AI」，不预探测、不固定宣称）。
- **Code Reviewer 真实 AI 覆盖有限**：仅评前 3 文件 / 最多少量 issues；前端已强制标注，绝不可表述为「完整 SaaS / 全量评审」。
- **本地 Demo**：无登录 / 权限 / 高并发承诺；后端 Key 经环境变量/Keychain 注入，前端不接触任何密钥。

## 技术栈

- Vite 5 + React 18 + TypeScript 5
- MUI 5（@mui/material + @mui/icons-material）+ Emotion
- axios + react-router-dom + react-markdown + **remark-gfm**（GFM 表格）
- framer-motion（动效）

## 目录结构

```
src/
├── main.tsx / App.tsx          # 入口 + 路由 + 全局诚实边界横幅
├── theme.ts                    # MUI 主题
├── api/
│   ├── http.ts                 # 响应拦截器（HTTP 2xx 判成功 + /report/markdown 裸返回特判）
│   ├── rag.ts                  # RAG 接口封装（ask 超时 210s）
│   ├── reviewer.ts             # Code Reviewer 接口封装
│   ├── chat.ts                 # Chat provider/mode 判断
│   └── types.ts                # ApiResponse<T> / PageResult<T> / 各 DTO
├── config/endpoints.ts         # 请求基址（开发期相对路径走 proxy）
├── components/
│   ├── HonestyBadge.tsx        # Mock / 真实 / 伪向量 / 仅前3文件 等诚实标注
│   ├── MarkdownReport.tsx      # GFM 表格 + 3.Issues 卡片 + PromptPreview
│   ├── PromptPreview.tsx       # Prompt 分段预览（长文本折叠/滚动）
│   └── StatusPanel.tsx         # 后端/依赖状态、错误提示
└── pages/
    ├── Dashboard.tsx           # 总览：两个项目入口 + 诚实边界说明
    ├── RagPipeline.tsx         # 上传 → parse → index
    ├── RagAsk.tsx              # ask + references + Prompt 预览 + 动态 Chat 标识
    ├── ReviewerPipeline.tsx    # 建库 → clone → scan → review
    └── ReviewerReport.tsx      # 3.Issues 卡片 + Markdown 报告 + 原始 Markdown 折叠
```

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
npm run dev            # 开发服务器，默认 http://localhost:5173
npm run preview        # 预览构建产物
```

## 开发期代理（CORS 规避）

`vite.config.ts` 已配置 dev proxy，前端用相对路径 `/api/*` 转发：

| 前端请求前缀 | 转发到 |
|---|---|
| `/api/rag` `/api/documents` `/api/search` `/api/embedding` | `http://localhost:8080`（RAG） |
| `/api/repos` `/api/reviews` | `http://localhost:8081`（Code Reviewer） |

## 三个页面与跑通全链路

1. 启动两个后端（`mvn spring-boot:run`，Mock 或真实模式均可）。
2. 本目录 `npm run dev`，打开 `http://localhost:5173`。
3. **总览 Dashboard**：两个项目入口 + 诚实边界说明。
4. **RAG 流水线**：Dashboard → RAG → 上传 TXT/PDF → parse → index → 「问答」页输入问题 → 看 answer + references + Prompt 预览；Chat 标识随响应在 Mock/真实间切换。
5. **Code Reviewer 流水线**：Dashboard → Code Reviewer → 填公开仓库（默认 `spring-petclinic`）→ clone → scan → review → 看 3.Issues 卡片与 Markdown 报告。

## 响应式与排版

- Markdown 报告支持 **GFM 表格**（横向滚动 + 表头吸顶）。
- Reviewer **3.Issues** 表格自动解析为**响应式卡片**（≥1080px 双列，窄屏单列），含风险等级色块（错误/警告/建议）、长文件路径换行。
- Prompt 预览分段排版，长文本可滚动，不撑破布局。
- 窄屏（≤720px）字号与内边距自适应。

## CI

GitHub Actions：`.github/workflows/ci.yml`（push/PR main，Node 22 LTS，npm 缓存，`npm ci` → `npm run typecheck` → `npm test`(存在时) → `npm run build`）。

## 测试

```bash
npm run typecheck      # 当前类型检查通过，build 通过
# 单元测试（Day 3 引入 vitest 后）：npm test
```

当前覆盖计划：Prompt 预览分段 / GFM 表格 / Issues 卡片 / 长路径换行 / 风险等级样式 / 空 issues / API 加载失败 / 响应式窄屏。

## 已知限制

- 真实 AI 评审覆盖有限（同后端边界），前端如实标注。
- 无登录 / 权限 / 个人中心；无 SSE 流式输出（当前用 loading 态）。
- 未做部署 / 公网发布；生产部署需反向代理或后端 CORS 配置。
- 不接触任何 API Key / 数据库密码（均由后端/Keychain 管理）。

## 面试亮点

- 真实联调壳：忠实反映后端 Mock/真实模式与检索真实度。
- GFM + Issues 卡片化 + Prompt 预览，工程化前端排版。
- 全局诚实边界横幅，演示时照实说，不夸大。

详见 `DELIVERY-RUN-INSTRUCTIONS.md` 与 `DELIVERY-QA-REPORT.md`。
