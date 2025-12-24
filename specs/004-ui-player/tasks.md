---
description: "Task list for UI & Player (Frontend)"
---

# Tasks: UI & Player (Frontend)

**Input**: Design documents from `/specs/004-ui-player/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md
**Tests**: Unit tests for stores, manual verification for UI.

## Phase 1: Setup (Dependencies & State)

**Purpose**: Initialize frontend state management and dependencies.

- [x] T001 [P] Install dependencies: `zustand` and `react-virtuoso`
- [x] T002 [P] Create `lib/store/use-player-store.ts` implementing `PlayerState` with Zustand
- [x] T003 [P] Create `lib/store/use-favorites-store.ts` implementing `FavoritesState` with Zustand persist middleware

---

## Phase 2: User Story 1 - Music Browsing and Layout (Priority: P1)

**Goal**: Implement responsive Netease-style layout.

**Independent Test**: Verify Sidebar navigation and SongList rendering on desktop and mobile.

### Implementation for User Story 1

- [x] T004 [US1] Create `components/layout/sidebar.tsx` with navigation links (Discovery, Charts, Favorites)
- [x] T005 [US1] Update `app/layout.tsx` (or `app/(main)/layout.tsx`) to implement the 3-pane responsive layout (Sidebar, Main Content, Player Area)
- [x] T006 [US1] Create `components/song-list/song-item.tsx` component for individual song rows
- [x] T007 [US1] Implement `app/page.tsx` (Charts) fetching data from `daily_trending_songs` view via Supabase client
- [x] T008 [US1] Implement `app/favorites/page.tsx` rendering saved songs from `useFavoritesStore`

---

## Phase 3: User Story 2 - Audio Playback and Control (Priority: P1)

**Goal**: Functional audio player.

**Independent Test**: Verify playback starts when clicking a song, and controls (play/pause/volume) work.

### Implementation for User Story 2

- [x] T009 [US2] Create `components/player/volume-control.tsx` and `components/player/progress-slider.tsx` using shadcn/ui Slider
- [x] T010 [US2] Create `components/player/player-bar.tsx` connecting to `usePlayerStore` and rendering controls
- [x] T011 [US2] Implement audio logic in `components/player/player-bar.tsx` (or a dedicated `AudioPlayer` component) using native `<audio>` tag and `/api/play` source
- [x] T012 [US2] Connect `SongItem` click events to `usePlayerStore.play()` action

---

## Phase 4: User Story 3 - Lock Screen and Background Control (Priority: P2)

**Goal**: System media controls integration.

**Independent Test**: Verify lock screen controls on mobile device.

### Implementation for User Story 3

- [x] T013 [P] [US3] Create `lib/hooks/use-media-session.ts` hook wrapping Media Session API
- [x] T014 [US3] Integrate `useMediaSession` into `PlayerBar` component to sync metadata and handle action handlers (play, pause, next, prev)

---

## Phase 5: User Story 4 - Smooth Infinite Browsing (Priority: P3)

**Goal**: Virtual scrolling for performance.

**Independent Test**: Scroll through large list without lag.

### Implementation for User Story 4

- [x] T015 [US4] Create `components/song-list/virtual-list.tsx` using `react-virtuoso` to wrap `SongItem` components
- [x] T016 [US4] Replace standard list in `app/page.tsx` with `VirtualList`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and optimization.

- [x] T017 Verify `referrerPolicy="no-referrer"` is applied to all song cover images (`SongItem` and `PlayerBar`)
- [ ] T018 Manual verification: Test full responsive behavior on mobile and desktop viewports

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1**: Prerequisite for all UI components relying on state.
- **Phase 2 (US1)**: Foundation for layout.
- **Phase 3 (US2)**: Needs Layout (PlayerBar placeholder) and Store.
- **Phase 4 (US3)**: Enhances PlayerBar (Phase 3).
- **Phase 5 (US4)**: Enhances SongList (Phase 2).

### Parallel Opportunities
- T002/T003 (Stores) can be done in parallel.
- T004 (Sidebar) and T009 (Player UI components) can be done in parallel.
- T013 (Media Session Hook) can be written independently of the UI.

## Implementation Strategy
1. **State**: Build the brain (Zustand).
2. **Skeleton**: Build the body (Layout).
3. **Player**: Add the heart (Audio Logic).
4. **Features**: Add the muscle (Media Session, Virtual Scroll).