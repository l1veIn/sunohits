# Implementation Plan: Media Proxy Layer

**Branch**: `003-media-proxy-layer` | **Date**: 2025-12-24 | **Spec**: [specs/003-media-proxy-layer/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-media-proxy-layer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a secure audio proxy to bypass Bilibili's Referer protection. It involves resolving the DASH audio URL via WBI-signed requests and streaming the content to the client through a `/api/play` endpoint, ensuring seamless playback without 403 errors.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 15)
**Primary Dependencies**: `node-fetch` (native), `ReadableStream` (Web Streams API)
**Storage**: N/A (Stateless proxy)
**Testing**: Jest (Unit tests for resolution logic), Integration tests for proxy endpoint
**Target Platform**: Vercel (Serverless/Edge Functions)
**Project Type**: Web Application (Next.js App Router)
**Performance Goals**: TTFB < 500ms, minimal memory footprint (streaming).
**Constraints**: 
- Must inject `Referer: https://www.bilibili.com` upstream.
- Must handle Range headers for seeking.
- Must use WBI signing for resolution.
**Scale/Scope**: Single endpoint, stateless.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: Strict TypeScript used.
- [x] **Testing**: Unit tests for resolution logic. Integration tests for streaming response.
- [x] **UX**: Enables core playback functionality (Constitution III).
- [x] **Performance**: Streaming implementation required to avoid buffering (Constitution IV).
- [x] **Security**: No secrets exposed; WBI used for upstream auth.

## Project Structure

### Documentation (this feature)

```text
specs/003-media-proxy-layer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
app/
└── api/
    └── play/
        └── route.ts     # Proxy endpoint

lib/
├── bili/
│   ├── client.ts        # Update: Add getPlayUrl method
│   └── types.ts         # Update: Add PlayUrlResponse types
```

**Structure Decision**: Extending existing `lib/bili/client.ts` keeps Bilibili logic centralized. New route `app/api/play/route.ts` follows Next.js App Router conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
