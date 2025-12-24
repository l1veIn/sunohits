import md5 from 'md5'

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]

/**
 * Parameter mixing for WBI signature
 * @param orig Original key (img_key + sub_key)
 * @returns Mixed key
 */
export function getMixinKey(orig: string): string {
  let temp = ''
  for (let i = 0; i < mixinKeyEncTab.length; i++) {
    temp += orig[mixinKeyEncTab[i]]
  }
  return temp.slice(0, 32)
}

/**
 * Encode parameters with WBI signature
 * @param params Query parameters object
 * @param imgKey img_key from Bilibili nav API
 * @param subKey sub_key from Bilibili nav API
 * @returns Query string with w_rid and wts
 */
export function encWbi(params: Record<string, any>, imgKey: string, subKey: string): string {
  const mixinKey = getMixinKey(imgKey + subKey)
  const currTime = Math.round(Date.now() / 1000)
  
  const chrFilter = /[!'()*]/g

  const queryParams = { ...params }
  queryParams.wts = currTime

  // Sort keys
  const sortedKeys = Object.keys(queryParams).sort()
  
  let queryStr = ''
  
  for (const key of sortedKeys) {
    let value = queryParams[key]
    if (value === undefined || value === null) continue
    
    // Convert numbers/objects to string
    value = String(value)
    
    // RFC 3986 encoding
    const encodedValue = encodeURIComponent(value).replace(chrFilter, (c) => {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
    
    if (queryStr) {
      queryStr += '&'
    }
    queryStr += `${encodeURIComponent(key)}=${encodedValue}`
  }

  const wbiSign = md5(queryStr + mixinKey)
  
  return `${queryStr}&w_rid=${wbiSign}`
}
