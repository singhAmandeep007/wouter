# Wouter E-Commerce Routing Demo

Simple Vite + React + TypeScript app focused on routing architecture with Wouter.

## What this demo covers

- App shell with navbar, sidebar, and main content
- Modular route ownership (routes are defined inside each module)
- Nested and deeply nested routes
- Default routes and module-level not-found routes
- Global not-found route
- Browser history navigation (back/forward demo)
- Lazy loading of route modules and module CSS chunks
- Enterprise-scale module with heavy dependencies and dynamic imports
- Manual chunk splitting strategy in Vite
- Mock API layer with realistic endpoints using MSW

## Tech stack

- Vite
- React + TypeScript
- Wouter
- MSW (Mock Service Worker)

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
- `src/modules/enterprise/*`: enterprise module with analytics/integrations/contracts
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
- `/history`
- `/enterprise`
- `/enterprise/dashboard`
- `/enterprise/analytics`
- `/enterprise/integrations`
- `/enterprise/contracts`
- `/does-not-exist` (global not-found)
