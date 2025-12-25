import { NavResponse, SearchResponse, PlayUrlResponse } from './types'
import { encWbi } from './wbi'

export class BiliClient {
  private static instance: BiliClient
  private imgKey: string | null = null
  private subKey: string | null = null

  private constructor() { }

  static getInstance(): BiliClient {
    if (!BiliClient.instance) {
      BiliClient.instance = new BiliClient()
    }
    return BiliClient.instance
  }

  static reset() {
    // @ts-ignore
    BiliClient.instance = null
  }

  async getNav(): Promise<void> {
    try {
      const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      if (!res.ok) throw new Error('Failed to fetch nav')

      const json = (await res.json()) as NavResponse
      // Nav API returns wbi_img even when not logged in (code -101)
      // We only need the wbi_img data, so we check if it exists
      if (!json.data?.wbi_img) {
        throw new Error(`Nav API error: ${json.message || 'No wbi_img data'}`)
      }

      const { img_url, sub_url } = json.data.wbi_img
      this.imgKey = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'))
      this.subKey = sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'))
    } catch (error) {
      console.error('Error fetching WBI keys:', error)
      throw error
    }
  }

  /**
   * Search for videos on Bilibili
   * @param keyword Search keyword
   * @param page Page number (default: 1)
   * @param order Sort order: 'click' (plays), 'pubdate' (newest), 'dm' (danmaku), 'stow' (favorites)
   * @param duration Duration filter: 0 (all), 1 (<10min), 2 (10-30min), 3 (30-60min), 4 (>60min)
   */
  async search(
    keyword: string,
    page: number = 1,
    order: 'click' | 'pubdate' | 'dm' | 'stow' = 'click',
    duration: 0 | 1 | 2 | 3 | 4 = 1
  ): Promise<SearchResponse['data']['result']> {
    if (!this.imgKey || !this.subKey) {
      await this.getNav()
    }

    if (!this.imgKey || !this.subKey) {
      throw new Error('WBI keys not initialized')
    }

    const params: Record<string, string | number> = {
      keyword,
      search_type: 'video',
      page,
      order,
    }

    // Only add duration filter if not 0 (all)
    if (duration > 0) {
      params.duration = duration
    }

    const query = encWbi(params, this.imgKey, this.subKey)
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/all/v2?${query}`

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://search.bilibili.com',
          'Origin': 'https://search.bilibili.com',
          'Cookie': 'buvid3=placeholder' // Minimal cookie to pass validation
        }
      })
      if (!res.ok) throw new Error(`Search failed: ${res.status}`)

      const json = await res.json()
      if (json.code !== 0) {
        // Sometimes code -412 is rate limit
        throw new Error(`Search API error: ${json.code} - ${json.message}`)
      }

      // The search API returns a mixed array of result types (video, user, etc)
      // We need to find the video results specifically
      // Structure: data.result = [{ result_type: 'video', data: [...videos] }, ...]
      // OR direct array of videos in some cases
      const results = json.data?.result || []

      // If results is an array of video objects directly (has bvid)
      if (results.length > 0 && results[0]?.bvid) {
        return results
      }

      // If results is an array of result type objects
      const videoSection = results.find((r: any) =>
        r.result_type === 'video' || r.type === 'video'
      )

      if (videoSection?.data) {
        return videoSection.data
      }

      // Fallback: filter for objects that have bvid
      return results.filter((r: any) => r.bvid)
    } catch (error) {
      console.error(`Error searching for ${keyword} page ${page}:`, error)
      throw error
    }
  }

  /**
   * Get video CID from BVID by calling View API
   */
  async getVideoCid(bvid: string): Promise<string> {
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      })
      if (!res.ok) throw new Error(`View API failed: ${res.status}`)

      const json = await res.json()
      if (json.code !== 0) throw new Error(`View API error: ${json.code} - ${json.message}`)

      // Return first page's cid (most videos have single page)
      const cid = json.data?.cid || json.data?.pages?.[0]?.cid
      if (!cid) throw new Error('No CID found in video info')

      return String(cid)
    } catch (error) {
      console.error(`Error fetching CID for ${bvid}:`, error)
      throw error
    }
  }

  async getPlayUrl(bvid: string, cid: string): Promise<string> {
    if (!this.imgKey || !this.subKey) {
      await this.getNav()
    }
    if (!this.imgKey || !this.subKey) throw new Error('WBI keys not initialized')

    const params = {
      bvid,
      cid,
      qn: 0,
      fnval: 16, // DASH
      fnver: 0,
      fourk: 1
    }

    const query = encWbi(params, this.imgKey, this.subKey)
    const url = `https://api.bilibili.com/x/player/wbi/playurl?${query}`

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      })
      if (!res.ok) throw new Error(`PlayUrl failed: ${res.status}`)

      const json = (await res.json()) as PlayUrlResponse
      if (json.code !== 0) throw new Error(`PlayUrl API error: ${json.code} - ${json.message}`)

      if (json.data.dash && json.data.dash.audio && json.data.dash.audio.length > 0) {
        return json.data.dash.audio[0].baseUrl
      }

      throw new Error('No audio stream found')
    } catch (error) {
      console.error(`Error fetching play url for ${bvid}:`, error)
      throw error
    }
  }
}