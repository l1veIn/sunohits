# Research: Infrastructure & Database Setup

## Decisions

### Test Runner
**Decision**: Use **Jest** with `ts-jest` (or SWC via Next.js compiler).
**Rationale**: Industry standard for React/Next.js applications; extensive documentation; meets Constitution requirement for comprehensive testing.
**Alternatives Considered**:
- `Vitest`: Faster, but Jest is more "default" for Next.js documentation.
- `node --test`: Good for simple scripts, but lacks the ecosystem for React component testing later.

### Bilibili WBI Signing
**Decision**: Implement strict WBI signing algorithm in `lib/bili/wbi.ts`.
**Rationale**: Bilibili API requires this for specific endpoints (search, user info) to avoid 403s.
**Details**:
- Must implement `getMixinKey` (parameter mixing).
- Must fetch `img_key` and `sub_key` from `/x/web-interface/nav`.
- Keys are refreshed daily (or on failure), so caching strategy is needed (Phase 2, but logic should allow inputting keys).

### Database Schema Management
**Decision**: Use SQL files in `sql/` and manually execute via Supabase Dashboard (SQL Editor) for Phase 1.
**Rationale**: Simple startup. Full migration tool (Prisma/Supabase CLI) adds complexity not needed for just 2 tables in MVP Phase 1.
**Alternatives Considered**:
- `prisma migrate`: Adds heavy dependency.
- `supabase db push`: Requires local Docker setup which might be overkill for simple cloud-first start.

## Open Questions Resolved
- **Test Runner**: Jest selected.
- **Dependencies**: Need to add `jest`, `@types/jest`, `ts-node`, `md5` (for WBI).
