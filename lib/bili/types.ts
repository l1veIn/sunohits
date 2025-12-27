export interface NavResponse {
  code: number
  message: string
  data: {
    wbi_img: {
      img_url: string
      sub_url: string
    }
    isLogin: boolean
  }
}

export interface SearchResponse {
  code: number
  message: string
  data: {
    result: {
      bvid: string
      title: string
      pic: string
      author: string
      pubdate: number
      play: number
    }[]
  }
}

export interface PlayUrlResponse {
  code: number
  message: string
  data: {
    dash: {
      audio: Array<{
        id: number
        baseUrl: string
        bandwidth: number
      }>
    }
  }
}

export interface UserSearchResult {
  mid: number
  uname: string
  usign: string
  fans: number
  videos: number
  upic: string
  level: number
  official_verify: {
    type: number
    desc: string
  }
}