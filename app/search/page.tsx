'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, User, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { Song } from '@/lib/store/use-player-store'
import { SongList } from '@/components/song-list/song-list'
import Link from 'next/link'

// Filter options
const ORDER_OPTIONS = [
    { value: 'click', label: '最多播放' },
    { value: 'pubdate', label: '最新发布' },
    { value: 'dm', label: '最多弹幕' },
    { value: 'stow', label: '最多收藏' },
]

const TIME_OPTIONS = [
    { value: 0, label: '全部' },
    { value: 1, label: '最近一天' },
    { value: 7, label: '最近一周' },
    { value: 180, label: '最近半年' },
]

const DURATION_OPTIONS = [
    { value: 0, label: '全部时长' },
    { value: 1, label: '<10分钟' },
    { value: 2, label: '10-30分钟' },
    { value: 3, label: '30-60分钟' },
    { value: 4, label: '>60分钟' },
]

// Storage key for preferences
const STORAGE_KEY = 'sunohits-search-prefs'

interface VideoResult {
    bvid: string
    title: string
    pic: string
    author: string
    mid: number
    pubdate: number
    play: number
    duration: string
    danmaku: number
}

interface UserResult {
    mid: number
    name: string
    sign: string
    fans: number
    videos: number
    avatar: string
    level: number
    verified: boolean
    verifyDesc: string
}

// Filter button component
function FilterButton({
    active,
    onClick,
    children
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
        >
            {children}
        </button>
    )
}

// Toggle switch component
function Toggle({
    checked,
    onChange,
    label
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
}) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <div
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative w-10 h-5 rounded-full transition-colors",
                    checked ? "bg-green-500" : "bg-muted"
                )}
            >
                <div
                    className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                        checked ? "translate-x-5" : "translate-x-0.5"
                    )}
                />
            </div>
            <span className="text-sm">{label}</span>
        </label>
    )
}

export default function SearchPage() {
    // Search state
    const [keyword, setKeyword] = useState('suno')
    const [searchType, setSearchType] = useState<'video' | 'user'>('video')
    const [order, setOrder] = useState('click')
    const [timeFilter, setTimeFilter] = useState(0) // Default to all time
    const [duration, setDuration] = useState(0) // Default to all duration
    const [musicOnly, setMusicOnly] = useState(false)

    // Results state
    const [loading, setLoading] = useState(false)
    const [videoResults, setVideoResults] = useState<VideoResult[]>([])
    const [userResults, setUserResults] = useState<UserResult[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [totalResults, setTotalResults] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [numPages, setNumPages] = useState(0)
    const [loadingMore, setLoadingMore] = useState(false)

    // Load preferences from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const prefs = JSON.parse(saved)
                if (prefs.keyword) setKeyword(prefs.keyword)
                if (prefs.order) setOrder(prefs.order)
                if (prefs.timeFilter !== undefined) setTimeFilter(prefs.timeFilter)
                if (prefs.duration !== undefined) setDuration(prefs.duration)
                if (prefs.musicOnly !== undefined) setMusicOnly(prefs.musicOnly)
            }
        } catch (e) {
            console.error('Failed to load search preferences:', e)
        }
    }, [])

    // Save preferences to localStorage
    const savePrefs = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                keyword,
                order,
                timeFilter,
                duration,
                musicOnly
            }))
        } catch (e) {
            console.error('Failed to save search preferences:', e)
        }
    }, [keyword, order, timeFilter, duration, musicOnly])

    // Perform search
    const doSearch = useCallback(async (page: number = 1, append: boolean = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
            setHasSearched(true)
        }
        savePrefs()

        try {
            const params = new URLSearchParams({
                keyword,
                type: searchType,
                order,
                duration: duration.toString(),
                tids: musicOnly ? '3' : '0',
                page: page.toString(),
                timeRange: timeFilter.toString()
            })

            const res = await fetch(`/api/search?${params}`)
            const data = await res.json()

            if (data.success) {
                if (searchType === 'video') {
                    const results = data.results as VideoResult[]
                    if (append) {
                        // Deduplicate when appending
                        setVideoResults(prev => {
                            const existingBvids = new Set(prev.map(v => v.bvid))
                            const newVideos = results.filter(v => !existingBvids.has(v.bvid))
                            return [...prev, ...newVideos]
                        })
                    } else {
                        setVideoResults(results)
                    }
                    setTotalResults(data.total || results.length)
                    setNumPages(data.numPages || 1)
                    setCurrentPage(page)
                    setUserResults([])
                } else {
                    if (append) {
                        setUserResults(prev => {
                            const existingMids = new Set(prev.map(u => u.mid))
                            const newUsers = (data.results as UserResult[]).filter(u => !existingMids.has(u.mid))
                            return [...prev, ...newUsers]
                        })
                    } else {
                        setUserResults(data.results as UserResult[])
                    }
                    setTotalResults(data.total || data.results.length)
                    setNumPages(data.numPages || 1)
                    setCurrentPage(page)
                    setVideoResults([])
                }
            } else {
                console.error('Search failed:', data.error)
            }
        } catch (e) {
            console.error('Search error:', e)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [keyword, searchType, order, duration, musicOnly, timeFilter, savePrefs])

    // Handle page change (for pagination)
    const handlePageChange = (page: number) => {
        doSearch(page, false)
    }

    // Handle enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            doSearch()
        }
    }

    // Convert VideoResult to Song for SongItem
    const videoToSong = (video: VideoResult): Song => ({
        bvid: video.bvid,
        cid: null,
        title: video.title,
        pic: video.pic,
        owner_name: video.author,
        pubdate: video.pubdate,
        total_view: video.play
    })

    // Format number
    const formatNumber = (num: number): string => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万'
        }
        return num.toString()
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with search bar */}
            <header className="px-4 sm:px-6 py-4 border-b sticky top-0 bg-background/60 backdrop-blur-md z-10 shrink-0 space-y-4">
                {/* Search input */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="搜索..."
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={() => doSearch()} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
                    </Button>
                </div>

                {/* Result type tabs + Music toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setSearchType('video')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                                searchType === 'video'
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Video className="h-4 w-4" />
                            视频
                        </button>
                        <button
                            onClick={() => setSearchType('user')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                                searchType === 'user'
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <User className="h-4 w-4" />
                            用户
                        </button>
                    </div>

                    {searchType === 'video' && (
                        <Toggle
                            checked={musicOnly}
                            onChange={setMusicOnly}
                            label="仅音乐"
                        />
                    )}
                </div>

                {/* Video filters */}
                {searchType === 'video' && (
                    <div className="space-y-2">
                        {/* Order */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground w-16">排序</span>
                            {ORDER_OPTIONS.map(opt => (
                                <FilterButton
                                    key={opt.value}
                                    active={order === opt.value}
                                    onClick={() => setOrder(opt.value)}
                                >
                                    {opt.label}
                                </FilterButton>
                            ))}
                        </div>

                        {/* Time range */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground w-16">时间</span>
                            {TIME_OPTIONS.map(opt => (
                                <FilterButton
                                    key={opt.value}
                                    active={timeFilter === opt.value}
                                    onClick={() => setTimeFilter(opt.value)}
                                >
                                    {opt.label}
                                </FilterButton>
                            ))}
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground w-16">时长</span>
                            {DURATION_OPTIONS.map(opt => (
                                <FilterButton
                                    key={opt.value}
                                    active={duration === opt.value}
                                    onClick={() => setDuration(opt.value)}
                                >
                                    {opt.label}
                                </FilterButton>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Results */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Search className="h-12 w-12 mb-4 opacity-50" />
                        <p>输入关键词开始搜索</p>
                    </div>
                ) : searchType === 'video' && videoResults.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        没有找到相关视频
                    </div>
                ) : searchType === 'user' && userResults.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        没有找到相关用户
                    </div>
                ) : searchType === 'video' ? (
                    <SongList
                        songs={videoResults.map(videoToSong)}
                        loading={false}
                        currentPage={currentPage}
                        totalPages={numPages}
                        totalCount={totalResults}
                        onPageChange={handlePageChange}
                        showPlayAll={true}
                        showFavoriteAll={true}
                        showIndex={false}
                        emptyMessage="没有找到相关视频"
                    />
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-4">
                            显示 {userResults.length} 个用户{totalResults > userResults.length && `（共 ${totalResults} 个结果）`}
                        </p>
                        {userResults.map((user) => {
                            const userParams = new URLSearchParams({
                                name: user.name,
                                avatar: user.avatar,
                                fans: user.fans.toString(),
                                sign: user.sign || '',
                                level: user.level.toString(),
                                videos: user.videos.toString()
                            })
                            return (
                                <Link
                                    key={user.mid}
                                    href={`/user/${user.mid}?${userParams}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium">{user.name}</h3>
                                            {user.verified && (
                                                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                    {user.verifyDesc || '认证'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.sign || '暂无签名'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatNumber(user.fans)}粉丝 · {user.videos}视频
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={numPages}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
