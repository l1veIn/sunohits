# Implementation Plan: Bilibili Protocol Layer

**Branch**: `002-bili-protocol-layer` | **Date**: 2025-12-24 | **Spec**: [specs/002-bili-protocol-layer/spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-bili-protocol-layer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements the core data ingestion engine for SunoHits. It involves securing Bilibili API access via WBI signing (with dynamic key rotation), crawling "SUNO V5" search results (50 pages), and upserting metadata into the database. A secure cron endpoint will trigger the ingestion process.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15)
**Primary Dependencies**: `axios` (or `fetch`), `@supabase/supabase-js`, `p-limit` (for concurrency control)
**Storage**: Supabase (PostgreSQL) - `songs`, `crawl_metadata` (new)
**Testing**: Jest (Unit tests for logic), Integration tests for API endpoints
**Target Platform**: Vercel (Serverless Functions / Cron Jobs)
**Project Type**: Web Application (Next.js App Router)
**Performance Goals**: Process 50 pages within 5 minutes (Vercel timeout limits).
**Constraints**: 
- Strict WBI signing required.
- Rate limiting to avoid IP bans.
- Secure cron execution via secret.
**Scale/Scope**: ~1000 songs per run.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: Strict TypeScript used.
- [x] **Testing**: Unit tests for crawl logic/key rotation. Integration tests for cron endpoint.
- [x] **UX**: N/A (Backend feature).
- [x] **Performance**: Concurrency control implemented (Constitution IV).
- [x] **Security**: Cron secret required; Keys managed securely.

## Project Structure

### Documentation (this feature)

```text
specs/002-bili-protocol-layer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
app/
└── api/
    └── crawl/
        └── route.ts     # Ingestion endpoint (Cron trigger)

lib/
├── bili/
│   ├── client.ts        # Bilibili API client (Search, Nav)
│   ├── types.ts         # Bilibili API types
│   └── wbi.ts           # WBI signing logic (Existing/Updated)
└── services/
    └── crawler.ts       # Core crawling logic (Page iteration, Concurrency)

sql/
└── 002_crawl_metadata.sql # Schema for crawl status
```

**Structure Decision**: Using `app/api/crawl/route.ts` for the endpoint to leverage Next.js App Router. Logic separated into `lib/services/crawler.ts` for testability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
