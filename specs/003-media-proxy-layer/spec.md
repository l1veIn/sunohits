# Feature Specification: Media Proxy Layer

**Feature Branch**: `003-media-proxy-layer`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "接下来是第三阶段：实现音视频播放代理 (Media Proxy Layer)，在服务端 fetch 音频流"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Audio Stream Resolution (Priority: P1)

As a user, I want the system to automatically resolve the best available audio stream for a song so that I can listen to high-quality music.

**Why this priority**: This is the prerequisite for playback. Without resolving the stream URL, no music can be played.

**Independent Test**: Can be tested by calling the resolution function with a known `bvid` and verifying it returns a valid DASH audio URL.

**Acceptance Scenarios**:

1. **Given** a valid Bilibili video ID (`bvid`), **When** the resolution function is called, **Then** it requests the play URL from Bilibili with `fnval=16` (DASH).
2. **Given** a successful Bilibili response, **When** parsing the result, **Then** it extracts the audio stream URL.

---

### User Story 2 - Secure Audio Proxy (Priority: P1)

As a user, I want to play music directly in the browser without encountering "403 Forbidden" errors so that the listening experience is seamless.

**Why this priority**: Browsers block direct requests to Bilibili media URLs due to Referer checks. A server-side proxy is essential.

**Independent Test**: Can be tested by making a request to the local `/api/play` endpoint and verifying it returns a playable audio stream with correct headers.

**Acceptance Scenarios**:

1. **Given** a valid `bvid` and `cid`, **When** requesting `/api/play`, **Then** the server fetches the upstream audio with `Referer: https://www.bilibili.com`.
2. **Given** the upstream stream, **When** streaming to the client, **Then** the server pipes the data through a `ReadableStream` to the client.
3. **Given** an invalid or missing `bvid`/`cid`, **When** requesting `/api/play`, **Then** it returns an appropriate error (e.g., 400 Bad Request).

### Edge Cases

- **Upstream 403/404**: What if Bilibili blocks the server IP or the video is deleted? (Requirement: Return 502 Bad Gateway or 404 Not Found to the client).
- **Large Files**: Does the proxy handle large files without memory exhaustion? (Requirement: Must use streaming, not buffer the whole file).
- **Range Requests**: Does the proxy support seeking (Range headers)? (Requirement: Should forward Range headers to support seeking. This is standard for audio streaming).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a function to resolve DASH audio URLs from Bilibili using `x/player/wbi/playurl` with `fnval=16`.
- **FR-002**: System MUST provide an API endpoint `/api/play` that accepts `bvid` and `cid` as query parameters.
- **FR-003**: The `/api/play` endpoint MUST fetch the upstream audio stream with the header `Referer: https://www.bilibili.com`.
- **FR-004**: The `/api/play` endpoint MUST stream the response body to the client using `ReadableStream` (or Node.js streams) to minimize memory usage.
- **FR-005**: The system MUST handle upstream errors (e.g., 403, 404) and return appropriate HTTP status codes to the client.

### Key Entities *(include if feature involves data)*

- **PlayUrlResponse**: The structure returned by Bilibili's playurl API containing DASH stream information.
- **AudioStream**: The binary stream of audio data being proxied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `/api/play` endpoint successfully proxies audio for valid Bilibili videos with < 500ms Time to First Byte (TTFB).
- **SC-002**: Client-side audio players (e.g., `<audio>`) can play the stream without 403 errors.
- **SC-003**: The server process memory usage does not spike significantly during playback (indicating successful streaming).