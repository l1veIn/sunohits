import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Song } from './use-player-store'
import { nanoid } from 'nanoid'

// Playlist interface
export interface Playlist {
  id: string
  name: string
  createdAt: number
  isDefault: boolean
}

// Default playlist ID
export const DEFAULT_PLAYLIST_ID = 'default'

interface FavoritesState {
  // All playlists
  playlists: Playlist[]
  // Song storage: bvid -> Song (avoid duplicate storage)
  songs: Record<string, Song>
  // Playlist content: playlistId -> bvid[]
  playlistSongs: Record<string, string[]>

  // Playlist management
  createPlaylist: (name: string) => string
  renamePlaylist: (id: string, name: string) => void
  deletePlaylist: (id: string, keepSongs?: boolean) => void
  getPlaylist: (id: string) => Playlist | undefined

  // Song management
  addToPlaylist: (song: Song, playlistId?: string) => void
  addManyToPlaylist: (songs: Song[], playlistId?: string) => void
  removeFromPlaylist: (bvid: string, playlistId: string) => void
  moveToPlaylist: (bvid: string, fromPlaylistId: string, toPlaylistId: string) => void
  copyToPlaylist: (bvid: string, fromPlaylistId: string, toPlaylistId: string) => void

  // Query helpers
  isInPlaylist: (bvid: string, playlistId?: string) => boolean
  isInAnyPlaylist: (bvid: string) => boolean
  getPlaylistsForSong: (bvid: string) => string[]
  getSongsInPlaylist: (playlistId: string) => Song[]

  // Legacy compatibility (for existing components)
  favorites: Song[]
  isFavorite: (bvid: string) => boolean
  addFavorite: (song: Song) => void
  addFavorites: (songs: Song[]) => void
  removeFavorite: (bvid: string) => void
}

// Create default playlist
const createDefaultPlaylist = (): Playlist => ({
  id: DEFAULT_PLAYLIST_ID,
  name: '默认收藏夹',
  createdAt: Date.now(),
  isDefault: true
})

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      playlists: [createDefaultPlaylist()],
      songs: {},
      playlistSongs: { [DEFAULT_PLAYLIST_ID]: [] },

      // Create a new playlist
      createPlaylist: (name: string) => {
        const id = nanoid()
        set((state) => ({
          playlists: [...state.playlists, {
            id,
            name,
            createdAt: Date.now(),
            isDefault: false
          }],
          playlistSongs: { ...state.playlistSongs, [id]: [] }
        }))
        return id
      },

      // Rename a playlist (not default)
      renamePlaylist: (id: string, name: string) => {
        set((state) => ({
          playlists: state.playlists.map(p =>
            p.id === id && !p.isDefault ? { ...p, name } : p
          )
        }))
      },

      // Delete a playlist (not default)
      deletePlaylist: (id: string, keepSongs = false) => {
        const state = get()
        const playlist = state.playlists.find(p => p.id === id)
        if (!playlist || playlist.isDefault) return

        // If keeping songs, move them to default playlist
        if (keepSongs) {
          const songsToMove = state.playlistSongs[id] || []
          const defaultSongs = state.playlistSongs[DEFAULT_PLAYLIST_ID] || []
          const newDefaultSongs = [...new Set([...defaultSongs, ...songsToMove])]

          set((state) => {
            const newPlaylistSongs = { ...state.playlistSongs }
            delete newPlaylistSongs[id]
            newPlaylistSongs[DEFAULT_PLAYLIST_ID] = newDefaultSongs

            return {
              playlists: state.playlists.filter(p => p.id !== id),
              playlistSongs: newPlaylistSongs
            }
          })
        } else {
          set((state) => {
            const newPlaylistSongs = { ...state.playlistSongs }
            delete newPlaylistSongs[id]

            // Clean up orphaned songs
            const allReferencedBvids = new Set(
              Object.values(newPlaylistSongs).flat()
            )
            const newSongs: Record<string, Song> = {}
            for (const bvid of allReferencedBvids) {
              if (state.songs[bvid]) {
                newSongs[bvid] = state.songs[bvid]
              }
            }

            return {
              playlists: state.playlists.filter(p => p.id !== id),
              playlistSongs: newPlaylistSongs,
              songs: newSongs
            }
          })
        }
      },

      getPlaylist: (id: string) => {
        return get().playlists.find(p => p.id === id)
      },

      // Add a song to a playlist
      addToPlaylist: (song: Song, playlistId = DEFAULT_PLAYLIST_ID) => {
        set((state) => {
          const currentSongs = state.playlistSongs[playlistId] || []
          if (currentSongs.includes(song.bvid)) return state

          return {
            songs: { ...state.songs, [song.bvid]: song },
            playlistSongs: {
              ...state.playlistSongs,
              [playlistId]: [...currentSongs, song.bvid]
            }
          }
        })
      },

      // Add multiple songs to a playlist
      addManyToPlaylist: (songs: Song[], playlistId = DEFAULT_PLAYLIST_ID) => {
        set((state) => {
          const currentBvids = new Set(state.playlistSongs[playlistId] || [])
          const newSongs = songs.filter(s => !currentBvids.has(s.bvid))

          if (newSongs.length === 0) return state

          const updatedSongsMap = { ...state.songs }
          for (const song of newSongs) {
            updatedSongsMap[song.bvid] = song
          }

          return {
            songs: updatedSongsMap,
            playlistSongs: {
              ...state.playlistSongs,
              [playlistId]: [...(state.playlistSongs[playlistId] || []), ...newSongs.map(s => s.bvid)]
            }
          }
        })
      },

      // Remove a song from a playlist
      removeFromPlaylist: (bvid: string, playlistId: string) => {
        set((state) => {
          const newPlaylistSongs = {
            ...state.playlistSongs,
            [playlistId]: (state.playlistSongs[playlistId] || []).filter(id => id !== bvid)
          }

          // Check if song is still in any playlist
          const stillReferenced = Object.values(newPlaylistSongs).some(bvids => bvids.includes(bvid))

          const newSongs = { ...state.songs }
          if (!stillReferenced) {
            delete newSongs[bvid]
          }

          return {
            songs: newSongs,
            playlistSongs: newPlaylistSongs
          }
        })
      },

      // Move a song from one playlist to another
      moveToPlaylist: (bvid: string, fromPlaylistId: string, toPlaylistId: string) => {
        if (fromPlaylistId === toPlaylistId) return

        set((state) => {
          const fromSongs = (state.playlistSongs[fromPlaylistId] || []).filter(id => id !== bvid)
          const toSongs = state.playlistSongs[toPlaylistId] || []

          if (toSongs.includes(bvid)) {
            // Already in target, just remove from source
            return {
              playlistSongs: {
                ...state.playlistSongs,
                [fromPlaylistId]: fromSongs
              }
            }
          }

          return {
            playlistSongs: {
              ...state.playlistSongs,
              [fromPlaylistId]: fromSongs,
              [toPlaylistId]: [...toSongs, bvid]
            }
          }
        })
      },

      // Copy a song to another playlist
      copyToPlaylist: (bvid: string, fromPlaylistId: string, toPlaylistId: string) => {
        if (fromPlaylistId === toPlaylistId) return

        set((state) => {
          const toSongs = state.playlistSongs[toPlaylistId] || []
          if (toSongs.includes(bvid)) return state

          return {
            playlistSongs: {
              ...state.playlistSongs,
              [toPlaylistId]: [...toSongs, bvid]
            }
          }
        })
      },

      // Check if a song is in a specific playlist
      isInPlaylist: (bvid: string, playlistId = DEFAULT_PLAYLIST_ID) => {
        const state = get()
        return (state.playlistSongs[playlistId] || []).includes(bvid)
      },

      // Check if a song is in any playlist
      isInAnyPlaylist: (bvid: string) => {
        const state = get()
        return Object.values(state.playlistSongs).some(bvids => bvids.includes(bvid))
      },

      // Get all playlists containing a song
      getPlaylistsForSong: (bvid: string) => {
        const state = get()
        return Object.entries(state.playlistSongs)
          .filter(([, bvids]) => bvids.includes(bvid))
          .map(([playlistId]) => playlistId)
      },

      // Get all songs in a playlist
      getSongsInPlaylist: (playlistId: string) => {
        const state = get()
        const bvids = state.playlistSongs[playlistId] || []
        return bvids.map(bvid => state.songs[bvid]).filter(Boolean)
      },

      // ============ Legacy compatibility ============
      // These methods work with the default playlist for backward compatibility

      // Note: 'favorites' is a computed value, access via getFavorites() or use getSongsInPlaylist(DEFAULT_PLAYLIST_ID)
      favorites: [],  // This will be overwritten by persist, but we expose getFavorites() for actual usage

      isFavorite: (bvid: string) => {
        return get().isInPlaylist(bvid, DEFAULT_PLAYLIST_ID)
      },

      addFavorite: (song: Song) => {
        get().addToPlaylist(song, DEFAULT_PLAYLIST_ID)
      },

      addFavorites: (songs: Song[]) => {
        get().addManyToPlaylist(songs, DEFAULT_PLAYLIST_ID)
      },

      removeFavorite: (bvid: string) => {
        get().removeFromPlaylist(bvid, DEFAULT_PLAYLIST_ID)
      }
    }),
    {
      name: 'sunohits-favorites-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        playlists: state.playlists,
        songs: state.songs,
        playlistSongs: state.playlistSongs,
      }),
    }
  )
)
