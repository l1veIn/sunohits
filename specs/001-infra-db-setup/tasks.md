---
description: "Task list for Infrastructure & Database Setup"
---

# Tasks: Infrastructure & Database Setup

**Input**: Design documents from `/specs/001-infra-db-setup/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md
**Tests**: Included as requested by Constitution II (Testing Standards).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Install testing dependencies (Jest, ts-jest, types)
- [x] T002 [P] Install utility dependencies (md5)
- [x] T003 Configure Jest for TypeScript and Next.js in `jest.config.ts` and `tsconfig.jest.json` (if needed)
- [x] T004 Create `sql/` directory for schema scripts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Verify `.env.local` contains Supabase credentials (manual check guide)
- [x] T006 [P] Verify/Create `lib/supabase/client.ts` for client-side Supabase client
- [x] T007 [P] Verify/Create `lib/supabase/server.ts` for server-side Supabase client
- [x] T008 [P] Create `lib/supabase/types.ts` for Typescript interfaces mirroring the DB schema

**Checkpoint**: Foundation ready - DB clients configured, environment checked.

---

## Phase 3: User Story 1 - Database Schema Initialization (Priority: P1)

**Goal**: Initialize Supabase database with required tables and views.

**Independent Test**: Execute SQL and verify table existence in Supabase dashboard.

### Implementation for User Story 1

- [x] T009 [US1] Create `sql/001_init_schema.sql` with `songs` table definition
- [x] T010 [US1] Append `daily_stats` table definition to `sql/001_init_schema.sql`
- [x] T011 [US1] Append `daily_trending_songs` view definition to `sql/001_init_schema.sql`
- [x] T012 [US1] Append index creation commands to `sql/001_init_schema.sql`
- [x] T013 [US1] (Manual) Execute `sql/001_init_schema.sql` in Supabase SQL Editor
- [x] T014 [US1] Create a script `scripts/verify-schema.ts` to programmatically check table existence (optional but recommended for CI)

**Checkpoint**: Database tables and views exist.

---

## Phase 4: User Story 2 - Core Utility Implementation (Priority: P1)

**Goal**: Implement WBI signing logic for Bilibili API interaction.

**Independent Test**: Unit tests for `wbi.ts` pass, producing correct signatures.

### Tests for User Story 2

- [x] T015 [P] [US2] Create unit test `tests/unit/wbi.test.ts` with expected input/output samples for WBI signing

### Implementation for User Story 2

- [x] T016 [US2] Create `lib/bili/wbi.ts` shell
- [x] T017 [US2] Implement `getMixinKey` logic in `lib/bili/wbi.ts` (parameter mixing)
- [x] T018 [US2] Implement `encWbi` main function in `lib/bili/wbi.ts` (sorting and hashing)
- [x] T019 [US2] Add helper types/interfaces for WBI parameters in `lib/bili/wbi.ts`

**Checkpoint**: WBI utility works and passes unit tests.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and final validation

- [x] T020 Run `npm test` to verify all new tests pass
- [x] T021 Check `lib/supabase/types.ts` matches the final SQL schema
- [x] T022 Update `README.md` with setup instructions for new DB schema and testing commands

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (for types/utils).
- **User Story 1 (Phase 3)**: Independent of code, but typically done early to allow coding against DB.
- **User Story 2 (Phase 4)**: Depends on Setup (md5). Independent of US1.

### Parallel Opportunities
- US1 (DB) and US2 (WBI) are technically independent and can be done in parallel after Phase 2.
- Tasks marked [P] within phases.

## Implementation Strategy

1. **Setup**: Get the repo ready with test runners.
2. **Foundation**: Ensure Supabase clients are ready (so we can verify DB connection later if needed).
3. **Database (US1)**: Get the schema live so manual testing can happen anytime.
4. **WBI (US2)**: Implement complex logic with TDD (Write test T015, then implement T016-T019).
