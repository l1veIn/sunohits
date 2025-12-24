# Research: Bilibili Protocol Layer

## Decisions

### Bilibili Key Management
**Decision**: Fetch keys (`img_key`, `sub_key`) from Bilibili API (`/x/web-interface/nav`) on each cold start of the crawl job, but cache them in-memory or DB for the duration of the run.
**Rationale**: Keys are rotated daily. Fetching once per crawl cycle (which happens daily or every few hours) ensures freshness without excessive API calls.
**Alternatives Considered**:
- Hardcoding: Fails when keys rotate.
- Fetching per request: Too much overhead and potential rate limiting.

### Concurrency Control
**Decision**: Use `p-limit` library to restrict concurrent page fetches to 3-5.
**Rationale**: Bilibili has strict rate limiting. Uncontrolled parallel fetching will trigger 412/403 errors. `p-limit` is lightweight and standard for Promise-based concurrency.
**Alternatives Considered**:
- Sequential loops: Too slow for 50 pages (would risk Vercel function timeout).
- `Promise.all` without limit: Will trigger rate limits immediately.

### Logging Strategy
**Decision**: "Simple Status Summary" (Option B).
**Rationale**: Store only the last run status in a `crawl_metadata` table. This avoids database bloat while providing sufficient observability for a personal project/cron job.
**Alternatives Considered**:
- Detailed logs: Overkill for MVP.
- Console logs only: Hard to check status without digging into provider logs.

### HTTP Client
**Decision**: Use native `fetch`.
**Rationale**: Next.js 15 / Node.js 18+ has robust native fetch. No need for `axios` unless interceptors are critical, which they aren't here (simple signing wrapper can handle headers).
**Alternatives Considered**:
- `axios`: Adds bundle size, native fetch is sufficient.

## Open Questions Resolved
- **Logging**: Settled on minimal table approach.
- **Dependencies**: Need to add `p-limit`.
