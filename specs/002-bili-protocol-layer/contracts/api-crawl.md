# API Contract: Crawl Endpoint

## GET /api/crawl

Triggers the Bilibili data ingestion process.

### Authentication
**Headers**:
- `Authorization`: `Bearer <CRON_SECRET>`

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Crawl started",
  "data": {
    "pages_processed": 50,
    "songs_upserted": 120
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Crawl failed: [Error Details]"
}
```
