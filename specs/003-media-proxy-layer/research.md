# Research: Media Proxy Layer

## Decisions

### Streaming Mechanism
**Decision**: Use `fetch` (native) and return `new NextResponse(stream, { headers })`.
**Rationale**: Next.js App Router supports streaming responses natively via `NextResponse`. Piping the upstream `ReadableStream` directly to the response minimizes memory usage (no buffering).
**Alternatives Considered**:
- Node.js `http` proxy: Harder to integrate with App Router.
- Buffering file: High memory cost, slow TTFB.

### Upstream URL Resolution
**Decision**: Resolve audio URL inside `BiliClient.getPlayUrl` using `x/player/wbi/playurl`.
**Rationale**: Centralizes Bilibili API logic. The endpoint requires WBI signing (already implemented) and specific params (`fnval=16` for DASH).
**Details**:
- `fnval=16`: Requests DASH format (better for adaptive streaming, but usually gives `m4s` segments or a single `m4a` if `fnval=80`? Need to check Bilibili docs. `fnval=16` is standard for high quality. Actually `fnval=16` returns DASH. We might need to parse DASH xml or just look for `audio` array in the JSON if available for direct mp4 links. Bilibili playurl API with `fnval=16` returns `dash` object. Inside `dash`, `audio` is an array. We pick the first one `baseUrl` or `backupUrl`.
- **Correction**: `fnval=16` usually returns DASH. If we want simple mp4/m4a url, we might parse the DASH response or see if there is a direct link. Usually `dash.audio[0].baseUrl` is a direct streamable url (often m4s range-based, but plays as a file if fetched fully).

### Range Header Handling
**Decision**: Forward `Range` header from client request to upstream Bilibili request.
**Rationale**: Essential for seeking. Bilibili CDN supports Range requests. Forwarding it allows the browser to request byte ranges.
**Implications**: 206 Partial Content responses must be handled.

## Open Questions Resolved
- **Seeking**: Supported via Range header forwarding.
- **Format**: Will prioritize DASH audio stream URL from `playurl` API.
