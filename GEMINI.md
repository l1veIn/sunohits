# sunohits Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-24

## Active Technologies
- TypeScript 5.x (Next.js 15) + `axios` (or `fetch`), `@supabase/supabase-js`, `p-limit` (for concurrency control) (002-bili-protocol-layer)
- Supabase (PostgreSQL) - `songs`, `crawl_metadata` (new) (002-bili-protocol-layer)
- TypeScript 5.x (Next.js 15) + `node-fetch` (native), `ReadableStream` (Web Streams API) (003-media-proxy-layer)
- N/A (Stateless proxy) (003-media-proxy-layer)
- TypeScript 5.x (Next.js 15 App Router) (004-ui-player)
- `localStorage` (for Favorites), Supabase (Read-only for Charts) (004-ui-player)

- TypeScript 5.x (Next.js 15) + `@supabase/supabase-js`, `@supabase/ssr` (for auth/data), `md5` (likely needed for WBI, will verify) (001-infra-db-setup)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (Next.js 15): Follow standard conventions

## Recent Changes
- 004-ui-player: Added TypeScript 5.x (Next.js 15 App Router)
- 003-media-proxy-layer: Added TypeScript 5.x (Next.js 15) + `node-fetch` (native), `ReadableStream` (Web Streams API)
- 002-bili-protocol-layer: Added TypeScript 5.x (Next.js 15) + `axios` (or `fetch`), `@supabase/supabase-js`, `p-limit` (for concurrency control)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
