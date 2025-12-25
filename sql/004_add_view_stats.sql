-- Add total_view and pubdate to daily_trending_songs view

DROP VIEW IF EXISTS daily_trending_songs;

CREATE VIEW daily_trending_songs AS
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
     AND ds.recorded_at < now() - interval '20 hours' 
     ORDER BY ds.recorded_at DESC 
     LIMIT 1), 
    0)
  ) AS trending_val
FROM songs s
WHERE s.total_view > 0
ORDER BY trending_val DESC;
