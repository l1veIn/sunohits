import { BiliClient } from '@/lib/bili/client'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

// Chart configuration types
export type ChartId = 'top200' | 'daily' | 'weekly' | 'new' | 'dm' | 'stow'
export type OrderType = 'click' | 'pubdate' | 'dm' | 'stow'
export type TimeRange = '1d' | '1w' | '6m'

// Chart configurations
const CHART_CONFIGS: Record<ChartId, {
  order: OrderType
  timeRange: TimeRange
  maxPages: number
}> = {
  top200: { order: 'click', timeRange: '6m', maxPages: 10 },
  daily: { order: 'click', timeRange: '1d', maxPages: 5 },
  weekly: { order: 'click', timeRange: '1w', maxPages: 5 },
  new: { order: 'pubdate', timeRange: '1w', maxPages: 5 },
  dm: { order: 'dm', timeRange: '6m', maxPages: 5 },
  stow: { order: 'stow', timeRange: '6m', maxPages: 5 },
}

// Search keywords to combine for broader coverage
const SEARCH_KEYWORDS = ['suno', 'suno v5']

// Time range to seconds mapping
function getTimeRangeSeconds(range: TimeRange): number {
  switch (range) {
    case '1d': return 24 * 60 * 60
    case '1w': return 7 * 24 * 60 * 60
    case '6m': return 180 * 24 * 60 * 60
  }
}

export class CrawlerService {
  private supabase: SupabaseClient<Database>
  private bili: BiliClient

  constructor() {
    this.bili = BiliClient.getInstance()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  /**
   * Crawl all charts
   */
  async crawlAll() {
    console.log('Starting full crawl of all charts...')
    const results: Record<string, { success: boolean; count: number }> = {}

    for (const chartId of Object.keys(CHART_CONFIGS) as ChartId[]) {
      try {
        console.log(`\n=== Crawling chart: ${chartId} ===`)
        const result = await this.crawlChart(chartId)
        results[chartId] = { success: true, count: result.upserted }

        // Delay between charts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (e: any) {
        console.error(`Chart ${chartId} failed:`, e.message)
        results[chartId] = { success: false, count: 0 }
      }
    }

    return results
  }

  /**
   * Crawl a specific chart
   */
  async crawlChart(chartId: ChartId) {
    const config = CHART_CONFIGS[chartId]
    if (!config) throw new Error(`Unknown chart: ${chartId}`)

    console.log(`Crawling ${chartId}: order=${config.order}, timeRange=${config.timeRange}`)
    await this.logStatus('running', `${chartId}: 0/${config.maxPages}`)

    const DELAY_MS = 1500
    let totalSongs: Database['public']['Tables']['songs']['Insert'][] = []
    let errorCount = 0
    let lastError = ''

    try {
      for (let page = 1; page <= config.maxPages; page++) {
        try {
          console.log(`  Page ${page}/${config.maxPages}...`)
          const songs = await this.crawlPage(page, config.order, config.timeRange)
          totalSongs.push(...songs)
          console.log(`    Found ${songs.length} songs`)

          if (page < config.maxPages) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
          }
        } catch (e: any) {
          console.error(`  Page ${page} failed:`, e.message)
          errorCount++
          lastError = e.message
        }
      }

      if (errorCount === config.maxPages) {
        throw new Error(`All pages failed. Last error: ${lastError}`)
      }

      // Deduplicate songs by bvid (same video can appear on multiple pages)
      const uniqueSongsMap = new Map<string, Database['public']['Tables']['songs']['Insert']>()
      for (const song of totalSongs) {
        if (!uniqueSongsMap.has(song.bvid)) {
          uniqueSongsMap.set(song.bvid, song)
        }
      }
      const uniqueSongs = Array.from(uniqueSongsMap.values())
      console.log(`  Deduplicated: ${totalSongs.length} -> ${uniqueSongs.length} unique songs`)

      // Upsert songs and update chart rankings
      if (uniqueSongs.length > 0) {
        await this.upsertSongs(uniqueSongs)
        await this.updateChartRankings(chartId, uniqueSongs)
      }

      // Update chart last_crawled_at
      await (this.supabase.from('charts') as any).update({
        last_crawled_at: new Date().toISOString()
      }).eq('id', chartId)

      await this.logStatus('success', `${chartId}: ${config.maxPages}/${config.maxPages}`)
      return { success: true, upserted: totalSongs.length }

    } catch (e: any) {
      console.error(`Chart ${chartId} crawl failed:`, e)
      await this.logStatus('fail', chartId, e.message)
      return { success: false, upserted: 0, error: e.message }
    }
  }

  private async crawlPage(
    page: number,
    order: OrderType,
    timeRange: TimeRange
  ) {
    // Search multiple keywords and combine results
    const allResults: any[] = []
    const seenBvids = new Set<string>()

    for (const keyword of SEARCH_KEYWORDS) {
      try {
        const searchResult = await this.bili.search(keyword, page, order, 1) // duration=1 means <10min

        for (const item of searchResult.results) {
          if (!seenBvids.has(item.bvid)) {
            seenBvids.add(item.bvid)
            allResults.push(item)
          }
        }

        // Delay between keyword searches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (e: any) {
        console.warn(`    Search for "${keyword}" failed:`, e.message)
      }
    }

    // Sort by the relevant metric based on order type
    allResults.sort((a, b) => {
      switch (order) {
        case 'click': return (b.play || 0) - (a.play || 0)
        case 'pubdate': return (b.pubdate || 0) - (a.pubdate || 0)
        case 'dm': return (b.danmaku || 0) - (a.danmaku || 0)
        case 'stow': return (b.favorites || 0) - (a.favorites || 0)
        default: return 0
      }
    })

    // Filter by time range
    const now = Math.floor(Date.now() / 1000)
    const cutoff = now - getTimeRangeSeconds(timeRange)

    const filteredResults = allResults.filter((item: any) => {
      const pubdate = item.pubdate || 0
      return pubdate >= cutoff
    })

    // Fetch cid for each video
    const songs: Database['public']['Tables']['songs']['Insert'][] = []

    for (const item of filteredResults) {
      let cid: string | null = null
      try {
        cid = await this.bili.getVideoCid(item.bvid)
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (e) {
        console.warn(`    Failed to get cid for ${item.bvid}`)
      }

      songs.push({
        bvid: item.bvid,
        cid,
        title: item.title,
        pic: item.pic,
        owner_name: item.author,
        pubdate: item.pubdate,
        total_view: item.play
      })
    }

    console.log(`    Combined ${SEARCH_KEYWORDS.length} keywords: ${allResults.length} unique -> ${filteredResults.length} in time range`)
    return songs
  }

  private async upsertSongs(songs: Database['public']['Tables']['songs']['Insert'][]) {
    const { error: songError } = await this.supabase
      .from('songs')
      .upsert(songs as any, { onConflict: 'bvid' })

    if (songError) throw new Error(`Song upsert failed: ${songError.message}`)

    // Insert daily_stats
    const stats: Database['public']['Tables']['daily_stats']['Insert'][] = songs.map(s => ({
      bvid: s.bvid,
      view_count: s.total_view ?? 0
    }))

    const { error: statError } = await this.supabase
      .from('daily_stats')
      .insert(stats as any)

    if (statError) throw new Error(`Stats insert failed: ${statError.message}`)

    return songs.length
  }

  private async updateChartRankings(chartId: ChartId, songs: Database['public']['Tables']['songs']['Insert'][]) {
    // Clear existing rankings for this chart
    await this.supabase.from('chart_songs').delete().eq('chart_id', chartId)

    // Insert new rankings
    const rankings = songs.slice(0, 200).map((s, i) => ({
      chart_id: chartId,
      bvid: s.bvid,
      rank: i + 1
    }))

    const { error } = await this.supabase.from('chart_songs').insert(rankings as any)
    if (error) throw new Error(`Chart rankings update failed: ${error.message}`)

    console.log(`  Updated ${rankings.length} rankings for ${chartId}`)
  }

  private async logStatus(status: 'success' | 'fail' | 'running', processed: string, errorMsg?: string) {
    await this.supabase.from('crawl_metadata').upsert({
      id: 1,
      last_run_at: new Date().toISOString(),
      status,
      processed_pages: processed,
      last_error_message: errorMsg
    } as any)
  }

  // Legacy method for backward compatibility
  async crawl() {
    return this.crawlChart('top200')
  }
}
