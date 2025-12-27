import { NextRequest, NextResponse } from 'next/server'
import { BiliClient } from '@/lib/bili/client'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const mid = parseInt(searchParams.get('mid') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '30')
    const order = (searchParams.get('order') || 'pubdate') as 'pubdate' | 'click' | 'stow'

    if (!mid) {
        return NextResponse.json({
            success: false,
            error: 'Missing mid parameter'
        }, { status: 400 })
    }

    try {
        const bili = BiliClient.getInstance()
        const result = await bili.getUserVideos(mid, page, pageSize, order)

        return NextResponse.json({
            success: true,
            mid,
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            results: result.results.map((item: any) => ({
                bvid: item.bvid,
                title: item.title,
                pic: item.pic?.startsWith('//') ? `https:${item.pic}` : item.pic,
                play: item.play,
                pubdate: item.created,
                duration: item.length,
                author: item.author
            }))
        })
    } catch (error: any) {
        console.error('User videos API error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
