# Quickstart: Bilibili Protocol Layer

## Prerequisites
1. **Database Schema**: Run `sql/002_crawl_metadata.sql` in Supabase.
2. **Environment Variables**:
   - `CRON_SECRET`: Set this in `.env.local` to a secure string.

## Testing the Crawler (Manual)

You can trigger the crawler locally via `curl` or Postman:

```bash
# Verify your CRON_SECRET in .env.local first
curl -X GET http://localhost:3000/api/crawl \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Verifying Results

1. Check the `crawl_metadata` table in Supabase:
   ```sql
   select * from crawl_metadata;
   ```
2. Check the `songs` table for new entries:
   ```sql
   select count(*) from songs;
   ```

## Unit Tests
Run the logic tests:
```bash
npm test
```
