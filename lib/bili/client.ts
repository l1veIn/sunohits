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

  async search(keyword: string, page: number = 1): Promise<SearchResponse['data']['result']> {
    if (!this.imgKey || !this.subKey) {
      await this.getNav()
    }

    if (!this.imgKey || !this.subKey) {
      throw new Error('WBI keys not initialized')
    }

    const params = {
      keyword,
      search_type: 'video',
      page,
      order: 'click', // popularity
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

      const json = (await res.json()) as SearchResponse
      if (json.code !== 0) {
        // Sometimes code -412 is rate limit
        throw new Error(`Search API error: ${json.code} - ${json.message}`)
      }

      return json.data.result || []
    } catch (error) {
      console.error(`Error searching for ${keyword} page ${page}:`, error)
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