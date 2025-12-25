'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, ListMusic, Music, Repeat, Repeat1, Shuffle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayerStore, PlayMode } from '@/lib/store/use-player-store'
import { ProgressSlider } from './progress-slider'
import { VolumeControl } from './volume-control'
import { useMediaSession } from '@/lib/hooks/use-media-session'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SongItem } from '@/components/song-list/song-item'
import { cn } from '@/lib/utils'

// Strip HTML tags and decode entities
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Play mode icon mapping
function PlayModeIcon({ mode }: { mode: PlayMode }) {
  switch (mode) {
    case 'shuffle':
      return <Shuffle className="h-4 w-4" />
    case 'repeat-one':
      return <Repeat1 className="h-4 w-4" />
    case 'repeat-all':
      return <Repeat className="h-4 w-4" />
    case 'sequential':
    default:
      return <ArrowRight className="h-4 w-4" />
  }
}

const PLAY_MODE_LABELS: Record<PlayMode, string> = {
  'sequential': 'Sequential',
  'shuffle': 'Shuffle',
  'repeat-one': 'Repeat One',
  'repeat-all': 'Repeat All',
}

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    playlist,
    currentIndex,
    playMode,
    play,
    pause,
    next,
    prev,
    seek,
    setVolume,
    setProgress,
    setDuration,
    togglePlayMode,
    removeFromPlaylist,
    clearPlaylist
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch - wait for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Media Session Integration
  useMediaSession({
    song: currentSong,
    isPlaying,
    play: () => play(),
    pause,
    next,
    prev,
    seek
  })

  // Audio source updates when song changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    const streamUrl = currentSong.cid
      ? `/api/play?bvid=${currentSong.bvid}&cid=${currentSong.cid}`
      : `/api/play?bvid=${currentSong.bvid}`

    if (!audio.src.endsWith(streamUrl.split('?')[1] || '')) {
      audio.src = streamUrl
      if (isPlaying) {
        audio.play().catch(e => console.error('Auto-play failed', e))
      }
    }
  }, [currentSong, isPlaying])

  // Volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Play/Pause effect
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Play failed', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
    }
  }

  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    next()
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-20 border-t bg-background/95 backdrop-blur fixed bottom-0 left-0 right-0 flex items-center justify-center px-4 z-50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Music className="h-5 w-5" />
          <span className="font-medium">SunoHits</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-auto sm:h-20 border-t bg-background/95 backdrop-blur fixed bottom-0 left-0 right-0 flex flex-col sm:flex-row items-center sm:justify-between px-3 sm:px-4 py-2 sm:py-0 gap-2 sm:gap-0 z-50">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
      />

      {/* Mobile: Full width progress bar at top */}
      <div className="w-full sm:hidden">
        <ProgressSlider
          current={progress}
          duration={duration}
          onSeek={(val) => {
            if (audioRef.current) audioRef.current.currentTime = val
            seek(val)
          }}
        />
      </div>

      {/* Track Info + Controls Row */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-2">
        {/* Track Info - shrinks to give priority to center controls */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:shrink sm:flex-initial">
          {currentSong ? (
            <>
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded bg-secondary overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSong.pic}
                  alt={currentSong.title}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 shrink overflow-hidden">
                <div className="font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden">
                  <span className="inline-block animate-marquee hover:animate-none">
                    {stripHtml(currentSong.title)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{currentSong.owner_name}</div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Music className="h-5 w-5" />
              <span className="font-medium text-sm sm:text-base">SunoHits</span>
            </div>
          )}
        </div>

        {/* Mobile: Compact Controls */}
        <div className="flex sm:hidden items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={prev} disabled={!currentSong}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={isPlaying ? pause : () => play()}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={next} disabled={!currentSong}>
            <SkipForward className="h-4 w-4" />
          </Button>
          {/* Playlist button on mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <ListMusic className="h-4 w-4" />
                {playlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {playlist.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>播放列表 ({playlist.length})</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                {playlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无歌曲
                  </div>
                ) : (
                  playlist.map((song) => (
                    <SongItem
                      key={song.bvid}
                      song={song}
                      compact
                      showIndex={false}
                      onRemove={() => removeFromPlaylist(song.bvid)}
                    />
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop: Center Controls with Progress */}
      <div className="hidden sm:flex flex-col items-center gap-1 w-1/3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={prev} disabled={!currentSong}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={isPlaying ? pause : () => play()}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={next} disabled={!currentSong}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        <ProgressSlider
          current={progress}
          duration={duration}
          onSeek={(val) => {
            if (audioRef.current) audioRef.current.currentTime = val
            seek(val)
          }}
        />
      </div>

      {/* Desktop: Right Controls */}
      <div className="hidden sm:flex items-center justify-end gap-2 w-1/3">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayMode}
          title={PLAY_MODE_LABELS[playMode]}
        >
          <PlayModeIcon mode={playMode} />
        </Button>
        <VolumeControl volume={volume} onVolumeChange={setVolume} />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <ListMusic className="h-5 w-5" />
              {playlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {playlist.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>播放列表 ({playlist.length})</SheetTitle>
                {playlist.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPlaylist}
                    className="text-muted-foreground hover:text-destructive mr-8"
                  >
                    清空
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
              {playlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无歌曲
                </div>
              ) : (
                playlist.map((song) => (
                  <SongItem
                    key={song.bvid}
                    song={song}
                    compact
                    showIndex={false}
                    onRemove={() => removeFromPlaylist(song.bvid)}
                  />
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

