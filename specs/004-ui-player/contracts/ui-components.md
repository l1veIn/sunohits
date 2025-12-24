# UI Component Contracts

## `SongList`
Displays a virtualized list of songs.

**Props**:
- `songs`: `Song[]`
- `onPlay`: `(song: Song) => void`
- `currentSongId`: `string | null`
- `isPlaying`: `boolean`

## `PlayerBar`
Fixed bottom bar for playback control.

**Props**:
- None (Connects to `usePlayerStore` internally)

## `Sidebar`
Navigation sidebar.

**Props**:
- `className`: `string` (for responsive hiding/showing)
