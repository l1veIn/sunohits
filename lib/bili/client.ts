import { NavResponse, SearchResponse, PlayUrlResponse, UserSearchResult } from './types'
import { encWbi } from './wbi'

export interface SearchResult {
  results: any[]
  numPages: number
  numResults: number
  pageSize: number
  page: number
}

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
   * @param tids Category filter: 0 (all), 3 (music), etc.
   * @param timeRange Time range in days: 0 (all), 1 (1 day), 7 (1 week), 180 (6 months)
   */
  async search(
    keyword: string,
    page: number = 1,
    order: 'click' | 'pubdate' | 'dm' | 'stow' = 'click',
    duration: 0 | 1 | 2 | 3 | 4 = 1,
    tids: number = 0,
    timeRange: number = 0
  ): Promise<SearchResult> {
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
      page_size: 50, // Max is 50
      order,
    }

    // Only add duration filter if not 0 (all)
    if (duration > 0) {
      params.duration = duration
    }

    // Only add tids filter if not 0 (all)
    if (tids > 0) {
      params.tids = tids
    }

    // Add time range filter if specified
    if (timeRange > 0) {
      const now = Math.floor(Date.now() / 1000)
      const beginTime = now - timeRange * 24 * 60 * 60
      params.pubtime_begin_s = beginTime
      params.pubtime_end_s = now
    }

    const query = encWbi(params, this.imgKey, this.subKey)
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/type?${query}`

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

      // The search/type API returns results directly in data.result array
      // Also includes pagination info: numPages, numResults, pagesize, page
      const results = json.data?.result || []
      return {
        results,
        numPages: json.data?.numPages || 0,
        numResults: json.data?.numResults || 0,
        pageSize: json.data?.pagesize || 50,
        page: json.data?.page || page
      }
    } catch (error) {
      console.error(`Error searching for ${keyword} page ${page}:`, error)
      throw error
    }
  }

  /**
   * Search for users on Bilibili
   * @param keyword Search keyword
   * @param page Page number (default: 1)
   * @param order Sort order: 'fans' (followers), 'level' (user level), '0' (default)
   */
  async searchUsers(
    keyword: string,
    page: number = 1,
    order: 'fans' | 'level' | '0' = '0'
  ): Promise<UserSearchResult[]> {
    if (!this.imgKey || !this.subKey) {
      await this.getNav()
    }

    if (!this.imgKey || !this.subKey) {
      throw new Error('WBI keys not initialized')
    }

    const params: Record<string, string | number> = {
      keyword,
      search_type: 'bili_user',
      page,
      page_size: 50, // Max is 50
      order,
    }

    const query = encWbi(params, this.imgKey, this.subKey)
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/type?${query}`

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://search.bilibili.com',
          'Origin': 'https://search.bilibili.com',
          'Cookie': 'buvid3=placeholder'
        }
      })
      if (!res.ok) throw new Error(`User search failed: ${res.status}`)

      const json = await res.json()
      if (json.code !== 0) {
        throw new Error(`User search API error: ${json.code} - ${json.message}`)
      }

      return json.data?.result || []
    } catch (error) {
      console.error(`Error searching users for ${keyword} page ${page}:`, error)
      throw error
    }
  }

  /**
   * Get videos from a user's space
   * @param mid User ID
   * @param page Page number (default: 1)
   * @param pageSize Page size (default: 30, max 50)
   * @param order Sort order: 'pubdate' (newest), 'click' (most played), 'stow' (most collected)
   */
  async getUserVideos(
    mid: number,
    page: number = 1,
    pageSize: number = 30,
    order: 'pubdate' | 'click' | 'stow' = 'pubdate'
  ): Promise<{ results: any[], total: number, page: number, pageSize: number }> {
    if (!this.imgKey || !this.subKey) {
      await this.getNav()
    }

    if (!this.imgKey || !this.subKey) {
      throw new Error('WBI keys not initialized')
    }

    const params: Record<string, string | number> = {
      mid,
      ps: pageSize,
      pn: page,
      order,
      tid: 0, // All categories
    }

    const query = encWbi(params, this.imgKey, this.subKey)
    const url = `https://api.bilibili.com/x/space/wbi/arc/search?${query}`

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': `https://space.bilibili.com/${mid}`,
          'Origin': 'https://space.bilibili.com',
          'Cookie': 'buvid3=placeholder'
        }
      })
      if (!res.ok) throw new Error(`User videos API failed: ${res.status}`)

      const json = await res.json()
      if (json.code !== 0) {
        throw new Error(`User videos API error: ${json.code} - ${json.message}`)
      }

      const vlist = json.data?.list?.vlist || []
      return {
        results: vlist,
        total: json.data?.page?.count || 0,
        page: json.data?.page?.pn || page,
        pageSize: json.data?.page?.ps || pageSize
      }
    } catch (error) {
      console.error(`Error fetching videos for user ${mid}:`, error)
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