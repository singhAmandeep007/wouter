# Wouter E-Commerce Routing Demo

Simple Vite + React + TypeScript app focused on routing architecture with Wouter.

## What this demo covers

- App shell with navbar, sidebar, and main content
- Modular route ownership, nested/deep routes, default + not-found routes, declarative redirects
- Lazy loading of route modules and module CSS chunks; manual chunk splitting (chart.js lazy)
- **OpenAPI-first data layer**: `openapi.yaml` → generated types **and** zod validators →
  typed client → per-resource services/queries/hooks on TanStack Query
- **Runtime response validation** at every boundary; one normalized `ApiError`
- **Global notifications** (toasts) driven by the query/mutation caches
- **Error boundaries** (route + root) with chunk-load recovery
- **Shared UI components + CSS Modules** (no global shared classes)
- **Relational mock backend** with `@mswjs/data` + runtime fault injection for tests
- **Full test pyramid**: Vitest (unit/component) + Playwright (e2e), incl. error/empty paths

## Tech stack

- Vite + React + TypeScript
- Wouter (routing)
- TanStack Query + openapi-fetch + zod (data layer)
- MSW + @mswjs/data (mock backend)
- Vitest + Testing Library + Playwright (tests)

## Full documentation

- [docs/architecture/README.md](docs/architecture/README.md) - **architecture deep-dives with mermaid diagrams**
- [docs/README.md](docs/README.md) - complete documentation index
- [docs/optimization-foundations/README.md](docs/optimization-foundations/README.md) - fundamentals-first optimization learning path
- [docs/optimization-foundations/03-splitting-and-chunking-strategies.md](docs/optimization-foundations/03-splitting-and-chunking-strategies.md) - current chunk pattern, logic, and trade-offs
- [docs/routing-and-architecture.md](docs/routing-and-architecture.md) - module routing, lazy loading, and active-link behavior
- [docs/ci-jenkins-runbook.md](docs/ci-jenkins-runbook.md) - Jenkins setup, Node parity, and troubleshooting
- [docs/implementation-differences.md](docs/implementation-differences.md) - baseline vs final delivery summary
- [docs/frontend-optimization-guide.md](docs/frontend-optimization-guide.md) - optimization concepts and bundle strategy

## Run

```bash
npm install
npm run dev
```

Open the dev URL shown in terminal (typically `http://localhost:5173`).

## Build and lint

```bash
npm run build
npm run lint
```

## Preview with MSW mocks

```bash
npm run build:mock
npm run preview:mock
```

This builds with `VITE_ENABLE_MSW=true` and serves the production build through `vite preview` while keeping mock APIs active.

## Bundle analysis

```bash
npm run analyze
```

This generates `dist/bundle-report.html` using Rollup Visualizer.

## Jenkins pipeline

This repo now includes a ready-to-use `Jenkinsfile` with stages:

1. Install (`npm ci` + Playwright browser)
2. Lint (`npm run lint`)
3. Build + Analyze (`npm run analyze`)
4. Bundle Budget Gate (`npm run budget:bundle`)
5. E2E (`npm run test:e2e:ci`)

Generated CI artifacts:

- `dist/bundle-report.html`
- `dist/bundle-budget-report.json`
- `playwright-report/*`
- `test-results/e2e-junit.xml`

## Project structure (important parts)

- `src/App.tsx`: top-level lazy-loaded module mounts
- `src/app/AppLayout.tsx`: navbar/sidebar/main shell
- `src/modules/dashboard/*`: dashboard module + routes
- `src/modules/catalog/*`: catalog module-owned routes
- `src/modules/settings/*`: settings module-owned routes
- `src/modules/settings/orders/OrdersSubRouter.tsx`: deeply nested sub-routing
- `src/modules/history/*`: history behavior demo route
- `src/modules/enterprise/*`: enterprise module with analytics/integrations/contracts/workflow
- `src/mocks/*`: MSW worker setup, handlers, and mock data
- `src/shared/api/*`: typed API client and shared data types
- `docs/frontend-optimization-guide.md`: architecture, diagrams, and optimization best practices

## Route examples

- `/dashboard`
- `/catalog`
- `/catalog/category/phones`
- `/catalog/product/p-100`
- `/settings`
- `/settings/profile`
- `/settings/orders`
- `/settings/orders/o-5001`
- `/settings/orders/o-5001/items/oi-1`
- `/settings/orders/live`
- `/history`
- `/enterprise`
- `/enterprise/dashboard`
- `/enterprise/analytics`
- `/enterprise/integrations`
- `/enterprise/contracts`
- `/enterprise/workflow`
- `/does-not-exist` (global not-found)
