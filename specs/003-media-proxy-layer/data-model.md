# Data Model: Media Proxy Layer

## Types

### `PlayUrlResponse`
Maps the Bilibili API response for `x/player/wbi/playurl`.

```typescript
interface PlayUrlResponse {
  code: number
  message: string
  data: {
    dash: {
      audio: Array<{
        id: number
        baseUrl: string
        bandwidth: number
      }>
    }
  }
}
```

## Entities

### `AudioStream`
Not a persisted entity, but represents the data flow:
- Source: Bilibili CDN
- Proxy: Next.js API Route
- Sink: Client Browser
