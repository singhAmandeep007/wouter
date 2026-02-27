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

## Project structure (important parts)

- `src/App.tsx`: top-level lazy-loaded module mounts
- `src/app/AppLayout.tsx`: navbar/sidebar/main shell
- `src/modules/dashboard/*`: dashboard module + routes
- `src/modules/catalog/*`: catalog module-owned routes
- `src/modules/settings/*`: settings module-owned routes
- `src/modules/settings/orders/OrdersSubRouter.tsx`: deeply nested sub-routing
- `src/modules/history/*`: history behavior demo route
- `src/mocks/*`: MSW worker setup, handlers, and mock data
- `src/shared/api/*`: typed API client and shared data types

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
- `/does-not-exist` (global not-found)
