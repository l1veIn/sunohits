import { NextResponse } from 'next/server'
import { encWbi, getMixinKey } from '@/lib/bili/wbi'

// Test endpoint to check Bilibili API accessibility from Vercel
export async function GET() {
    const results: Record<string, any> = {}

    // Test 1: Nav API (for WBI keys)
    let imgKey = '', subKey = ''
    try {
        const navRes = await fetch('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        const navData = await navRes.json()

        if (navData.data?.wbi_img) {
            const { img_url, sub_url } = navData.data.wbi_img
            imgKey = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'))
            subKey = sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'))
        }

        results.nav = {
            status: navRes.status,
            code: navData.code,
            message: navData.message,
            hasWbiImg: !!navData.data?.wbi_img,
            imgKey: imgKey ? imgKey.substring(0, 8) + '...' : null,
            subKey: subKey ? subKey.substring(0, 8) + '...' : null
        }
    } catch (e: any) {
        results.nav = { error: e.message }
    }

    // Test 2: Search WITH WBI signature
    if (imgKey && subKey) {
        try {
            const params = {
                keyword: 'SUNO V5',
                search_type: 'video',
                page: 1,
                order: 'click'
            }
            const signedQuery = encWbi(params, imgKey, subKey)
            const searchUrl = `https://api.bilibili.com/x/web-interface/wbi/search/all/v2?${signedQuery}`

            results.searchUrl = searchUrl.substring(0, 100) + '...' // partial URL for debugging

            const searchRes = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://www.bilibili.com'
                }
            })

            const contentType = searchRes.headers.get('content-type')
            const responseText = await searchRes.text()

            if (contentType?.includes('application/json')) {
                const searchData = JSON.parse(responseText)
                results.searchWithWbi = {
                    status: searchRes.status,
                    code: searchData.code,
                    message: searchData.message,
                    hasResults: searchData.data?.result?.length > 0,
                    resultCount: searchData.data?.result?.length || 0
                }
            } else {
                results.searchWithWbi = {
                    status: searchRes.status,
                    contentType,
                    responsePreview: responseText.substring(0, 200)
                }
            }
        } catch (e: any) {
            results.searchWithWbi = { error: e.message }
        }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        serverRegion: process.env.VERCEL_REGION || 'unknown',
        results
    })
}
