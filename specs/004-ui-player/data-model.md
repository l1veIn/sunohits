# Data Model: UI & Player (Frontend)

## Frontend Entities

### `Song`
Matches the DB schema but used in frontend context.
```typescript
interface Song {
  bvid: string
  title: string
  pic: string
  owner_name: string
  pubdate: number
  // Optional for UI logic
  duration?: number 
}
```

### `PlayerState` (Zustand Store)
```typescript
interface PlayerState {
  // State
  currentSong: Song | null
  isPlaying: boolean
  volume: number // 0-1
  progress: number // 0-1 or seconds? Seconds is better.
  duration: number // seconds
  playlist: Song[]
  currentIndex: number
  isSidebarOpen: boolean // Mobile sidebar toggle

  // Actions
  play: (song?: Song) => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  setPlaylist: (songs: Song[], startIndex?: number) => void
  toggleSidebar: () => void
}
```

### `FavoritesState` (Zustand Store - Persisted)
```typescript
interface FavoritesState {
  favorites: Song[]
  addFavorite: (song: Song) => void
  removeFavorite: (bvid: string) => void
  isFavorite: (bvid: string) => boolean
}
```
