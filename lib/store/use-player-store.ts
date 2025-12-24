import { create } from 'zustand'

export interface Song {
  bvid: string
  title: string
  pic: string
  owner_name: string
  pubdate: number
  duration?: number
}

interface PlayerState {
  // State
  currentSong: Song | null
  isPlaying: boolean
  volume: number // 0-1
  progress: number // seconds
  duration: number // seconds
  playlist: Song[]
  currentIndex: number
  isSidebarOpen: boolean

  // Actions
  play: (song?: Song) => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  setPlaylist: (songs: Song[], startIndex?: number) => void
  toggleSidebar: () => void
  setProgress: (time: number) => void
  setDuration: (time: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial State
  currentSong: null,
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,
  playlist: [],
  currentIndex: -1,
  isSidebarOpen: false,

  // Actions
  play: (song) => {
    const { playlist, currentIndex } = get()
    
    if (song) {
      // If playing a new song
      if (song.bvid !== get().currentSong?.bvid) {
        // If song is not in playlist (or we want to replace playlist context? For now assume it's added or just played)
        // Simplified: If song passed, play it. If it's in playlist, update index.
        const index = playlist.findIndex(s => s.bvid === song.bvid)
        if (index !== -1) {
            set({ currentSong: song, currentIndex: index, isPlaying: true })
        } else {
            // Add to end or just play as single? Let's replace playlist for now if it's a single play action usually implied
            // But usually we click from a list.
            // If we just play a song, we might want to keep the playlist context if possible. 
            // For now, let's just set it as current.
            set({ currentSong: song, isPlaying: true })
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
    const { playlist, currentIndex } = get()
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1
      set({ currentSong: playlist[nextIndex], currentIndex: nextIndex })
    }
  },

  prev: () => {
    const { playlist, currentIndex } = get()
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      set({ currentSong: playlist[prevIndex], currentIndex: prevIndex })
    }
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

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setProgress: (time) => set({ progress: time }),
  
  setDuration: (time) => set({ duration: time })
}))
