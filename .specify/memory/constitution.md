# SunoHits Constitution
<!-- Sync Impact Report
Version Change: 0.0.0 -> 1.0.0
Modified Principles: N/A (Initial Ratification)
Added Sections: All
Removed Sections: N/A
Templates Status:
  - .specify/templates/plan-template.md: ✅ (Dynamic check ref)
  - .specify/templates/spec-template.md: ✅ (Compatible)
  - .specify/templates/tasks-template.md: ✅ (Compatible)
Follow-up: None
-->

## Core Principles

### I. Code Quality & Architecture
Strict adherence to TypeScript strict mode, clean code principles, and separation of concerns is mandatory. Next.js App Router best practices MUST be followed. Linting (ESLint) and formatting (Prettier/EditorConfig) are non-negotiable and must pass before any merge.

### II. Testing Standards
A comprehensive testing strategy is required. Unit tests for utilities and hooks are mandatory. Integration tests for API routes and Supabase interactions SHOULD be implemented for critical paths. Code coverage SHOULD aim for high confidence.

### III. User Experience Consistency
UI MUST be responsive, accessible (following WCAG guidelines), and visually consistent using Tailwind CSS and shadcn/ui. The "Netease Cloud Music" aesthetic replication is a key design requirement and MUST be respected.

### IV. Performance Requirements
The application MUST be optimized for speed. Core Web Vitals are the primary metrics. Image optimization (including `referrerPolicy`), virtual scrolling for long lists, and efficient data fetching strategies (SWR/React Query or Server Components) MUST be employed.

## Technical Constraints

*   **Stack**: Next.js 15 (App Router), TypeScript, Supabase, Tailwind CSS, shadcn/ui.
*   **Environment**: All secrets (Supabase keys, cron secrets) MUST be loaded from environment variables (`process.env`).
*   **Bilibili Integration**: WBI signing is required for specific API calls. `referrerPolicy="no-referrer"` MUST be used for Bilibili images.

## Development Workflow

*   **Branching**: Feature branch workflow is standard.
*   **Reviews**: All PRs require review.
*   **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH) applies to releases.

## Governance

This Constitution supersedes all other practices. Amendments require documentation and approval. All PRs and reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2025-12-24 | **Last Amended**: 2025-12-24