-- Enable UUID extension if needed (not strictly used yet but good practice)
create extension if not exists "uuid-ossp";

-- Table: songs
create table if not exists songs (
  bvid text primary key,
  title text not null,
  pic text,
  owner_name text,
  pubdate bigint,
  total_view bigint default 0
);

-- Table: daily_stats
create table if not exists daily_stats (
  id uuid primary key default uuid_generate_v4(),
  bvid text references songs(bvid) not null,
  recorded_at timestamp with time zone default now(),
  view_count bigint not null
);

-- Index for daily_stats time-series queries
create index if not exists idx_daily_stats_bvid_time on daily_stats(bvid, recorded_at desc);

-- View: daily_trending_songs
-- Logic: Simplistic approach - gets most recent stat vs stat from 24h ago
-- Ideally, the app logic should ensure strictly one record per day per song to make this view simple.
-- For now, this is a placeholder view structure.
create or replace view daily_trending_songs as
select
  s.bvid,
  s.title,
  s.pic,
  s.owner_name,
  (s.total_view - coalesce(
    (select ds.view_count 
     from daily_stats ds 
     where ds.bvid = s.bvid 
     and ds.recorded_at < now() - interval '20 hours' 
     order by ds.recorded_at desc 
     limit 1), 
    0)
  ) as trending_val
from songs s
where s.total_view > 0
order by trending_val desc;
