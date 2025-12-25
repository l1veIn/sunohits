'use client'

import { useState, useEffect, useMemo } from 'react'
import { VirtualList } from '@/components/song-list/virtual-list'
import { ChartTabs, ChartId, CHARTS } from '@/components/chart-tabs'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Song, usePlayerStore } from '@/lib/store/use-player-store'
import { useBlockedStore } from '@/lib/store/use-blocked-store'
import { Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
    const [currentChart, setCurrentChart] = useState<ChartId>('top200')
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const playAll = usePlayerStore(state => state.playAll)
    const { isBlocked, block } = useBlockedStore()

    useEffect(() => {
        async function fetchSongs() {
            setLoading(true)
            try {
                const res = await fetch(`/api/charts?chart=${currentChart}`)
                const data = await res.json()
                setSongs(data.songs || [])
            } catch (e) {
                console.error('Failed to fetch songs:', e)
                setSongs([])
            } finally {
                setLoading(false)
            }
        }

        fetchSongs()
    }, [currentChart])

    // Filter out blocked songs
    const filteredSongs = useMemo(() => {
        return songs.filter(s => !isBlocked(s.bvid))
    }, [songs, isBlocked])

    const currentChartInfo = CHARTS.find(c => c.id === currentChart)

    const handlePlayAll = () => {
        if (filteredSongs.length > 0) {
            playAll(filteredSongs)
        }
    }

    const handleBlock = (bvid: string) => {
        block(bvid)
    }

    return (
        <div className="flex flex-col h-full">
            <header className="px-4 sm:px-6 py-4 border-b sticky top-0 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-10 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Suno Hits</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            {currentChartInfo?.description || 'AI Music Charts from Bilibili'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handlePlayAll}
                            disabled={loading || filteredSongs.length === 0}
                            className="gap-1"
                        >
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">播放全部</span>
                        </Button>
                        <ThemeSwitcher />
                    </div>
                </div>
                <ChartTabs current={currentChart} onChange={setCurrentChart} />
            </header>

            <div className="flex-1 p-4 sm:p-6 min-h-0">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredSongs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        暂无数据，请先运行爬虫
                    </div>
                ) : (
                    <VirtualList songs={filteredSongs} onBlock={handleBlock} />
                )}
            </div>
        </div>
    )
}
