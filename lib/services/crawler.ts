import { BiliClient } from '@/lib/bili/client'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import pLimit from 'p-limit'
import { Database } from '@/lib/supabase/types'

export class CrawlerService {
  private supabase: SupabaseClient<Database>
  private bili: BiliClient

  constructor() {
    this.bili = BiliClient.getInstance()
    // Use Service Role Key for admin access (ingestion)
    // Fallback to Anon key if Service Key missing (though likely will fail RLS if not public)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async crawl() {
    console.log('Starting crawl...')
    await this.logStatus('running', '0/10')

    // Reduced to 10 pages and sequential requests to avoid rate limiting (HTTP 412)
    const MAX_PAGES = 10
    const DELAY_MS = 1500 // 1.5 second delay between requests

    let processedCount = 0
    let totalUpserted = 0
    let errorCount = 0
    let lastError = ''

    try {
      for (let page = 1; page <= MAX_PAGES; page++) {
        try {
          console.log(`Crawling page ${page}/${MAX_PAGES}...`)
          const songs = await this.crawlPage(page)
          if (songs.length > 0) {
            const count = await this.upsertSongs(songs)
            totalUpserted += count
            console.log(`  Found ${songs.length} songs, upserted ${count}`)
          }
          processedCount++

          // Add delay between requests to avoid rate limiting
          if (page < MAX_PAGES) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
          }
        } catch (e: any) {
          console.error(`Page ${page} failed:`, e.message)
          errorCount++
          lastError = e.message
          // Continue to next page even if one fails
        }
      }

      if (errorCount === MAX_PAGES) {
        throw new Error(`All pages failed. Last error: ${lastError}`)
      }

      await this.logStatus('success', `${MAX_PAGES}/${MAX_PAGES}`)
      return { success: true, processed: processedCount, upserted: totalUpserted }

    } catch (e: any) {
      console.error('Crawl failed:', e)
      await this.logStatus('fail', `${processedCount}/${MAX_PAGES}`, e.message)
      return { success: false, processed: processedCount, error: e.message }
    }
  }

  private async crawlPage(page: number) {
    const results = await this.bili.search('SUNO V5', page)
    return results.map(item => ({
      bvid: item.bvid,
      title: item.title,
      pic: item.pic,
      owner_name: item.author,
      pubdate: item.pubdate,
      total_view: item.play
    }))
  }

  private async upsertSongs(songs: Database['public']['Tables']['songs']['Insert'][]) {
    // 1. Upsert songs
    const { error: songError } = await this.supabase
      .from('songs')
      .upsert(songs, { onConflict: 'bvid' })

    if (songError) throw new Error(`Song upsert failed: ${songError.message}`)

    // 2. Insert daily_stats
    // We need to map songs to daily_stats entries
    const stats: Database['public']['Tables']['daily_stats']['Insert'][] = songs.map(s => ({
      bvid: s.bvid,
      view_count: s.total_view ?? 0
    }))

    const { error: statError } = await this.supabase
      .from('daily_stats')
      .insert(stats)

    if (statError) throw new Error(`Stats insert failed: ${statError.message}`)

    return songs.length
  }

  private async logStatus(status: 'success' | 'fail' | 'running', processed: string, errorMsg?: string) {
    await this.supabase.from('crawl_metadata').upsert({
      id: 1,
      last_run_at: new Date().toISOString(),
      status,
      processed_pages: processed,
      last_error_message: errorMsg
    })
  }
}
