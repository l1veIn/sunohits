# Research: UI & Player (Frontend)

## Decisions

### Virtualization Library
**Decision**: Use `react-virtuoso`.
**Rationale**: 
- Easier API for variable height items (though song rows are likely fixed).
- Good support for window scrolling (important for mobile).
- Smaller bundle size compared to `react-window` + `react-virtualized-auto-sizer` combo for responsive layouts.
**Alternatives Considered**:
- `@tanstack/react-virtual`: Powerful, but API is more low-level (hooks based). `react-virtuoso` components are faster to implement for standard lists.
- `react-window`: Classic choice, but often requires extra boilerplate for resizing.

### State Management
**Decision**: `zustand` with `persist` middleware.
**Rationale**: 
- Extremely lightweight.
- Built-in persistence (for Favorites).
- No boilerplate compared to Redux/Context.
**Alternatives Considered**:
- React Context: Good for theme, but can cause re-renders for frequent updates (like playback progress).
- Redux: Overkill for this scope.

### Audio Player
**Decision**: Native `<audio>` element wrapped in a custom React component + `useMediaSession` hook.
**Rationale**: 
- `xgplayer` is great but might be overkill if we just need audio. Native `<audio>` gives full control and is lighter.
- We need tight integration with `zustand` for global state (to show player bar across pages).
- Web Media Session API is easy to hook into native audio events.

## Open Questions Resolved
- **Virtualization**: `react-virtuoso` selected.
- **Favorites Storage**: `localStorage` via Zustand persist.
