# API Contract: Audio Proxy Endpoint

## GET /api/play

Proxies audio stream from Bilibili with correct Referer.

### Parameters
- `bvid` (required): Bilibili Video ID
- `cid` (required): Bilibili CID (Content ID)

### Headers
- `Range` (optional): Byte range for seeking.

### Response

**200 OK / 206 Partial Content**
- Content-Type: `audio/mp4` (or `audio/m4a` depending on upstream)
- Content-Length: File size (or chunk size)
- Accept-Ranges: bytes
- Body: Binary audio stream

**400 Bad Request**
- Missing parameters.

**404 Not Found**
- Video/Audio not found or restricted.

**502 Bad Gateway**
- Upstream Bilibili error.
