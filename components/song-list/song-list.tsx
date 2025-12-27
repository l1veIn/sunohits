'use client'

import { Play, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Song, usePlayerStore } from '@/lib/store/use-player-store'
import { SongItem } from './song-item'
import { BulkPlaylistPicker } from '@/components/playlist/playlist-picker'
import { cn } from '@/lib/utils'

interface SongListProps {
    songs: Song[]
    loading?: boolean
    // Pagination
    currentPage?: number
    totalPages?: number
    totalCount?: number
    onPageChange?: (page: number) => void
    // Action buttons
    showPlayAll?: boolean
    showFavoriteAll?: boolean
    // Display options
    showIndex?: boolean
    emptyMessage?: string
    className?: string
    // Callbacks
    onBlock?: (bvid: string) => void
}

export function SongList({
    songs,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    totalCount,
    onPageChange,
    showPlayAll = true,
    showFavoriteAll = true,
    showIndex = true,
    emptyMessage = '暂无歌曲',
    className,
    onBlock
}: SongListProps) {
    const { setPlaylist, play } = usePlayerStore()

    // Play all songs
    const handlePlayAll = () => {
        if (songs.length === 0) return
        setPlaylist(songs, 0)
        play(songs[0])
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header with action buttons and count */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {totalCount !== undefined ? (
                        <>共 {totalCount} 首</>
                    ) : (
                        <>共 {songs.length} 首</>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showPlayAll && songs.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePlayAll}
                            className="h-8"
                        >
                            <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                            播放全部
                        </Button>
                    )}
                    {showFavoriteAll && songs.length > 0 && (
                        <BulkPlaylistPicker songs={songs}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                            >
                                <Heart className="h-3.5 w-3.5 mr-1.5" />
                                收藏全部
                            </Button>
                        </BulkPlaylistPicker>
                    )}
                </div>
            </div>

            {/* Song list */}
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
            ) : songs.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                <div className="space-y-1">
                    {songs.map((song, index) => (
                        <SongItem
                            key={song.bvid}
                            song={song}
                            index={(currentPage - 1) * 50 + index}
                            showIndex={showIndex}
                            onBlock={onBlock}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    loading={loading}
                />
            )}
        </div>
    )
}
