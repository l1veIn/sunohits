'use client'

import { Virtuoso } from 'react-virtuoso'
import { Song } from '@/lib/store/use-player-store'
import { SongItem } from './song-item'

interface VirtualListProps {
  songs: Song[]
  onBlock?: (bvid: string) => void
}

export function VirtualList({ songs, onBlock }: VirtualListProps) {
  if (!songs.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No songs found.
      </div>
    )
  }

  return (
    <Virtuoso
      style={{ height: '100%' }}
      data={songs}
      itemContent={(index, song) => (
        <div className="pb-1">
          <SongItem song={song} index={index} onBlock={onBlock} />
        </div>
      )}
    />
  )
}
