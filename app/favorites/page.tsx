'use client'

import { useState, useEffect } from 'react'
import { useFavoritesStore, DEFAULT_PLAYLIST_ID } from '@/lib/store/use-favorites-store'
import { usePlayerStore } from '@/lib/store/use-player-store'
import { SongList } from '@/components/song-list/song-list'
import { PlaylistManager } from '@/components/playlist/playlist-manager'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { playlists, getSongsInPlaylist, playlistSongs, getPlaylist } = useFavoritesStore()
  const { setPlaylist, play } = usePlayerStore()
  const [mounted, setMounted] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(DEFAULT_PLAYLIST_ID)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentPlaylist = getPlaylist(selectedPlaylistId)
  const songs = getSongsInPlaylist(selectedPlaylistId)
  const totalSongs = Object.values(playlistSongs).reduce((sum, arr) => sum + arr.length, 0)

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setPlaylist(songs, 0)
      play(songs[0])
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-6 py-4 border-b sticky top-0 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">我的收藏</h1>
              <p className="text-muted-foreground text-sm">
                {playlists.length} 个歌单 · {totalSongs} 首歌曲
              </p>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Playlist manager */}
        <PlaylistManager
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={setSelectedPlaylistId}
        />

        {/* Divider */}
        <div className="border-t" />

        {/* Current playlist content */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {currentPlaylist?.name || '歌单'}
          </h3>

          <SongList
            songs={songs}
            loading={false}
            showPlayAll={true}
            showFavoriteAll={false}
            showIndex={true}
            emptyMessage={`「${currentPlaylist?.name}」还没有歌曲`}
          />
        </div>
      </div>
    </div>
  )
}
