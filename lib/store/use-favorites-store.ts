import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Song } from './use-player-store'

interface FavoritesState {
  favorites: Song[]
  addFavorite: (song: Song) => void
  removeFavorite: (bvid: string) => void
  isFavorite: (bvid: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (song) => {
        const { favorites } = get()
        if (!favorites.some(s => s.bvid === song.bvid)) {
          set({ favorites: [...favorites, song] })
        }
      },
      
      removeFavorite: (bvid) => {
        set({ favorites: get().favorites.filter(s => s.bvid !== bvid) })
      },
      
      isFavorite: (bvid) => {
        return get().favorites.some(s => s.bvid === bvid)
      }
    }),
    {
      name: 'sunohits-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
