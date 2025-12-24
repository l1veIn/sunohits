// Seed the database with test data for UI verification
// Usage: npx tsx scripts/seed-test-data.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const testSongs = [
    { bvid: 'BV1test001', title: '🎵 Suno AI - Electronic Dreams', pic: 'https://i0.hdslb.com/bfs/archive/test1.jpg', owner_name: 'AI Music Creator', pubdate: Math.floor(Date.now() / 1000), total_view: 125000 },
    { bvid: 'BV1test002', title: '🎸 Rock Anthem - AI Generated', pic: 'https://i0.hdslb.com/bfs/archive/test2.jpg', owner_name: 'Suno Fan', pubdate: Math.floor(Date.now() / 1000), total_view: 98000 },
    { bvid: 'BV1test003', title: '🎹 Piano Melodies V5', pic: 'https://i0.hdslb.com/bfs/archive/test3.jpg', owner_name: 'Music Lab', pubdate: Math.floor(Date.now() / 1000), total_view: 87000 },
    { bvid: 'BV1test004', title: '🎤 Pop Sensation - Suno V5', pic: 'https://i0.hdslb.com/bfs/archive/test4.jpg', owner_name: 'AI Beats', pubdate: Math.floor(Date.now() / 1000), total_view: 76000 },
    { bvid: 'BV1test005', title: '🎻 Classical AI Symphony', pic: 'https://i0.hdslb.com/bfs/archive/test5.jpg', owner_name: 'Orchestra AI', pubdate: Math.floor(Date.now() / 1000), total_view: 65000 },
]

async function main() {
    console.log('🌱 Seeding test data...')

    // 1. Insert songs
    const { error: songError } = await supabase
        .from('songs')
        .upsert(testSongs as any, { onConflict: 'bvid' })

    if (songError) {
        console.error('❌ Failed to insert songs:', songError.message)
        return
    }
    console.log('✅ Inserted', testSongs.length, 'test songs')

    // 2. Insert daily_stats for trending calculation
    const stats = testSongs.map(s => ({
        bvid: s.bvid,
        view_count: s.total_view - Math.floor(Math.random() * 10000) // slightly lower for "yesterday"
    }))

    const { error: statError } = await supabase
        .from('daily_stats')
        .insert(stats as any)

    if (statError) {
        console.error('❌ Failed to insert stats:', statError.message)
        return
    }
    console.log('✅ Inserted daily stats')

    console.log('')
    console.log('🎉 Test data seeded successfully!')
    console.log('   Refresh the page to see the songs.')
}

main()
