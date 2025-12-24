'use client'

import { useEffect } from 'react'
import { Song } from '@/lib/store/use-player-store'

interface UseMediaSessionProps {
  song: Song | null
  isPlaying: boolean
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
}

export function useMediaSession({
  song,
  isPlaying,
  play,
  pause,
  next,
  prev,
  seek
}: UseMediaSessionProps) {
  useEffect(() => {
    if (!window.navigator.mediaSession) return

    if (song) {
      window.navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.owner_name,
        artwork: [
          { src: song.pic, sizes: '96x96', type: 'image/jpeg' },
          { src: song.pic, sizes: '128x128', type: 'image/jpeg' },
          { src: song.pic, sizes: '192x192', type: 'image/jpeg' },
          { src: song.pic, sizes: '256x256', type: 'image/jpeg' },
          { src: song.pic, sizes: '384x384', type: 'image/jpeg' },
          { src: song.pic, sizes: '512x512', type: 'image/jpeg' },
        ]
      })
    } else {
        window.navigator.mediaSession.metadata = null
    }
  }, [song])

  useEffect(() => {
    if (!window.navigator.mediaSession) return

    window.navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  useEffect(() => {
    if (!window.navigator.mediaSession) return

    const actionHandlers = [
      ['play', play],
      ['pause', pause],
      ['previoustrack', prev],
      ['nexttrack', next],
      ['seekto', (details: MediaSessionActionDetails) => {
          if (details.seekTime !== undefined) seek(details.seekTime)
      }],
    ] as const

    for (const [action, handler] of actionHandlers) {
      try {
        window.navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler)
      } catch (e) {
        console.warn(`Warning! The media session action "${action}" is not supported yet.`)
      }
    }
  }, [play, pause, next, prev, seek])
}
