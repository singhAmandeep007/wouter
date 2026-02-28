# Project Documentation

This folder documents the full implementation completed in this workspace: modular Wouter routing, lazy loading strategy, MSW mock APIs, enterprise optimization patterns, test coverage, and local Jenkins CI setup.

## Documentation map

- [Routing and Architecture](routing-and-architecture.md)
- [CI/Jenkins Runbook](ci-jenkins-runbook.md)
- [Implementation Differences](implementation-differences.md)
- [Frontend Optimization Guide](frontend-optimization-guide.md)
- [Optimization Foundations (Basics -> Advanced)](optimization-foundations/README.md)

## Quick start references

- App entry and route mounting: `src/App.tsx`
- App shell and navigation: `src/app/AppLayout.tsx`
- Active route matching helper: `src/shared/routing/ActiveLink.tsx`
- Mock APIs: `src/mocks/handlers.ts`, `src/mocks/data.ts`
- Pipeline: `Jenkinsfile`

## System overview

```mermaid
graph LR
  U[User Browser] --> R[React + Wouter App Shell]
  R --> M[Lazy Module Chunks]
  R --> A[Typed API Client]
  A --> S[MSW Mock Service Worker]
  C[Jenkins Pipeline] --> B[Build, Analyze, E2E]
  B --> O[Reports and Artifacts]
```

## Outcomes delivered

- Modular route ownership with nested/deep routes and redirects.
- Stable active-link logic for parent/child route edge-cases.
- Enterprise-style optimization examples with heavy dependency isolation.
- Playwright E2E coverage with CI-friendly reports.
- Jenkins pipeline for lint/build/budget/e2e with artifact publishing.
- Node version parity setup for local and Jenkins using `.nvmrc`.
