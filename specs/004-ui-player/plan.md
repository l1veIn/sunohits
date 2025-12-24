# Implementation Plan: UI & Player (Frontend)

**Branch**: `004-ui-player` | **Date**: 2025-12-24 | **Spec**: [specs/004-ui-player/spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ui-player/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements the frontend interface for SunoHits, replicating the Netease Cloud Music aesthetic. It includes a responsive 3-pane layout, a virtual-scrolling song list for charts, a local-storage-persisted favorites system, and a persistent audio player integrated with the Web Media Session API.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15 App Router)
**Primary Dependencies**: 
- UI: `shadcn/ui`, `lucide-react`, `tailwindcss`
- State: `zustand` (with persist middleware)
- Virtualization: `react-virtuoso` or `@tanstack/react-virtual` [NEEDS RESEARCH]
- Audio: Native `<audio>` element
**Storage**: `localStorage` (for Favorites), Supabase (Read-only for Charts)
**Testing**: `jest` + `react-testing-library` (Unit/Component tests)
**Target Platform**: Web (Desktop & Mobile)
**Project Type**: Web Application
**Performance Goals**: 60 FPS scrolling, <1s time to play.
**Constraints**: 
- `referrerPolicy="no-referrer"` for images.
- Responsive design adapting to mobile/desktop.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **UX Consistency**: Replicates Netease Cloud Music aesthetic (Constitution III).
- [x] **Performance**: Uses Virtual Scrolling and image optimization (Constitution IV).
- [x] **Code Quality**: Uses TypeScript and Shadcn/ui (Constitution I).
- [x] **Testing**: Component tests required (Constitution II).

## Project Structure

### Documentation (this feature)

```text
specs/004-ui-player/
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
├── (main)/              # Main layout group
│   ├── layout.tsx       # Sidebar + Content + Player Layout
│   ├── page.tsx         # Discovery/Charts Page
│   └── favorites/
│       └── page.tsx     # Favorites Page
components/
├── player/              # Player components
│   ├── player-bar.tsx
│   ├── progress-slider.tsx
│   └── volume-control.tsx
├── song-list/           # Song list components
│   ├── song-item.tsx
│   └── virtual-list.tsx
└── layout/              # Layout components
    └── sidebar.tsx
lib/
├── store/               # Zustand stores
│   ├── use-player-store.ts
│   └── use-favorites-store.ts
└── hooks/
    └── use-media-session.ts
```

**Structure Decision**: Using Next.js App Router Layouts for persistent player. Component directory split by domain (player, song-list, layout).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
