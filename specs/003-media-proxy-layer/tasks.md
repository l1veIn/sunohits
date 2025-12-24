---
description: "Task list for Media Proxy Layer"
---

# Tasks: Media Proxy Layer

**Input**: Design documents from `/specs/003-media-proxy-layer/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md
**Tests**: Unit tests for client logic, Integration tests for proxy endpoint.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies and type definitions.

- [x] T001 [P] Update `lib/bili/types.ts` to include `PlayUrlResponse` interface

---

## Phase 2: User Story 1 - Audio Stream Resolution (Priority: P1)

**Goal**: Resolve playable DASH audio URLs from Bilibili.

**Independent Test**: Unit test verifying `getPlayUrl` calls correct API with `fnval=16` and returns a URL.

### Tests for User Story 1

- [x] T002 [P] [US1] Create unit test `tests/unit/bili-playurl.test.ts` mocking `fetch` to verify `getPlayUrl` logic

### Implementation for User Story 1

- [x] T003 [US1] Implement `getPlayUrl` in `lib/bili/client.ts` to fetch DASH audio stream URL using WBI signing

---

## Phase 3: User Story 2 - Secure Audio Proxy (Priority: P1)

**Goal**: Proxy audio stream with correct headers.

**Independent Test**: Integration test calling `/api/play` and checking response headers and body stream.

### Implementation for User Story 2

- [x] T004 [P] [US2] Create `app/api/play/route.ts` shell
- [x] T005 [US2] Implement parameter validation (`bvid`, `cid`) in `app/api/play/route.ts`
- [x] T006 [US2] Integrate `BiliClient.getPlayUrl` in `app/api/play/route.ts` to resolve upstream URL
- [x] T007 [US2] Implement streaming logic in `app/api/play/route.ts`:
    - Fetch upstream with `Referer`
    - Forward `Range` header if present
    - Handle upstream status (200 vs 206)
    - Return `NextResponse` with stream and appropriate headers (`Content-Type`, `Content-Length`, `Content-Range`)

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation.

- [x] T008 Run `npm test` to verify client logic
- [x] T009 Manual verification: Test playback with `<audio>` tag locally

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1**: Prerequisite for Types.
- **Phase 2 (US1)**: Foundation for Phase 3 (Proxy needs resolved URL).
- **Phase 3 (US2)**: Core feature.

### Parallel Opportunities
- T002 (Test) and T001 (Types) can be parallel.
- T004 (Route Shell) can be done while T003 (Client Logic) is in progress (if interface agreed).

## Implementation Strategy
1. **Types**: Define response structure.
2. **Client**: Implement resolution logic with WBI.
3. **Proxy**: Build the streaming endpoint handling Range headers.
