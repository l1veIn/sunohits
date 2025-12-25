'use client'

import { useFavoritesStore } from '@/lib/store/use-favorites-store'
import { usePlayerStore } from '@/lib/store/use-player-store'
import { SongItem } from '@/components/song-list/song-item'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useEffect, useState } from 'react'
import { Heart, Play } from 'lucide-react'

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore()
  const playAll = usePlayerStore(state => state.playAll)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playAll(favorites)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 border-b sticky top-0 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Favorites</h1>
              <p className="text-muted-foreground text-sm">{favorites.length} songs saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePlayAll}
              disabled={favorites.length === 0}
              className="gap-1"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">播放全部</span>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
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
