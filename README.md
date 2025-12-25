# 🎵 SunoHits

> AI Music Charts from Bilibili - Discover trending Suno AI-generated songs

一个从B站爬取 Suno AI 音乐并提供播放、收藏、排行榜功能的 Web 应用。

## 🚀 一键部署

### Deploy to Vercel + Supabase

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fl1veIn%2Fsunohits&project-name=sunohits&repository-name=sunohits&demo-title=SunoHits&demo-description=AI%20Music%20Charts%20from%20Bilibili&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6)

**部署步骤**：
1. 点击上方按钮，登录 Vercel
2. 创建或连接 Supabase 项目（Vercel 会自动引导）
3. 等待部署完成

### 数据库初始化

部署后，在 [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) 运行：

```sql
-- 复制 sql/setup.sql 的全部内容并执行
```

### 添加环境变量

先生成一个随机密钥：
```bash
openssl rand -base64 32
```

**1. Vercel 项目设置** → Environment Variables：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CRON_SECRET` | 刚生成的密钥 | API 验证请求用 |

**2. GitHub 仓库** → Settings → Secrets → Actions：

| Secret 名 | 值 |
|-----------|-----|
| `CRON_SECRET` | **与 Vercel 相同的密钥** |
| `VERCEL_URL` | 你的部署地址（如 `https://sunohits.vercel.app`）|

> ⚠️ 两边的 `CRON_SECRET` 必须一致！GitHub Actions 用它调用 Vercel API。

### 自动爬取

GitHub Actions 会每 6 小时自动触发爬虫（免费！）。

也可以手动触发：GitHub → Actions → Crawl Charts → Run workflow

---

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
- Progress bar with seek
- Volume control & Play modes
- Playlist drawer with queue
- "Play All" button
- "Clear Playlist" button

### 💾 Local Storage Features
- **Favorites** - 收藏喜欢的歌曲
- **Block List** - 屏蔽非音乐内容
- **Playlist Persistence** - 播放列表持久化

### 📱 Responsive Design
- Desktop: Sidebar + Player bar
- Mobile: Bottom tabs + Compact player

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand with localStorage
- **Deployment**: Vercel

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
│   ├── bili/             # Bilibili client
│   ├── services/         # CrawlerService
│   └── store/            # Zustand stores
├── sql/
│   └── setup.sql         # One-time DB setup
└── vercel.json           # Cron job config
```

## 🧪 Development

```bash
# Install
npm install

# Run
npm run dev

# Test
npm test

# Crawl manually
npx tsx scripts/run-crawl.ts
```

## 📜 License

MIT

---

Built with ❤️ for AI music lovers
