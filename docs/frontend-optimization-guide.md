# Modern Frontend Optimization Guide (Enterprise Scale)

This project now includes enterprise-like complexity to demonstrate modern optimization patterns under real constraints: heavier dependencies, module-level routes, dynamic imports, chunk strategy, and API mocking.

## What was added to simulate a large business frontend

- Heavy runtime libraries: `chart.js`, `lodash-es`, `date-fns`, `zod`, `axios`
- Added `@xyflow/react` (React Flow) used in two different feature areas
- New enterprise module with nested routes and default redirect:
  - `/enterprise` → `/enterprise/dashboard`
  - `/enterprise/analytics` (chart rendering via dynamic import)
  - `/enterprise/integrations` (dynamic `axios` loading)
  - `/enterprise/contracts` (runtime schema validation using `zod`)
  - `/enterprise/workflow` (React Flow graph)
- New settings live-order flow route:
  - `/settings/orders/live` (React Flow graph)
- Additional mock APIs and larger data shapes in MSW
- Vite manual chunking strategy and optional bundle visualizer

## Optimization layers (how they work together)

### 1) Route-level code splitting (React + Wouter)

At app startup, only the shell + current route module load. Other modules remain separate chunks until navigation.

### 2) In-module dynamic imports

Even inside a route chunk, heavy features can be split further:

- `chart.js` loads only when `/enterprise/analytics` is opened
- `axios` loads only when `/enterprise/integrations` is opened

This avoids paying for heavy dependencies globally.

### 3) Bundler chunking (Vite/Rollup `manualChunks`)

`vite.config.ts` groups dependencies by concern:

- `vendor-core` (React + Wouter)
- `vendor-flow` (`@xyflow/react` ecosystem and graph libs)
- `vendor-analytics` (chart/date/lodash/zod/axios)

Route modules are **not** manually grouped into one mega module chunk now. They are emitted as independent route chunks by default splitting, which keeps route boundaries cleaner.

This improves long-term browser caching and reduces invalidation blast radius.

### 4) Asset + CSS chunking

Each lazy module imports its own CSS file. Vite emits module CSS chunks that load with the corresponding module JS.

## Under the hood: load lifecycle

```mermaid
sequenceDiagram
  participant B as Browser
  participant V as Vite Bundle
  participant R as React/Wouter
  participant M as Module Chunk
  participant A as API (MSW)

  B->>V: GET / (index + entry)
  V-->>B: app shell + vendor-core
  B->>R: Mount app
  R->>R: Match route (/dashboard or redirect)
  R->>M: Import route module chunk
  M-->>R: Module JS + module CSS
  R->>A: Fetch API data
  A-->>R: Mock JSON payload
  R-->>B: Render route UI
```

## Under the hood: chunk graph (simplified)

```mermaid
graph TD
  A[index.html] --> B[entry chunk]
  B --> C[vendor-core]
  B --> D[dashboard route chunk]
  B --> E[catalog route chunk]
  B --> F[settings route chunk]
  B --> G[admin route chunk]
  B --> H[enterprise route chunk]

  F --> I[orders sub-router chunk]
  F --> J[vendor-flow]
  H --> J[vendor-flow]
  H --> K[vendor-analytics]
  J --> L[vendor-flow.css]
```

## Why this chunk pattern (current logic)

1. Keep framework runtime stable in `vendor-core` for high cache reuse.
2. Keep graph/flow stack in `vendor-flow` because it is heavy and used by multiple but not all modules.
3. Keep analytics/data-heavy libs in `vendor-analytics` because they are mostly enterprise-oriented.
4. Let route modules split naturally, instead of forcing all module code into a single manual chunk.

## Browser behavior for shared vendor chunks

```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Preview Server

  U->>B: Open /settings/orders/live
  B->>S: Request settings route chunk
  B->>S: Request vendor-flow chunk
  S-->>B: 200 settings + 200 vendor-flow

  U->>B: Navigate to /enterprise/workflow
  B->>S: Request enterprise route chunk
  B->>S: vendor-flow already cached
  S-->>B: 200 enterprise only
```

Result: the shared vendor chunk is downloaded once per version/hash and reused across routes.

## Example: why this matters in large apps

Without splitting, users download every module + heavy dependency on first load.

With layered splitting:

- Initial route gets faster time-to-interactive
- Feature teams can own module bundles independently
- Cache hit rates improve for stable vendor chunks
- Heavy libraries are paid only when needed

## Practical best practices

- Keep route modules coarse, feature modules fine.
- Move rarely-used heavy libs behind dynamic imports.
- Use `manualChunks` intentionally; avoid over-fragmentation.
- Keep shared critical path small (shell, navigation, auth, route matcher).
- Validate API contracts at boundaries (`zod`) but avoid validating large payloads repeatedly.
- Use stable test IDs for route/component-level performance and correctness checks.
- Analyze output regularly:
  - `npm run build`
  - `npm run analyze` and inspect `dist/bundle-report.html`

## Common anti-patterns

- Importing analytics/charting libs at app root.
- Huge shared utility barrel that drags everything into initial chunk.
- Too many tiny chunks causing request overhead.
- No cache strategy (frequent invalidation of all vendor code).
- Route components that trigger duplicate data fetching on every render.

## Suggested next experiments

1. Add prefetching on sidebar hover for likely next routes.
2. Add runtime performance marks around route transitions.
3. Add Web Vitals reporting and correlate with chunk changes.
4. Introduce service-worker caching policies for static chunks.
5. Compare bundle report before/after each optimization.
