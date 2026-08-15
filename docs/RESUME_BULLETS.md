# Resume Bullets — ai-projects-frontend

> 三版口径，措辞保守、可验证。不写 Playwright E2E / REAL Reviewer 创建 / 生产用户 / QPS / 高并发 / 完整 SaaS。

## A. Frontend

- Built a React 18 + TypeScript + Vite + MUI control console that integrates separate RAG and AI code-review backends through typed API clients and Vite proxy routing.
- Added contract regression coverage for backend endpoint paths, REAL-vs-Mock mode labeling, and raw Markdown response handling, reaching 27 passing Vitest tests across 6 files.
- Verified a controlled frontend-proxy REAL RAG request and a read-only Reviewer report flow while reconciling expected backend side effects and capability boundaries.

## B. Full-stack / AI Application

- Connected a unified frontend to two AI backends (RAG retrieval + AI code reviewer) via relative `/api` proxy paths, keeping the UI unaware of backend hosts.
- Implemented a unified `ApiResponse` unwrap layer and an `isRealChatProvider` guard so Mock and REAL (zhipu / glm-4.5-air) modes are labeled honestly in the UI.
- Verified a single controlled proxy REAL RAG ask (embedding-3 / 1024 / REAL, fallback false) and confirmed it produced only an append-only audit-log side effect.

## C. Engineering Reliability

- Introduced contract tests that pin Vite proxy routes and the raw-Markdown endpoint special-case, preventing silent integration breakage during refactors.
- Maintained a strict honest-boundary posture: no browser automation claims, no overstated RAG accuracy, no fabricated end-to-end coverage.
- Kept production source untouched end-to-end: the delivery added only documentation and pre-approved contract tests on top of a frozen baseline.
