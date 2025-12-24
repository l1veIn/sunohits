# Feature Specification: Infrastructure & Database Setup

**Feature Branch**: `001-infra-db-setup`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "@starter.md Phase 1: Infrastructure & Database Modeling"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Schema Initialization (Priority: P1)

As a developer, I need the database schema to be initialized so that I can store song data and statistics.

**Why this priority**: Without the database schema, no data can be persisted, blocking all subsequent features.

**Independent Test**: Verify that tables and views exist in the Supabase dashboard or via SQL query.

**Acceptance Scenarios**:

1. **Given** a connected Supabase instance, **When** the schema SQL is executed, **Then** the `songs` table exists with correct columns (`bvid`, `title`, etc.).
2. **Given** a connected Supabase instance, **When** the schema SQL is executed, **Then** the `daily_stats` table exists with correct columns.
3. **Given** populated `daily_stats` data, **When** querying `daily_trending_songs`, **Then** it returns the correct calculated view count difference.

---

### User Story 2 - Core Utility Implementation (Priority: P1)

As a developer, I need core utility libraries implemented so that I can interact with the database and the Bilibili API.

**Why this priority**: These utilities are foundational for data fetching and API interaction in later phases.

**Independent Test**: Unit tests for signing logic and integration verification for database connection.

**Acceptance Scenarios**:

1. **Given** valid environment variables, **When** importing the database client, **Then** a valid client instance is available.
2. **Given** Bilibili API parameters, **When** calling the WBI signing function, **Then** it returns a correctly signed query string with correct key logic applied.

### Edge Cases

- What happens if environment variables are missing? (Should throw helpful error or fail gracefully)
- How does the system handle WBI key rotation? (Logic should be dynamic, not hardcoded)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have a `songs` table in the database with columns: `bvid` (PK), `title`, `pic`, `owner_name`, `pubdate`, `total_view`.
- **FR-002**: System MUST have a `daily_stats` table in the database with columns: `bvid`, `recorded_at`, `view_count`.
- **FR-003**: System MUST have a `daily_trending_songs` view that calculates the difference between today's and yesterday's view counts for each video.
- **FR-004**: System MUST provide a configured database client module that authenticates using environment variables.
- **FR-005**: System MUST implement the Bilibili WBI signing algorithm, including dynamic key retrieval logic and parameter mixing.

### Key Entities *(include if feature involves data)*

- **Song**: Represents a music video from Bilibili (BVID, metadata).
- **DailyStat**: Snapshot of a video's view count at a specific time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database schema verification confirms existence of `songs` table, `daily_stats` table, and `daily_trending_songs` view.
- **SC-002**: Database client module successfully connects to the configured database instance.
- **SC-003**: WBI signing function produces valid signatures matching Bilibili's reference algorithm.