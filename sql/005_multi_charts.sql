-- Multi-Chart System Schema
-- Creates charts table and chart_songs association table

-- Charts table - stores chart metadata
CREATE TABLE IF NOT EXISTS charts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_by TEXT NOT NULL DEFAULT 'click',
  duration_filter INTEGER DEFAULT 1,  -- 1 = under 10min
  time_range TEXT DEFAULT '6m',       -- '1d', '1w', '6m'
  last_crawled_at TIMESTAMP WITH TIME ZONE
);

-- Insert default charts
INSERT INTO charts (id, name, description, order_by, time_range) VALUES
  ('top200', '总榜 Top 200', '最多播放、最近半年、10分钟以下', 'click', '6m'),
  ('daily', '今日点击榜', '最多播放、最近一天、10分钟以下', 'click', '1d'),
  ('weekly', '周点击榜', '最多播放、最近一周、10分钟以下', 'click', '1w'),
  ('new', '新歌榜', '最新发布、最近一周、10分钟以下', 'pubdate', '1w'),
  ('dm', '弹幕榜', '最多弹幕、最近半年、10分钟以下', 'dm', '6m'),
  ('stow', '收藏榜', '最多收藏、最近半年、10分钟以下', 'stow', '6m')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_by = EXCLUDED.order_by,
  time_range = EXCLUDED.time_range;

-- Chart songs association table
CREATE TABLE IF NOT EXISTS chart_songs (
  chart_id TEXT REFERENCES charts(id) ON DELETE CASCADE,
  bvid TEXT REFERENCES songs(bvid) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (chart_id, bvid)
);

-- Index for faster chart queries
CREATE INDEX IF NOT EXISTS idx_chart_songs_chart_rank ON chart_songs(chart_id, rank);
