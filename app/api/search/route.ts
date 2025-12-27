import { NextRequest, NextResponse } from 'next/server'
import { BiliClient } from '@/lib/bili/client'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('keyword') || 'suno'
    const page = parseInt(searchParams.get('page') || '1')
    const order = (searchParams.get('order') || 'click') as 'click' | 'pubdate' | 'dm' | 'stow'
    const duration = parseInt(searchParams.get('duration') || '0') as 0 | 1 | 2 | 3 | 4
    const tids = parseInt(searchParams.get('tids') || '0')
    const timeRange = parseInt(searchParams.get('timeRange') || '0') // Days: 0=all, 1=day, 7=week, 180=6months
    const type = searchParams.get('type') || 'video' // 'video' or 'user'

    try {
        const bili = BiliClient.getInstance()

        if (type === 'user') {
            const userOrder = order === 'click' ? '0' : (order === 'pubdate' ? 'fans' : '0')
            const results = await bili.searchUsers(keyword, page, userOrder as 'fans' | 'level' | '0')

            return NextResponse.json({
                success: true,
                type: 'user',
                keyword,
                page,
                results: results.map(user => ({
                    mid: user.mid,
                    name: user.uname,
                    sign: user.usign,
                    fans: user.fans,
                    videos: user.videos,
                    avatar: user.upic?.startsWith('//') ? `https:${user.upic}` : user.upic,
                    level: user.level,
                    verified: user.official_verify?.type >= 0,
                    verifyDesc: user.official_verify?.desc || ''
                })),
                total: results.length
            })
        }

        // Video search
        const searchResult = await bili.search(keyword, page, order, duration, tids, timeRange)

        return NextResponse.json({
            success: true,
            type: 'video',
            keyword,
            page,
            order,
            duration,
            tids,
            results: searchResult.results.map((item: any) => ({
                bvid: item.bvid,
                title: item.title?.replace(/<[^>]+>/g, '') || '', // Remove HTML tags
                pic: item.pic?.startsWith('//') ? `https:${item.pic}` : item.pic,
                author: item.author,
                mid: item.mid,
                pubdate: item.pubdate,
                play: item.play,
                duration: item.duration,
                danmaku: item.danmaku,
                favorites: item.favorites
            })),
            total: searchResult.numResults,
            numPages: searchResult.numPages,
            pageSize: searchResult.pageSize
        })
    } catch (error: any) {
        console.error('Search API error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
