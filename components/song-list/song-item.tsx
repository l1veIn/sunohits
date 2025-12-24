'use client'

import { Play, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Song, usePlayerStore } from '@/lib/store/use-player-store'
import { useFavoritesStore } from '@/lib/store/use-favorites-store'
import { cn } from '@/lib/utils'

interface SongItemProps {
  song: Song
  index: number
  className?: string
}

export function SongItem({ song, index, className }: SongItemProps) {
  const { play, currentSong, isPlaying } = usePlayerStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  
  const isCurrent = currentSong?.bvid === song.bvid
  const isFav = isFavorite(song.bvid)

  const handlePlay = () => {
    if (isCurrent && isPlaying) {
      // Maybe pause? Or just nothing. Usually clicking item plays it.
      play(song)
    } else {
      play(song)
    }
  }

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFav) {
      removeFavorite(song.bvid)
    } else {
      addFavorite(song)
    }
  }

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
        isCurrent && "bg-accent",
        className
      )}
      onClick={handlePlay}
    >
      <div className="w-8 text-center text-muted-foreground text-sm font-mono">
        {index + 1}
      </div>
      
      <div className="relative w-12 h-12 rounded overflow-hidden bg-secondary shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={song.pic} 
          alt={song.title} 
          className="object-cover w-full h-full"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
          isCurrent && "opacity-100"
        )}>
           {/* We could show pause icon if playing, but play is fine for 'restart' or 'focus' */}
           <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("font-medium truncate", isCurrent && "text-primary")}>
          {song.title}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {song.owner_name}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isFav && "opacity-100 text-red-500 hover:text-red-600")}
        onClick={toggleFav}
      >
        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
      </Button>
      
      <div className="text-xs text-muted-foreground w-12 text-right hidden sm:block">
        {/* Duration placeholder or view count */}
        {/* song.duration ? formatTime(song.duration) : '--:--' */}
      </div>
    </div>
  )
}
