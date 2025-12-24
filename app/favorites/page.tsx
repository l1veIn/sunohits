'use client'

import { useFavoritesStore } from '@/lib/store/use-favorites-store'
import { SongItem } from '@/components/song-list/song-item'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <h1 className="text-2xl font-bold tracking-tight">My Favorites</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{favorites.length} songs saved</p>
      </header>

      <div className="flex-1 p-6">
        <div className="flex flex-col space-y-1">
          {favorites.map((song, index) => (
            <SongItem 
              key={song.bvid} 
              song={song} 
              index={index}
            />
          ))}
          {!favorites.length && (
            <div className="text-center py-20 text-muted-foreground">
              No favorites yet. Go discover some music!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
