import { CrawlerService } from '@/lib/services/crawler'
import { BiliClient } from '@/lib/bili/client'

// Mock dependencies
jest.mock('@/lib/bili/client')
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockReturnThis()
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
        { bvid: 'BV1', title: 'Song 1', pic: 'pic1', author: 'auth1', pubdate: Math.floor(Date.now() / 1000), play: 1000 }
      ]),
      getVideoCid: jest.fn().mockResolvedValue('cid123')
    })
    crawler = new CrawlerService()
  })

  it('should crawl chart and upsert data', async () => {
    const result = await crawler.crawlChart('top200')
    expect(result.success).toBe(true)
    expect(result.upserted).toBeGreaterThan(0)
  }, 30000)
})

