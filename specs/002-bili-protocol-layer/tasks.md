---
description: "Task list for Bilibili Protocol Layer"
---

# Tasks: Bilibili Protocol Layer

**Input**: Design documents from `/specs/002-bili-protocol-layer/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md
**Tests**: Unit tests for logic, Integration tests for API.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies and project readiness.

- [x] T001 [P] Install `p-limit` for concurrency control

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and base client structures.

- [x] T002 Create `sql/002_crawl_metadata.sql` with `crawl_metadata` table definition
- [x] T003 (Manual) Execute `sql/002_crawl_metadata.sql` in Supabase SQL Editor
- [x] T004 [P] Create `lib/bili/types.ts` defining Bilibili API response interfaces (Search, Nav)
- [x] T005 [P] Create `lib/bili/client.ts` shell with fetch wrapper

---

## Phase 3: User Story 1 - Secure Search Integration (Priority: P1)

**Goal**: Implement secure, signed search requests to Bilibili.

**Independent Test**: Unit test verifying `getNav` fetches keys and `search` produces signed requests.

### Tests for User Story 1

- [x] T006 [P] [US1] Create unit test `tests/unit/bili-client.test.ts` mocking `fetch` to verify WBI signing integration

### Implementation for User Story 1

- [x] T007 [US1] Implement `getNav` in `lib/bili/client.ts` to fetch `img_key` and `sub_key`
- [x] T008 [US1] Implement `search` in `lib/bili/client.ts` using `encWbi` (from Phase 1 feature) to sign requests
- [x] T009 [US1] Add logic to `lib/bili/client.ts` to cache keys in-memory for the duration of the run (simple module-level var or class property)

---

## Phase 4: User Story 2 - Automated Music Ranking Ingestion (Priority: P1)

**Goal**: Crawl 50 pages and persist data.

**Independent Test**: Run crawler service logic (mocked DB) to verify page iteration and upsert calls.

### Tests for User Story 2

- [x] T010 [P] [US2] Create unit test `tests/unit/crawler.test.ts` verifying page loop and concurrency limit

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `lib/services/crawler.ts` shell
- [x] T012 [US2] Implement `crawlPage` in `lib/services/crawler.ts` (fetches one page, maps to `SongMetadata`)
- [x] T013 [US2] Implement `upsertSongs` in `lib/services/crawler.ts` (Supabase upsert logic)
- [x] T014 [US2] Implement main `crawl` function in `lib/services/crawler.ts` with `p-limit` (loop 1-50)
- [x] T015 [US2] Integrate `crawl_metadata` logging (start/success/fail updates) into `crawl` function

---

## Phase 5: User Story 3 - Secure Trigger Authorization (Priority: P2)

**Goal**: Secure cron endpoint.

**Independent Test**: Integration test calling `/api/crawl` with and without valid header.

### Implementation for User Story 3

- [x] T016 [US3] Create `app/api/crawl/route.ts` shell
- [x] T017 [US3] Implement Bearer token validation against `CRON_SECRET` env var in `app/api/crawl/route.ts`
- [x] T018 [US3] Connect `app/api/crawl/route.ts` to `lib/services/crawler.ts` (trigger the crawl)
- [x] T019 [US3] Implement timeout handling (e.g. return 202 Accepted if using background processing, or keep 200 OK if waiting - Vercel limit awareness)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and docs.

- [ ] T020 Run `npm test` to verify all logic
- [x] T021 Update `README.md` with Cron setup instructions
- [x] T022 Update `lib/supabase/types.ts` if `crawl_metadata` needs type support

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 & 2**: Prerequisites for all code.
- **Phase 3 (US1)**: Foundation for Phase 4 (Crawler needs Search Client).
- **Phase 4 (US2)**: Foundation for Phase 5 (Endpoint triggers Crawler).
- **Phase 5 (US3)**: Exposes functionality.

### Parallel Opportunities
- T004 (Types) and T005 (Client Shell) can be parallel.
- Tests (T006, T010) can be written before implementation.
- T012 (Single Page) and T013 (Upsert) are distinct logic blocks.

## Implementation Strategy
1. **Setup**: Install deps.
2. **Foundation**: DB Schema.
3. **Client**: Get `search` working with WBI.
4. **Service**: Build the loop and DB storage.
5. **API**: Expose it securely.
