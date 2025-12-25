-- ============================================
-- SunoHits Database Setup
-- Run this SQL in Supabase SQL Editor once
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Core Tables
-- ============================================

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  bvid TEXT PRIMARY KEY,
  cid TEXT,
  title TEXT NOT NULL,
  pic TEXT,
  owner_name TEXT,
  pubdate BIGINT,
  total_view BIGINT DEFAULT 0
);

-- Daily stats for trend calculation
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bvid TEXT REFERENCES songs(bvid) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_bvid_time ON daily_stats(bvid, recorded_at DESC);

-- Crawler metadata (single row)
CREATE TABLE IF NOT EXISTS crawl_metadata (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'fail', 'running')),
  processed_pages TEXT,
  last_error_message TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO crawl_metadata (id, status, processed_pages)
VALUES (1, 'success', '0/0')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Multi-Chart System
-- ============================================

-- Charts table
CREATE TABLE IF NOT EXISTS charts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_by TEXT NOT NULL DEFAULT 'click',
  duration_filter INTEGER DEFAULT 1,
  time_range TEXT DEFAULT '6m',
  last_crawled_at TIMESTAMP WITH TIME ZONE
);

-- Insert default charts
INSERT INTO charts (id, name, description, order_by, time_range) VALUES
  ('top200', '总榜 Top 200', '最多播放、最近半年', 'click', '6m'),
  ('daily', '今日点击榜', '最多播放、最近一天', 'click', '1d'),
  ('weekly', '周点击榜', '最多播放、最近一周', 'click', '1w'),
  ('new', '新歌榜', '最新发布、最近一周', 'pubdate', '1w'),
  ('dm', '弹幕榜', '最多弹幕、最近半年', 'dm', '6m'),
  ('stow', '收藏榜', '最多收藏、最近半年', 'stow', '6m')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_by = EXCLUDED.order_by,
  time_range = EXCLUDED.time_range;

-- Chart songs association
CREATE TABLE IF NOT EXISTS chart_songs (
  chart_id TEXT REFERENCES charts(id) ON DELETE CASCADE,
  bvid TEXT REFERENCES songs(bvid) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (chart_id, bvid)
);

CREATE INDEX IF NOT EXISTS idx_chart_songs_chart_rank ON chart_songs(chart_id, rank);

-- ============================================
-- Views
-- ============================================

-- Trending songs view with 20-hour delta
CREATE OR REPLACE VIEW daily_trending_songs AS
SELECT
  s.bvid,
  s.cid,
  s.title,
  s.pic,
  s.owner_name,
  s.pubdate,
  s.total_view,
  (s.total_view - COALESCE(
    (SELECT ds.view_count 
     FROM daily_stats ds 
     WHERE ds.bvid = s.bvid 
     AND ds.recorded_at < NOW() - INTERVAL '20 hours' 
     ORDER BY ds.recorded_at DESC 
     LIMIT 1), 
    0)
  ) AS trending_val
FROM songs s
WHERE s.total_view > 0
ORDER BY trending_val DESC;
