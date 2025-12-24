import { NextResponse } from 'next/server'

// Test endpoint to check Bilibili API accessibility from Vercel
export async function GET() {
    const results: Record<string, any> = {}

    // Test 1: Nav API (for WBI keys)
    try {
        const navRes = await fetch('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        const navData = await navRes.json()
        results.nav = {
            status: navRes.status,
            code: navData.code,
            message: navData.message,
            hasWbiImg: !!navData.data?.wbi_img
        }
    } catch (e: any) {
        results.nav = { error: e.message }
    }

    // Test 2: Simple search without WBI (will fail but shows if blocked)
    try {
        const searchRes = await fetch('https://api.bilibili.com/x/web-interface/search/all/v2?keyword=test', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        const searchData = await searchRes.json()
        results.searchWithoutWbi = {
            status: searchRes.status,
            code: searchData.code,
            message: searchData.message
        }
    } catch (e: any) {
        results.searchWithoutWbi = { error: e.message }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        serverRegion: process.env.VERCEL_REGION || 'unknown',
        results
    })
}
