# Implementation Plan: Infrastructure & Database Setup

**Branch**: `001-infra-db-setup` | **Date**: 2025-12-24 | **Spec**: [specs/001-infra-db-setup/spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-infra-db-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes the foundational infrastructure for SunoHits. It involves initializing the PostgreSQL database schema on Supabase (tables for songs and daily stats, plus a trending view) and implementing core utility libraries for Supabase client initialization and Bilibili WBI API signing. This sets the stage for data ingestion and the frontend application.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr` (for auth/data), `md5` (likely needed for WBI, will verify)
**Storage**: Supabase (PostgreSQL)
**Testing**: Vitest (Standard for Vite/Next.js modern stacks) or Jest. *NEEDS CLARIFICATION: Preferred test runner not in package.json.*
**Target Platform**: Vercel (Serverless/Edge Functions compatible)
**Project Type**: Web Application (Next.js App Router)
**Performance Goals**: Efficient DB indexing for trending queries.
**Constraints**: All secrets in `process.env`; WBI keys must be dynamic.
**Scale/Scope**: Initial schema for MVP; Utilities used project-wide.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: TypeScript strict mode enabled (tsconfig.json).
- [x] **Testing**: Plan includes unit tests for WBI and connection verification (Constitution II).
- [x] **UX**: N/A for this backend/infra feature.
- [x] **Performance**: DB View used for expensive calculation (Constitution IV).
- [x] **Security**: Secrets via `process.env` (Constitution Tech Constraints).

## Project Structure

### Documentation (this feature)

```text
specs/001-infra-db-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
lib/
├── supabase/
│   ├── client.ts        # Client-side Supabase client (existing/verify)
│   ├── server.ts        # Server-side Supabase client (existing/verify)
│   └── types.ts         # Database types
└── bili/
    └── wbi.ts           # WBI signing logic

sql/                     # SQL scripts for manual execution/migration tracking
└── 001_init_schema.sql
```

**Structure Decision**: Utilizing `lib/` for shared utilities as per existing structure. Adding `sql/` directory to track schema changes manually since no full migration tool is configured yet (Supabase CLI usage implied but simple SQL file is safer for MVP start).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
