# Quickstart: Media Proxy Layer

## Prerequisites
- Phase 2 (Bilibili Client) completed.

## Testing

### 1. Direct API Test
Use `curl` or browser to hit the proxy:

```bash
# Need a valid BVID and CID
# Example: http://localhost:3000/api/play?bvid=BV1xx411c7X7&cid=123456789
```

### 2. Seeking Test
Use `curl` with Range header:

```bash
curl -v -H "Range: bytes=0-1024" "http://localhost:3000/api/play?bvid=...&cid=..." -o start.mp4
```

### 3. Integration in Frontend (Preview)
HTML Audio element:
```html
<audio controls src="/api/play?bvid=...&cid=..."></audio>
```
