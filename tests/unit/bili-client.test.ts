import { BiliClient } from '@/lib/bili/client'

// Mock global fetch
global.fetch = jest.fn()

describe('BiliClient', () => {
  let client: BiliClient

  beforeEach(() => {
    BiliClient.reset()
    client = BiliClient.getInstance()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should fetch nav keys correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          wbi_img: {
            img_url: 'https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png',
            sub_url: 'https://i0.hdslb.com/bfs/wbi/4932caff0ff746eab6f01bf08b70ac45.png'
          }
        }
      })
    })

    await client.getNav()
    
    // We can't easily check private fields, but we can check if fetch was called
    expect(global.fetch).toHaveBeenCalledWith('https://api.bilibili.com/x/web-interface/nav')
  })

  it('should sign search requests', async () => {
     // Mock getNav response first because search needs keys
     (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          wbi_img: {
            img_url: 'https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png',
            sub_url: 'https://i0.hdslb.com/bfs/wbi/4932caff0ff746eab6f01bf08b70ac45.png'
          }
        }
      })
    })
    
    // Mock search response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
            result: []
        }
      })
    })

    await client.search('test')

    expect(global.fetch).toHaveBeenCalledTimes(2) // Nav + Search
    
    // Check the search URL contains w_rid and wts
    const searchCall = (global.fetch as jest.Mock).mock.calls[1]
    const searchUrl = searchCall[0] as string
    expect(searchUrl).toContain('w_rid=')
    expect(searchUrl).toContain('wts=')
    expect(searchUrl).toContain('keyword=test')
  })
})
