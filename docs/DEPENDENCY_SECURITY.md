# Dependency Security Closure

> Local internship portfolio frontend — this document is an honest dependency-security
> record, **not** a production deployment certification.

## Audit Snapshot

- Audit date: 2026-08-15
- Node: v22.22.2
- npm: 10.9.7
- Lockfile: package-lock.json (lockfileVersion 3), 387 packages

Audit totals (live `npm audit --json`):

| Scope | total | moderate | high | critical |
|-------|-------|----------|------|----------|
| full tree (pre-remediation) | 9 | 5 | 3 | 1 |
| production-only (`--omit=dev`, pre) | 2 | 2 | 0 | 0 |
| full tree (post-remediation) | 7 | 5 | 1 | 1 |
| production-only (`--omit=dev`, post) | 2 | 2 | 0 | 0 |

## Production Audit

`npm audit --omit=dev` after remediation: **0 high / 0 critical**. The only
production-tree findings are 2 moderate advisories on `react-router` /
`react-router-dom` (see below). This frontend runs in the browser; no
production dependency carries a high/critical advisory.

## High / Critical Inventory

| Package | Severity | Scope | Installed | Patched | Applicability | Resolution |
|---------|----------|-------|-----------|---------|---------------|------------|
| postcss | high | dev (transitive via vite) | 8.5.16 → 8.5.26 | >8.5.22 | dev tooling (build pipeline); not in browser runtime | **fixed** — lock-only refresh within vite's declared range `^8.4.43` (same major) |
| nanoid | high | dev (transitive via postcss) | 3.3.15 → 3.3.18 | >3.3.17 | dev tooling (build pipeline); not in browser runtime | **fixed** — lock-only refresh within postcss's declared range `^3.3.12` (same major) |
| vite | high | dev (direct) | 5.4.21 | 8.2.1 (major) | dev server / build tooling only; vulnerable path (Windows alternate-path `server.fs.deny` bypass) not reachable on the macOS dev setup used here; not part of the production browser bundle | **retained** — patched version requires major upgrade (vite 5 → 8), which is outside this Gate's minimal-remediation scope |
| vitest | critical | dev (direct) | 2.1.9 | 4.1.10 (major) | dev test runner only; the critical advisory requires the Vitest **UI server** (`--ui`), which is not enabled or used (scripts use `vitest run`; no UI config); not part of the production bundle | **retained** — patched version requires major upgrade (vitest 2 → 4), outside minimal-remediation scope |

### Moderate (aggregated)

- `@vitest/mocker`, `esbuild`, `vite-node` — dev tooling, transitive under
  vitest/vite; patched versions require the same major upgrades as vite/vitest.
  Retained for the same reason; development-only.
- `react-router` / `react-router-dom` — **production** tree, moderate: open-redirect
  and SSR-hydration `deserializeErrors()` constructor-injection advisories.
  This project is client-side only (no SSR), so the hydration advisory is not
  applicable; the open-redirect is a moderate client-side concern in a non-deployed
  portfolio app. `fixAvailable` resolves via a major react-router line (6.x → 7.x),
  which is outside minimal-remediation scope. Documented, not auto-upgraded.

## Remediation

What was changed (this Gate):

- `package-lock.json` — lock-only refresh of two dev-transitive packages:
  - `nanoid` 3.3.15 → 3.3.18
  - `postcss` 8.5.16 → 8.5.26
- `package.json` — **unchanged** (both fixes fit the already-declared ranges).

Method: `npm update nanoid postcss --package-lock-only` (minimal lock refresh,
no `--force`, no major upgrade, no dependency-tree rewrite). Verified with
`git diff` — only the two packages' version/resolved/integrity entries (and
postcss's own `nanoid` range spec, normalized `^3.3.12` → `^3.3.17`).

Why the remaining high/critical were **not** upgraded: both require a breaking
**major** upgrade (vite 5 → 8, vitest 2 → 4) that would force a toolchain
migration far beyond a dependency-security reconciliation. Per Gate policy,
breaking-major upgrades are deferred to Master AI; the dev-only nature and the
non-reachability of the vulnerable behaviors (Windows-only dev-server path;
unused Vitest UI server) support a documented retained caveat instead.

## Remaining Caveats

- 1 dev-only **high** (`vite`) and 1 dev-only **critical** (`vitest`), both
  only fixable via breaking major upgrades; retained and documented.
- 3 dev-only **moderate** (`@vitest/mocker`, `esbuild`, `vite-node`) under the
  same major-upgrade path; retained.
- 2 production **moderate** (`react-router`, `react-router-dom`); client-side
  only project (no SSR), non-deployed portfolio app; retained.
- Build chunk-size warning (~778.90 kB) is classified
  `NONBLOCKING_FRONTEND_TECH_DEBT` — not addressed here.

## Boundary

This is a **local internship portfolio frontend**. No production deployment,
no production users, no load/SSR environment. The dependency audit here is a
honest classification + minimal safe remediation record for portfolio review,
not a certification of production security.
