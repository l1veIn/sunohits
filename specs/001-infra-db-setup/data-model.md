# Data Model

## Tables

### `songs`
Stores metadata for Suno AI songs crawled from Bilibili.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `bvid` | `text` | PK, Not Null | Bilibili Video ID (e.g., BV1xx411c7X7) |
| `title` | `text` | Not Null | Video title |
| `pic` | `text` | | Cover image URL |
| `owner_name` | `text` | | Uploader username |
| `pubdate` | `bigint` | | Publish timestamp (Unix) |
| `total_view` | `bigint` | Default 0 | Most recent view count |

### `daily_stats`
Tracks view counts over time for calculating trends.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `bvid` | `text` | FK -> songs.bvid, Not Null | Reference to song |
| `recorded_at` | `timestamp with time zone` | Default now(), Not Null | Time of record |
| `view_count` | `bigint` | Not Null | View count at that time |

**Indexes**:
- Composite index on `(bvid, recorded_at)` for fast range queries.

## Views

### `daily_trending_songs`
Calculates daily view growth.

**Logic**:
`total_view` (current) - `view_count` (from ~24h ago).
*Note: Precise logic might involve self-joining `daily_stats` or just using `songs.total_view` vs a snapshot. For MVP, we will rely on data ingestion to populate `daily_stats` once per day, and this view compares the latest two records.*

**Schema**:
- `bvid`: Text
- `trending_val`: BigInt (Growth)
