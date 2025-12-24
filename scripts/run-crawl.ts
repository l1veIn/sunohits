// Simple script to trigger the crawler
// Usage: npx tsx scripts/run-crawl.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { CrawlerService } from '../lib/services/crawler'

async function main() {
    console.log('🕷️ Starting SUNO AI music crawler...')
    console.log('📝 This will crawl 50 pages of SUNO V5 videos from Bilibili')
    console.log('')

    const crawler = new CrawlerService()

    try {
        const result = await crawler.crawl()

        if (result.success) {
            console.log('')
            console.log('✅ Crawl completed successfully!')
            console.log(`📊 Pages crawled: ${result.processed}`)
            console.log(`🎵 Songs upserted: ${result.upserted}`)
        } else {
            console.error('')
            console.error('❌ Crawl failed:', result.error)
        }
    } catch (error: any) {
        console.error('❌ Error running crawler:', error.message)
        process.exit(1)
    }
}

main()
