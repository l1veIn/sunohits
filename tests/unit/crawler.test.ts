import { CrawlerService } from '@/lib/services/crawler'
import { BiliClient } from '@/lib/bili/client'

// Mock dependencies
jest.mock('@/lib/bili/client')
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null })
  })
}))

// Mock env
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'

describe('CrawlerService', () => {
  let crawler: CrawlerService

  beforeEach(() => {
    // Clear mocks
    (BiliClient.getInstance as jest.Mock).mockReturnValue({
        search: jest.fn().mockResolvedValue([
            { bvid: 'BV1', title: 'Song 1', pic: 'pic1', author: 'auth1', pubdate: 100, play: 1000 }
        ])
    })
    crawler = new CrawlerService()
  })

  it('should crawl pages and upsert data', async () => {
    const result = await crawler.crawl()
    expect(result.success).toBe(true)
    expect(result.processed).toBe(50) // Assuming default 50 pages
  }, 10000) // Increase timeout for loop simulation if needed
})
