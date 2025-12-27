'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Loader2, ExternalLink, Users, Video, ChevronLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SongList } from '@/components/song-list/song-list'
import { Song } from '@/lib/store/use-player-store'
import Link from 'next/link'

interface VideoItem {
    bvid: string
    title: string
    pic: string
    play: number
    pubdate: number
    author: string
}

// Format number
function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
}

export default function UserPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    const mid = typeof params.mid === 'string' ? parseInt(params.mid) : 0

    // Get user info from URL params (passed from search page)
    const userName = searchParams.get('name') || ''
    const userAvatar = searchParams.get('avatar') || ''
    const userFans = parseInt(searchParams.get('fans') || '0')
    const userSign = searchParams.get('sign') || ''
    const userLevel = parseInt(searchParams.get('level') || '0')
    const userVideoCount = parseInt(searchParams.get('videos') || '0')

    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<VideoItem[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's videos using search API (fallback from user videos API due to -352 error)
    const fetchVideos = useCallback(async (pageNum: number) => {
        if (!userName) {
            setError('缺少用户信息')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Use search API with username (without @ - @username searches for mentions, not uploads)
            const res = await fetch(`/api/search?keyword=${encodeURIComponent(userName)}&type=video&tids=0&order=pubdate&page=${pageNum}&timeRange=0&duration=0`)
            const data = await res.json()

            if (data.success) {
                // Filter to only show videos from this user (matching mid)
                const userVideos = data.results
                    .filter((v: any) => v.mid === mid)
                    .map((v: any) => ({
                        bvid: v.bvid,
                        title: v.title,
                        pic: v.pic,
                        play: v.play,
                        pubdate: v.pubdate,
                        author: v.author
                    }))

                setVideos(userVideos)
                setTotalPages(data.numPages || 1)
            } else {
                setError(data.error || '加载失败')
            }
        } catch (e) {
            setError('加载失败')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [mid, userName])

    useEffect(() => {
        fetchVideos(1)
    }, [fetchVideos])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        fetchVideos(newPage)
    }

    // Convert video to Song format for SongItem
    const videoToSong = (video: VideoItem): Song => ({
        bvid: video.bvid,
        cid: null,
        title: video.title,
        pic: video.pic,
        owner_name: userName,
        pubdate: video.pubdate,
        total_view: video.play
    })

    if (!userName) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">请通过搜索页面访问用户主页</p>
                <Button asChild variant="outline">
                    <Link href="/search">
                        <Search className="h-4 w-4 mr-1" />
                        去搜索
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="px-4 sm:px-6 py-4 border-b sticky top-0 bg-background/60 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    {/* Back button */}
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/search">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>

                    {/* Avatar */}
                    {userAvatar && (
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    )}

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold truncate">{userName}</h1>
                            {userLevel > 0 && (
                                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                    Lv{userLevel}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{userSign || '暂无签名'}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {formatNumber(userFans)} 粉丝
                            </span>
                            {userVideoCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <Video className="h-4 w-4" />
                                    {userVideoCount} 视频
                                </span>
                            )}
                        </div>
                    </div>

                    {/* External link */}
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={`https://space.bilibili.com/${mid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            B站主页
                        </a>
                    </Button>
                </div>
            </header>

            {/* Videos list */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                        <Video className="h-12 w-12" />
                        <p>未找到该用户的音乐作品</p>
                        <p className="text-xs">尝试在 B 站查看更多内容</p>
                    </div>
                ) : (
                    <SongList
                        songs={videos.map(videoToSong)}
                        loading={false}
                        currentPage={page}
                        totalPages={totalPages}
                        totalCount={userVideoCount > 0 ? userVideoCount : undefined}
                        onPageChange={handlePageChange}
                        showPlayAll={true}
                        showFavoriteAll={true}
                        showIndex={false}
                        emptyMessage="未找到该用户的音乐作品"
                    />
                )}
            </div>
        </div>
    )
}
