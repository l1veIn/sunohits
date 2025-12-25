# 🎵 SunoHits

> AI Music Charts from Bilibili - Discover trending Suno AI-generated songs

一个从B站爬取 Suno AI 音乐并提供播放、收藏、排行榜功能的 Web 应用。

## ✨ Features

### 📊 Multi-Chart System
- **总榜** - 半年内播放量最高 (Top 200)
- **日榜** - 24小时内播放量最高
- **周榜** - 一周内播放量最高
- **新歌榜** - 一周内最新发布
- **弹幕榜** - 半年内弹幕数最多
- **收藏榜** - 半年内收藏数最多

### 🎧 Full-Featured Player
- Play/Pause, Previous/Next controls
- Progress bar with seek functionality
- Volume control (desktop)
- Play modes: Sequential, Shuffle, Repeat One, Repeat All
- Playlist drawer with song queue
- "Play All" - add entire chart to playlist
- "Clear Playlist" button

### 💾 Local Storage Features
- **Favorites** - 收藏喜欢的歌曲，支持播放全部
- **Block List** - 屏蔽非音乐内容（"这不是音乐！"按钮）
- **Playlist Persistence** - 播放列表持久化

### 📱 Responsive Design
- Desktop: Sidebar navigation + Player bar
- Mobile: Bottom navigation tabs + Compact player
- Marquee animation for long song titles

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand with localStorage persistence
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd sunohits
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
CRON_SECRET=your-cron-secret
```

### 3. Database Schema
Run SQL migrations in Supabase SQL Editor:
```bash
sql/001_init_schema.sql      # songs, daily_stats, daily_trending_songs view
sql/002_crawl_metadata.sql   # crawler logging
sql/003_add_cid.sql          # add cid column for playback
sql/004_add_view_stats.sql   # view statistics
sql/005_multi_charts.sql     # charts, chart_songs tables
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🕷 Crawler

### Run Crawler (All Charts)
```bash
npx tsx scripts/run-crawl.ts
```

### Run via API (with auth)
```bash
# All charts
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/crawl

# Specific chart
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/crawl?chart=daily"
```

### Vercel Cron Jobs
Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/crawl",
    "schedule": "0 */6 * * *"
  }]
}
```

## 📁 Project Structure

```
sunohits/
├── app/
│   ├── api/
│   │   ├── charts/       # Chart data API
│   │   ├── crawl/        # Crawler trigger
│   │   └── play/         # Audio stream proxy
│   ├── favorites/        # Favorites page
│   └── page.tsx          # Home page
├── components/
│   ├── layout/           # Sidebar, MobileNav
│   ├── player/           # PlayerBar, controls
│   └── song-list/        # SongItem, VirtualList
├── lib/
│   ├── bili/             # Bilibili client (WBI signing)
│   ├── services/         # CrawlerService
│   └── store/            # Zustand stores
├── sql/                  # Database migrations
└── scripts/              # Utility scripts
```

## 🧪 Testing

```bash
npm test           # Run all tests
npm run lint       # ESLint check
npx tsc --noEmit   # TypeScript check
```

## 📜 License

MIT

---

Built with ❤️ for AI music lovers
