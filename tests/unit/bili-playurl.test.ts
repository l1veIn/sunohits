import { BiliClient } from '@/lib/bili/client'

// Mock global fetch
global.fetch = jest.fn()

describe('BiliClient - PlayUrl', () => {
  let client: BiliClient

  beforeEach(() => {
    BiliClient.reset()
    client = BiliClient.getInstance()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should fetch dash stream url correctly', async () => {
    // 1. Mock Nav (for keys)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          wbi_img: {
            img_url: 'https://i0.hdslb.com/bfs/wbi/img_key.png',
            sub_url: 'https://i0.hdslb.com/bfs/wbi/sub_key.png'
          }
        }
      })
    })

    // 2. Mock PlayUrl response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          dash: {
            audio: [
              {
                id: 30280,
                baseUrl: 'https://example.com/audio.m4s',
                bandwidth: 300000
              }
            ]
          }
        }
      })
    })

    const result = await client.getPlayUrl('BV1xx411c7X7', '123456')

    // Verify Nav was called
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://api.bilibili.com/x/web-interface/nav')

    // Verify PlayUrl was called with correct params
    const playUrlCall = (global.fetch as jest.Mock).mock.calls[1]
    const url = playUrlCall[0] as string
    expect(url).toContain('api.bilibili.com/x/player/wbi/playurl')
    expect(url).toContain('bvid=BV1xx411c7X7')
    expect(url).toContain('cid=123456')
    expect(url).toContain('fnval=16')
    expect(url).toContain('w_rid=') // Signed

    // Verify Result
    expect(result).toBe('https://example.com/audio.m4s')
  })
})
