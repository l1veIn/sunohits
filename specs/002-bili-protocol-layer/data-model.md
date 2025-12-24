# Data Model: Bilibili Protocol Layer

## Tables

### `crawl_metadata`
Stores the status of the most recent data ingestion run. Single-row table (or append-only with limit 1 logic, but simple key-value or single row ID is easier). For simplicity, we can treat it as a log where we just check the latest entry, or a singleton row. Let's use a singleton row approach (ID=1) for simplicity in MVP.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `integer` | PK, Default 1 | Singleton ID |
| `last_run_at` | `timestamp with time zone` | | When the last run finished |
| `status` | `text` | 'success' \| 'fail' | Outcome of the run |
| `processed_pages` | `text` | | E.g., "50/50" or "12/50" |
| `last_error_message` | `text` | | Error details if failed |

### `songs` (Existing - Reference)
Refined for this feature:
- Upsert logic will match on `bvid`.
- `total_view` will be updated.
- `pubdate` will be updated if changed (unlikely but possible).

## Entities

### `SongMetadata`
TypeScript interface for crawled data:
```typescript
interface SongMetadata {
  bvid: string;
  title: string;
  pic: string;
  owner_name: string;
  pubdate: number;
  total_view: number;
}
```
