import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Song {
  bvid: string
  cid?: string | null
  title: string
  pic: string
  owner_name: string
  pubdate: number
  duration?: number
  total_view?: number | null      // Total views
  trending_val?: number | null    // Views gained in last 24h
}

export type PlayMode = 'sequential' | 'shuffle' | 'repeat-one' | 'repeat-all'

interface PlayerState {
  // State
  currentSong: Song | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  playlist: Song[]
  currentIndex: number
  playMode: PlayMode
  isSidebarOpen: boolean
  // Shuffle state: shuffled order of indices
  shuffleOrder: number[]
  shufflePosition: number  // Current position in shuffleOrder

  // Actions
  play: (song?: Song) => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  setPlaylist: (songs: Song[], startIndex?: number) => void
  addToPlaylist: (song: Song) => void
  playAll: (songs: Song[]) => void  // Add all songs to playlist and start playing
  playNext: (song: Song) => void  // Insert after current position
  removeFromPlaylist: (bvid: string) => void
  clearPlaylist: () => void
  togglePlayMode: () => void
  setPlayMode: (mode: PlayMode) => void
  toggleSidebar: () => void
  setProgress: (time: number) => void
  setDuration: (time: number) => void
}

const PLAY_MODES: PlayMode[] = ['sequential', 'shuffle', 'repeat-one', 'repeat-all']

// Fisher-Yates shuffle algorithm
function shuffleArray(length: number, startIndex?: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  // If startIndex is provided, move it to the front so current song plays first
  if (startIndex !== undefined && startIndex >= 0 && startIndex < length) {
    const idx = arr.indexOf(startIndex)
    if (idx > 0) {
      arr.splice(idx, 1)
      arr.unshift(startIndex)
    }
  }
  return arr
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSong: null,
      isPlaying: false,
      volume: 1,
      progress: 0,
      duration: 0,
      playlist: [],
      currentIndex: -1,
      playMode: 'sequential',
      isSidebarOpen: false,
      shuffleOrder: [],
      shufflePosition: 0,

      // Actions
      play: (song) => {
        const { playlist } = get()

        if (song) {
          // If playing a new song
          if (song.bvid !== get().currentSong?.bvid) {
            let index = playlist.findIndex(s => s.bvid === song.bvid)

            // Auto-add to playlist if not already in it
            if (index === -1) {
              const newPlaylist = [...playlist, song]
              index = newPlaylist.length - 1
              set({
                playlist: newPlaylist,
                currentSong: song,
                currentIndex: index,
                isPlaying: true
              })
            } else {
              set({ currentSong: song, currentIndex: index, isPlaying: true })
            }
          } else {
            // Resume
            set({ isPlaying: true })
          }
        } else {
          // Resume current
          if (get().currentSong) {
            set({ isPlaying: true })
          }
        }
      },

      pause: () => set({ isPlaying: false }),

      next: () => {
        const { playlist, currentIndex, playMode, shuffleOrder, shufflePosition } = get()
        if (playlist.length === 0) return

        let nextIndex: number
        let newShufflePosition = shufflePosition

        switch (playMode) {
          case 'repeat-one':
            // Stay on same song
            nextIndex = currentIndex
            break
          case 'shuffle':
            // Use shuffled order
            if (shuffleOrder.length !== playlist.length) {
              // Regenerate shuffle order if it's out of sync
              const newOrder = shuffleArray(playlist.length, currentIndex)
              set({ shuffleOrder: newOrder, shufflePosition: 0 })
              nextIndex = newOrder[0]
              newShufflePosition = 0
            } else {
              // Move to next position in shuffle order
              newShufflePosition = shufflePosition + 1
              if (newShufflePosition >= shuffleOrder.length) {
                // End of shuffled list - reshuffle and start over
                const newOrder = shuffleArray(playlist.length)
                set({ shuffleOrder: newOrder, shufflePosition: 0 })
                nextIndex = newOrder[0]
                newShufflePosition = 0
              } else {
                nextIndex = shuffleOrder[newShufflePosition]
              }
            }
            set({
              currentSong: playlist[nextIndex],
              currentIndex: nextIndex,
              shufflePosition: newShufflePosition,
              isPlaying: true
            })
            return
          case 'repeat-all':
            // Loop to start when at end
            nextIndex = (currentIndex + 1) % playlist.length
            break
          case 'sequential':
          default:
            // Stop at end
            if (currentIndex >= playlist.length - 1) {
              set({ isPlaying: false })
              return
            }
            nextIndex = currentIndex + 1
        }

        set({
          currentSong: playlist[nextIndex],
          currentIndex: nextIndex,
          isPlaying: true
        })
      },

      prev: () => {
        const { playlist, currentIndex, playMode, shuffleOrder, shufflePosition } = get()
        if (playlist.length === 0) return

        let prevIndex: number
        let newShufflePosition = shufflePosition

        switch (playMode) {
          case 'repeat-one':
            prevIndex = currentIndex
            break
          case 'shuffle':
            // Go back in shuffle order
            if (shuffleOrder.length !== playlist.length || shufflePosition <= 0) {
              // Can't go back if at start or shuffle order is invalid
              prevIndex = currentIndex
            } else {
              newShufflePosition = shufflePosition - 1
              prevIndex = shuffleOrder[newShufflePosition]
            }
            set({
              currentSong: playlist[prevIndex],
              currentIndex: prevIndex,
              shufflePosition: newShufflePosition,
              isPlaying: true
            })
            return
          case 'repeat-all':
            prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
            break
          case 'sequential':
          default:
            if (currentIndex <= 0) return
            prevIndex = currentIndex - 1
        }

        set({
          currentSong: playlist[prevIndex],
          currentIndex: prevIndex,
          isPlaying: true
        })
      },

      seek: (time) => set({ progress: time }),

      setVolume: (vol) => set({ volume: vol }),

      setPlaylist: (songs, startIndex = 0) => {
        set({
          playlist: songs,
          currentIndex: startIndex,
          currentSong: songs[startIndex] || null,
          isPlaying: !!songs[startIndex]
        })
      },

      addToPlaylist: (song) => {
        const { playlist } = get()
        if (!playlist.some(s => s.bvid === song.bvid)) {
          set({ playlist: [...playlist, song] })
        }
      },

      playAll: (songs) => {
        if (songs.length === 0) return

        const { playlist } = get()

        // Merge: add new songs that aren't already in playlist
        const existingBvids = new Set(playlist.map(s => s.bvid))
        const newSongs = songs.filter(s => !existingBvids.has(s.bvid))
        const mergedPlaylist = [...playlist, ...newSongs]

        // Start playing from first song of the input
        const firstSong = songs[0]
        const startIndex = mergedPlaylist.findIndex(s => s.bvid === firstSong.bvid)

        set({
          playlist: mergedPlaylist,
          currentSong: firstSong,
          currentIndex: startIndex,
          isPlaying: true
        })
      },

      playNext: (song) => {
        const { playlist, currentIndex } = get()
        // Don't add if already in playlist
        if (playlist.some(s => s.bvid === song.bvid)) return

        // Insert after current position
        const insertIndex = currentIndex + 1
        const newPlaylist = [
          ...playlist.slice(0, insertIndex),
          song,
          ...playlist.slice(insertIndex)
        ]
        set({ playlist: newPlaylist })
      },

      removeFromPlaylist: (bvid) => {
        const { playlist, currentIndex, currentSong } = get()
        const newPlaylist = playlist.filter(s => s.bvid !== bvid)

        // Adjust currentIndex if needed
        const removedIndex = playlist.findIndex(s => s.bvid === bvid)
        let newIndex = currentIndex

        if (removedIndex !== -1 && removedIndex < currentIndex) {
          newIndex = currentIndex - 1
        } else if (currentSong?.bvid === bvid) {
          // Current song was removed, play next or clear
          if (newPlaylist.length > 0) {
            const nextIdx = Math.min(removedIndex, newPlaylist.length - 1)
            set({
              playlist: newPlaylist,
              currentIndex: nextIdx,
              currentSong: newPlaylist[nextIdx]
            })
            return
          } else {
            set({ playlist: [], currentIndex: -1, currentSong: null, isPlaying: false })
            return
          }
        }

        set({ playlist: newPlaylist, currentIndex: newIndex })
      },

      clearPlaylist: () => {
        set({ playlist: [], currentIndex: -1, currentSong: null, isPlaying: false })
      },

      togglePlayMode: () => {
        const { playMode, playlist, currentIndex } = get()
        const currentModeIdx = PLAY_MODES.indexOf(playMode)
        const nextMode = PLAY_MODES[(currentModeIdx + 1) % PLAY_MODES.length]

        // When switching to shuffle, generate a new shuffle order
        if (nextMode === 'shuffle' && playlist.length > 0) {
          const newOrder = shuffleArray(playlist.length, currentIndex)
          set({ playMode: nextMode, shuffleOrder: newOrder, shufflePosition: 0 })
        } else {
          set({ playMode: nextMode })
        }
      },

      setPlayMode: (mode) => set({ playMode: mode }),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setProgress: (time) => set({ progress: time }),

      setDuration: (time) => set({ duration: time })
    }),
    {
      name: 'sunohits-player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        playlist: state.playlist,
        currentSong: state.currentSong,
        currentIndex: state.currentIndex,
        volume: state.volume,
        playMode: state.playMode,
      }),
    }
  )
)
