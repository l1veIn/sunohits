# Quickstart: Infrastructure & Database Setup

## Prerequisites
- Node.js & npm/pnpm installed.
- Supabase Project created.
- `.env.local` configured with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin tasks)

## Database Initialization
1. Copy the content of `specs/001-infra-db-setup/contracts/schema.sql`.
2. Go to your Supabase Project Dashboard -> SQL Editor.
3. Paste and run the SQL.
4. Verify `songs` and `daily_stats` tables appear in the Table Editor.

## WBI Signing Utility
Usage example:

```typescript
import { encWbi } from '@/lib/bili/wbi';

// You need to fetch imgKey and subKey from Bilibili API first
const imgKey = '...';
const subKey = '...';
const params = { foo: 'bar' };

const signedQuery = encWbi(params, imgKey, subKey);
console.log(signedQuery); // "foo=bar&wts=...&w_rid=..."
```

## Running Tests
```bash
npm test
```
