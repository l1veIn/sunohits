import { NextRequest, NextResponse } from 'next/server'
import { BiliClient } from '@/lib/bili/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bvid = searchParams.get('bvid')
  const cid = searchParams.get('cid')

  if (!bvid || !cid) {
    return NextResponse.json({ error: 'Missing bvid or cid' }, { status: 400 })
  }

  try {
    const client = BiliClient.getInstance()
    // 1. Resolve Stream URL
    const playUrl = await client.getPlayUrl(bvid, cid)

    // 2. Prepare headers for upstream
    const headers = new Headers()
    headers.set('Referer', 'https://www.bilibili.com')
    headers.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    // Forward Range header if present
    const range = req.headers.get('range')
    if (range) {
      headers.set('Range', range)
    }

    // 3. Fetch upstream
    const upstreamRes = await fetch(playUrl, { headers })

    if (!upstreamRes.ok) {
       console.error(`Upstream error: ${upstreamRes.status} ${upstreamRes.statusText}`)
       return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
    }

    // 4. Stream response
    const responseHeaders = new Headers()
    const contentType = upstreamRes.headers.get('Content-Type')
    if (contentType) responseHeaders.set('Content-Type', contentType)
    
    const contentLength = upstreamRes.headers.get('Content-Length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)
    
    const contentRange = upstreamRes.headers.get('Content-Range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)
    
    responseHeaders.set('Accept-Ranges', 'bytes')

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders
    })

  } catch (error: any) {
    console.error('Play proxy error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
