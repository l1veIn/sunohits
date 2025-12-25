import { CrawlerService, ChartId } from '@/lib/services/crawler'
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

  // Check for specific chart parameter
  const chartId = req.nextUrl.searchParams.get('chart') as ChartId | null

  try {
    if (chartId) {
      // Crawl specific chart
      console.log(`Crawling specific chart: ${chartId}`)
      const result = await crawler.crawlChart(chartId)
      return NextResponse.json({
        success: result.success,
        message: result.success ? `Chart ${chartId} crawled` : `Chart ${chartId} failed`,
        data: result
      })
    } else {
      // Crawl all charts
      console.log('Crawling all charts...')
      const result = await crawler.crawlAll()
      return NextResponse.json({ success: true, message: 'All charts crawled', data: result })
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, message: `Internal Error: ${e.message}` }, { status: 500 })
  }
}
