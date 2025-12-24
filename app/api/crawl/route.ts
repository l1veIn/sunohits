import { CrawlerService } from '@/lib/services/crawler'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Missing or invalid header' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Invalid token' }, { status: 401 })
  }

  const crawler = new CrawlerService()

  // Trigger crawl in background (or wait if < 50 pages / fast enough)
  // Vercel Serverless Functions have a timeout (10s-60s usually on hobby, longer on pro).
  // 50 pages with 3 concurrency might take > 10s.
  // Best practice for long running jobs on Vercel is to separate trigger and processing, 
  // or use Vercel Cron which calls this endpoint.
  // If we wait, we might timeout.
  // However, for "Personal" hobby projects, simple waiting might work if fast enough or we just accept timeout risk.
  // Let's await it for now to see the result, but typically we'd return 202 if it's long.
  // Given SC-001 says "process 50 pages under 5 minutes", Vercel Pro allows 5 min functions. Hobby is 10s (Edge) or 60s (Serverless).
  // 50 pages / 3 concurrency = 17 batches. If each batch takes 0.5s => 8.5s. If 1s => 17s.
  // It might be tight on Hobby.
  
  try {
    const result = await crawler.crawl()
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Crawl completed', data: result })
    } else {
      return NextResponse.json({ success: false, message: `Crawl failed: ${result.error}`, data: result }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, message: `Internal Error: ${e.message}` }, { status: 500 })
  }
}
