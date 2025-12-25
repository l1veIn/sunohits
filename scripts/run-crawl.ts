// Simple script to trigger the crawler
// Usage: npx tsx scripts/run-crawl.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { CrawlerService } from '../lib/services/crawler'

async function main() {
    console.log('🕷️ Starting SUNO AI music crawler...')
    console.log('📝 This will crawl all charts from Bilibili')
    console.log('')

    const crawler = new CrawlerService()

    try {
        const results = await crawler.crawlAll()

        console.log('')
        console.log('✅ Crawl completed!')
        console.log('📊 Results:')
        for (const [chartId, result] of Object.entries(results)) {
            console.log(`   ${chartId}: ${result.success ? '✓' : '✗'} (${result.count} songs)`)
        }
    } catch (error: any) {
        console.error('❌ Error running crawler:', error.message)
        process.exit(1)
    }
}

main()

