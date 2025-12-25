import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get songs for a specific chart
export async function GET(req: NextRequest) {
    const chartId = req.nextUrl.searchParams.get('chart') || 'top200'

    const supabase = await createClient()

    // First, get the songs in the chart with their ranks
    const { data: chartSongs, error: chartError } = await supabase
        .from('chart_songs')
        .select(`
      rank,
      bvid
    `)
        .eq('chart_id', chartId)
        .order('rank', { ascending: true })
        .limit(200)

    if (chartError || !chartSongs || chartSongs.length === 0) {
        // Fallback to legacy view if chart is empty
        console.log(`Chart ${chartId} is empty, falling back to daily_trending_songs view`)
        const { data: fallbackData } = await supabase
            .from('daily_trending_songs')
            .select('*')
            .limit(200)

        const songs = (fallbackData || []).map(s => ({
            bvid: s.bvid,
            cid: s.cid,
            title: s.title,
            pic: s.pic || '',
            owner_name: s.owner_name || 'Unknown',
            pubdate: s.pubdate || 0,
            total_view: s.total_view,
            trending_val: s.trending_val
        }))

        return NextResponse.json({ songs, source: 'fallback' })
    }

    // Get bvids from chart
    const bvids = chartSongs.map(cs => cs.bvid)

    // Fetch full song data with trending_val from the view
    // The view already has the trending calculation
    const { data: songsData } = await supabase
        .from('daily_trending_songs')
        .select('*')
        .in('bvid', bvids)

    // Create a map for quick lookup
    const songMap = new Map<string, any>()
    for (const song of songsData || []) {
        songMap.set(song.bvid, song)
    }

    // Build final result
    let songs = chartSongs.map(cs => {
        const song = songMap.get(cs.bvid)
        if (!song) return null
        return {
            bvid: song.bvid,
            cid: song.cid,
            title: song.title,
            pic: song.pic || '',
            owner_name: song.owner_name || 'Unknown',
            pubdate: song.pubdate || 0,
            total_view: song.total_view,
            trending_val: song.trending_val,
            rank: cs.rank
        }
    }).filter(Boolean) as any[]

    // Sort by appropriate field based on chart type
    if (chartId === 'new') {
        // New songs chart: sort by publish date descending
        songs.sort((a, b) => (b.pubdate || 0) - (a.pubdate || 0))
    } else {
        // All other charts: sort by total_view descending
        songs.sort((a, b) => (b.total_view || 0) - (a.total_view || 0))
    }

    return NextResponse.json({ songs, source: 'chart', chartId })
}
