### 🚀 SunoHits：全栈 AI 音乐榜单应用 - 深度开发指令

> **Role:** 顶级全栈架构师。你将负责从零到一开发 "SunoHits"（B 站 SUNO AI 音乐榜单）。
> **Current Status:**
> 1. **项目环境**：基于 Next.js 15 (App Router) 的 `with-supabase` 模板。
> 2. **数据库**：已通过 Vercel 原生集成 Supabase，环境变量已存在于 `.env.local`。
> 3. **注意**：请检查 `.env.local` 中的变量名。若带有 `STORAGE_` 前缀，请在初始化 Supabase Client 时进行适配。


**Project Vision:**
打造一个界面高度还原“网易云音乐”、数据垂直聚合“SUNO AI 音乐”、支持全平台 Web 播放的精品应用。

---

### 🛠 技术栈规范 (Tech Stack)

* **Framework:** Next.js 15 (App Router) + TypeScript.
* **Styling:** Tailwind CSS + shadcn/ui + Lucide Icons.
* **Database:** Supabase (Serverless Postgres via Vercel Integration).
* **State Management:** Zustand + Persist (Local Storage for favorites).
* **Video/Audio Logic:** Bilibili WBI Signature + DASH Stream Proxy.

---

### 📋 核心分阶段任务 (Phased Tasks)

#### 第一阶段：基础设施与数据库建模 (Infrastructure)

1. **项目初始化**：已完成
2. **数据库建模**：使用 PostgreSQL MCP 连通 Supabase，执行以下逻辑：
* `songs` 表：存储 `bvid(PK)`, `title`, `pic`, `owner_name`, `pubdate`, `total_view`。
* `daily_stats` 表：记录 `bvid`, `recorded_at`, `view_count`。
* **创建视图 (View)**：编写 SQL 计算“今日播放量 - 昨日播放量”，生成 `daily_trending_songs` 视图。



#### 第二阶段：B 站协议层开发 (Bilibili Protocol Layer)

1. **WBI 签名实现**：参考 `https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md` 文档，在 `lib/bili/wbi.ts` 实现签名算法（需包含获取 `img_key` / `sub_key` 和参数混淆）。
2. **抓取引擎 (`/api/crawl`)**：
* 搜索 `keyword: "SUNO V5"`, `order: "click"`。
* 循环爬取前 50 页，并将数据清洗后 Upsert 到 Supabase。
* 适配 Vercel Cron Job，确保接口安全（校验 `CRON_SECRET`）。



#### 第三阶段：音视频播放代理 (Media Proxy Layer)

1. **音频解析**：调用 `x/player/wbi/playurl`，指定 `fnval=16` 以获取 DASH 格式。
2. **流代理接口 (`/api/play`)**：
* 接收 `bvid` 和 `cid`。
* 在服务端 fetch 音频流，**必须注入 Header**：`Referer: https://www.bilibili.com`。
* 使用 `ReadableStream` 将数据透传给前端，解决 Web 端 403 跨域问题。



#### 第四阶段：UI 还原与播放器 (Frontend & UI)

1. **响应式布局**：左侧 Sidebar（发现、榜单、收藏），中间列表，底部 Player Bar。
2. **播放器实现**：使用原生 `<audio>` 或 `xgplayer` 接入 `/api/play` 源。
3. **性能优化**：
* 图片使用 `referrerPolicy="no-referrer"`。
* 歌曲列表实现虚拟滚动 (Virtual Scroll)。
* 实现 Web Media Session API（支持锁屏控制）。



---

### ⚠️ 关键逻辑约束 (Crucial Logic)

* **WBI 盐值更新**：每 24 小时需重新获取 `nav` 接口的盐值，不要硬编码。
* **并发控制**：抓取 50 页数据时需做并发限制（推荐 3-5 并发），防止被 B 站封禁 IP。
* **环境隔离**：所有敏感 Key（Supabase URL/Key, Cron Secret）必须从 `process.env` 读取。

---

### 🏁 启动指令 (Immediate Action)

请你立即开始 **第一阶段** 的工作：

1. 列出完整的项目目录结构。
2. 给出 Supabase 的建表 SQL 语句。
3. 编写 `lib/supabase.ts` 和 `lib/bili/wbi.ts` 的核心实现代码。
