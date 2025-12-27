'use client'

import { Play, Pause, MoreHorizontal, Heart, ExternalLink, Trash2, ListEnd, TrendingUp, Eye, Calendar, Ban, FolderPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Song, usePlayerStore } from '@/lib/store/use-player-store'
import { useFavoritesStore, DEFAULT_PLAYLIST_ID } from '@/lib/store/use-favorites-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'

// Strip HTML tags and decode entities from Bilibili search results
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/&amp;/g, '&')   // Decode &
    .replace(/&lt;/g, '<')    // Decode <
    .replace(/&gt;/g, '>')    // Decode >
    .replace(/&quot;/g, '"')  // Decode "
    .replace(/&#39;/g, "'")   // Decode '
}

// Format large numbers with K/M/B suffixes
function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 10_000) return (num / 1_000).toFixed(1) + 'K'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

// Format Unix timestamp to relative date or date string
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

interface SongItemProps {
  song: Song
  index?: number  // Optional - show index when provided
  showIndex?: boolean
  compact?: boolean  // Compact mode for playlist drawer
  className?: string
  onRemove?: () => void  // Optional remove callback
  onBlock?: (bvid: string) => void  // Optional block callback
}

export function SongItem({
  song,
  index = 0,
  showIndex = true,
  compact = false,
  className,
  onRemove,
  onBlock
}: SongItemProps) {
  const { play, pause, currentSong, isPlaying, playNext } = usePlayerStore()
  const { isFavorite, addFavorite, removeFavorite, playlists, playlistSongs, addToPlaylist, removeFromPlaylist } = useFavoritesStore()

  const isCurrent = currentSong?.bvid === song.bvid
  const isFav = isFavorite(song.bvid)

  const handlePlay = () => {
    if (isCurrent && isPlaying) {
      pause()
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
      toast('已收藏', {
        description: '喜欢这首歌？去B站给 UP 主三连支持一下！',
        action: {
          label: '去B站',
          onClick: () => window.open(`https://www.bilibili.com/video/${song.bvid}`, '_blank')
        },
        duration: 5000
      })
    }
  }

  // Compact variant for playlist drawer
  if (compact) {
    return (
      <div
        className={cn(
          "group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
          isCurrent && "bg-accent",
          className
        )}
        onClick={handlePlay}
      >
        <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-secondary relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.pic}
            alt={song.title}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
          {isCurrent && isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="animate-pulse text-white">♪</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm truncate", isCurrent && "text-primary font-medium")}>
            {stripHtml(song.title)}
          </div>
          <div className="text-xs text-muted-foreground truncate">{song.owner_name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-8 w-8 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              toggleFav(e as unknown as React.MouseEvent)
            }}>
              <Heart className={cn("w-4 h-4 mr-2", isFav && "fill-current text-red-500")} />
              {isFav ? '取消收藏' : '收藏'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              window.open(`https://www.bilibili.com/video/${song.bvid}`, '_blank')
            }}>
              <ExternalLink className="w-4 h-4 mr-2" />
              在B站打开
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              playNext(song)
            }}>
              <ListEnd className="w-4 h-4 mr-2" />
              下一首播放
            </DropdownMenuItem>
            {onRemove && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                从列表删除
              </DropdownMenuItem>
            )}
            {onBlock && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onBlock(song.bvid)
              }} className="text-destructive">
                <Ban className="w-4 h-4 mr-2" />
                这不是音乐！
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Full variant for discovery/favorites pages
  return (
    <div
      className={cn(
        "group flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
        isCurrent && "bg-accent",
        className
      )}
      onClick={handlePlay}
    >
      {/* Index - hide on mobile */}
      {showIndex && (
        <div className="hidden sm:block w-6 text-center text-muted-foreground text-sm font-mono shrink-0">
          {index + 1}
        </div>
      )}

      {/* Cover - smaller on mobile */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-secondary shrink-0">
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
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          )}
        </div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <div className={cn("font-medium truncate text-sm sm:text-base", isCurrent && "text-primary")}>
          {stripHtml(song.title)}
        </div>
        {/* Secondary info line */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[120px] sm:max-w-none">{song.owner_name}</span>
          {/* Stats visible on lg+ screens */}
          <span className="hidden lg:flex items-center gap-2">
            {song.total_view != null && song.total_view > 0 && (
              <span className="flex items-center gap-0.5" title="总播放">
                <Eye className="w-3 h-3" />
                {formatNumber(song.total_view)}
              </span>
            )}
            {song.trending_val != null && song.trending_val > 0 && (
              <span className="flex items-center gap-0.5 text-green-600" title="昨日新增">
                <TrendingUp className="w-3 h-3" />
                +{formatNumber(song.trending_val)}
              </span>
            )}
            {song.pubdate > 0 && (
              <span className="flex items-center gap-0.5" title="发布日期">
                <Calendar className="w-3 h-3" />
                {formatDate(song.pubdate)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Favorite button - hide on mobile, show on hover on desktop */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
          isFav && "opacity-100 text-red-500 hover:text-red-600"
        )}
        onClick={toggleFav}
      >
        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
      </Button>

      {/* Dropdown menu - always visible on mobile, hover on desktop */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation()
            play(song)
          }}>
            <Play className="w-4 h-4 mr-2" />
            播放
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation()
            playNext(song)
          }}>
            <ListEnd className="w-4 h-4 mr-2" />
            下一首播放
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleFav}>
            <Heart className={cn("w-4 h-4 mr-2", isFav && "fill-current text-red-500")} />
            {isFav ? '取消收藏' : '收藏'}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderPlus className="w-4 h-4 mr-2" />
              添加到歌单
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {playlists.map((playlist) => {
                  const isIn = (playlistSongs[playlist.id] || []).includes(song.bvid)
                  return (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isIn) {
                          removeFromPlaylist(song.bvid, playlist.id)
                          toast.success(`已从「${playlist.name}」移除`)
                        } else {
                          addToPlaylist(song, playlist.id)
                          toast.success(`已添加到「${playlist.name}」`)
                        }
                      }}
                    >
                      {isIn && <Check className="w-4 h-4 mr-2" />}
                      <span className={cn(!isIn && "ml-6")}>{playlist.name}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation()
            window.open(`https://www.bilibili.com/video/${song.bvid}`, '_blank')
          }}>
            <ExternalLink className="w-4 h-4 mr-2" />
            在B站打开
          </DropdownMenuItem>
          {onBlock && (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onBlock(song.bvid)
            }} className="text-destructive">
              <Ban className="w-4 h-4 mr-2" />
              这不是音乐！
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
