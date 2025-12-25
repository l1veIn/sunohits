<p align="center">
  <img src="public/logo.png" alt="SunoHits Logo" width="120" />
</p>

<h1 align="center">SunoHits</h1>

<p align="center">
  <strong>B站 Suno AI 音乐排行榜</strong><br>
  发现热门 AI 生成音乐
</p>

<p align="center">
  <a href="https://sunohits.vercel.app"><strong>🔗 在线演示</strong></a> •
  <a href="#-一键部署">一键部署</a> •
  <a href="#-功能特性">功能特性</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-本地开发">本地开发</a>
</p>

---

## 📸 截图预览

<p align="center">
  <img src="image/web.jpg" alt="桌面端" width="65%" />
  <img src="image/mobile.jpg" alt="移动端" width="18%" />
</p>

> ⚠️ **Demo 服务可能随时关闭**，建议自己部署以获得最佳体验。

---

## 🚀 一键部署

### 第一步：Fork 并部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fl1veIn%2Fsunohits&project-name=sunohits&repository-name=sunohits&demo-title=SunoHits&demo-description=AI%20Music%20Charts%20from%20Bilibili&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6)

1. 点击上方按钮，登录 Vercel（没有账号会引导注册）
2. 在 **Add Integrations** 部分，点击 **Supabase** 旁边的 **Add** 按钮
3. 如果没有 Supabase 账号，会引导你注册并创建项目
4. 授权 Vercel 访问 Supabase 后，环境变量会自动配置
5. 点击 **Deploy** 开始部署

### 第二步：初始化数据库

部署完成后，需要创建数据表：

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择刚创建的项目
3. 进入 **SQL Editor**（左侧菜单）
4. 复制 [`sql/setup.sql`](sql/setup.sql) 的全部内容
5. 粘贴到编辑器并点击 **Run** 执行

### 第三步：配置环境变量

先生成一个随机密钥：
```bash
openssl rand -base64 32
```

**在 Vercel 添加**：进入项目 → Settings → Environment Variables

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CRON_SECRET` | 刚生成的密钥 | API 验证请求用 |
    
**在 GitHub 添加**：进入仓库 → Settings → Secrets → Actions → Repository secrets

| Secret 名 | 值 |
|-----------|-----|
| `CRON_SECRET` | **与 Vercel 相同的密钥** |
| `VERCEL_URL` | 你的部署地址（如 `https://sunohits.vercel.app`）|

> ⚠️ 两边的 `CRON_SECRET` 必须一致！GitHub Actions 用它调用 Vercel API。

### 第四步：触发首次爬取

GitHub Actions 会每 6 小时自动爬取数据（免费！）。

首次需要手动触发：GitHub → Actions → Crawl Charts → Run workflow

---

## ✨ 功能特性

### 📊 多榜单系统
- **总榜** - 半年内播放量最高 (Top 200)
- **日榜** - 24小时内播放量最高
- **周榜** - 一周内播放量最高
- **新歌榜** - 一周内最新发布
- **弹幕榜** - 半年内弹幕数最多
- **收藏榜** - 半年内收藏数最多

### 🎧 完整播放器
- 播放/暂停、上一首/下一首
- 进度条拖拽
- 音量控制、播放模式（顺序/随机/单曲/列表循环）
- 播放列表抽屉
- 「播放全部」按钮
- 「清空列表」按钮

### 💾 本地存储功能
- **收藏夹** - 收藏喜欢的歌曲
- **屏蔽列表** - 屏蔽非音乐内容
- **播放列表持久化** - 刷新页面不丢失

### 📱 响应式设计
- 桌面端：侧边栏 + 播放器栏
- 移动端：底部标签 + 紧凑播放器

---

## 🛠 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + localStorage
- **部署**: Vercel

---

## 📁 项目结构

```
sunohits/
├── app/
│   ├── api/
│   │   ├── charts/       # 榜单数据 API
│   │   ├── crawl/        # 爬虫触发器
│   │   └── play/         # 音频流代理
│   ├── favorites/        # 收藏页面
│   └── page.tsx          # 首页
├── components/
│   ├── layout/           # 侧边栏、移动端导航
│   ├── player/           # 播放器组件
│   └── song-list/        # 歌曲列表组件
├── lib/
│   ├── bili/             # B站客户端
│   ├── services/         # 爬虫服务
│   └── store/            # 状态管理
└── sql/
    └── setup.sql         # 数据库初始化
```

---

## 🧪 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 手动爬取数据
npx tsx scripts/run-crawl.ts
```

---

## 🙏 致谢

本项目参考了以下优秀开源项目：

- [wood3n/biu](https://github.com/wood3n/biu) - B站音乐播放器
- [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) - B站 API 文档

---

## ⚠️ 免责声明

本项目仅供**学习交流**使用，请勿用于商业用途。

- 本项目不存储任何音视频资源，所有内容均来自 B站 公开 API
- 使用本项目产生的任何法律责任由使用者自行承担
- 请尊重 UP 主的劳动成果，喜欢请到 B站 点赞、投币、收藏
- 如有侵权，请联系删除

---

## 📜 开源协议

MIT

---

<p align="center">为 AI 音乐爱好者用 ❤️ 打造</p>
