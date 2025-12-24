# Feature Specification: Bilibili Protocol Layer

**Feature Branch**: `002-bili-protocol-layer`  
**Created**: 2025-12-24  
**Status**: Draft  
**Input**: User description: "step2:Bilibili Protocol Layer @starter.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Search Integration (Priority: P1)

As a system administrator, I want to securely search for "SUNO V5" content on Bilibili so that I can collect the most popular AI music metadata.

**Why this priority**: This is the core data ingestion capability. Without secure signing, search requests will be blocked by Bilibili.

**Independent Test**: Can be tested by manually triggering a search request and verifying that a successful response is received from the external platform without 403 errors.

**Acceptance Scenarios**:

1. **Given** valid platform credentials, **When** a search request is initiated with keyword "SUNO V5", **Then** the request is signed with the required security tokens and returns a list of matching videos.
2. **Given** rotated platform security keys, **When** a request is made, **Then** the system automatically refreshes the local keys and successfully completes the request.

---

### User Story 2 - Automated Music Ranking Ingestion (Priority: P1)

As the system, I want to automatically crawl the top 50 pages of search results periodically so that our leaderboard remains up-to-date with current trends.

**Why this priority**: Ensures data freshmess and populates the database with enough content to build a meaningful "Hits" list.

**Independent Test**: Can be tested by executing the ingestion routine and checking the database for the expected number of new/updated song records.

**Acceptance Scenarios**:

1. **Given** a trigger (e.g., cron job), **When** the ingestion routine runs, **Then** it crawls exactly 50 pages and upserts the data into the local database.
2. **Given** a high volume of pages to crawl, **When** the routine is running, **Then** it limits concurrent requests to prevent IP blocking.

---

### User Story 3 - Secure Trigger Authorization (Priority: P2)

As a system developer, I want to ensure that only authorized services can trigger the data ingestion routine so that we prevent unauthorized resource consumption.

**Why this priority**: Security requirement to prevent external actors from spamming our ingestion endpoints.

**Independent Test**: Can be tested by attempting to trigger the ingestion endpoint without a valid secret and verifying it returns an unauthorized error.

**Acceptance Scenarios**:

1. **Given** a request to the ingestion endpoint without a valid secret, **When** the request is received, **Then** it returns a 401 Unauthorized status.
2. **Given** a request with a valid secret, **When** the request is received, **Then** it starts the ingestion process.

---

### Edge Cases

- **Platform Key Rotation Failure**: What happens if the system cannot fetch new signing keys? (Assumption: System should retry with exponential backoff and alert administrators).
- **Incomplete Ingestion**: What happens if a crawl is interrupted or fails midway? (Requirement: System should be able to resume or simply restart during the next cycle).
- **Upstream Rate Limiting**: How to handle a temporary IP ban despite concurrency limits? (Requirement: System should pause ingestion for a defined "cool-down" period).
- **Search Result Depletion**: What if fewer than 50 pages of results exist? (Requirement: System should gracefully terminate the crawl when no more results are found).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement the external platform's specific query signing algorithm (WBI) for all search-related requests.
- **FR-002**: System MUST automatically fetch and refresh signing keys (salt/img_key/sub_key) at least every 24 hours.
- **FR-003**: System MUST provide an ingestion endpoint that searches for keyword "SUNO V5" ordered by popularity ("click").
- **FR-004**: System MUST crawl 50 pages of results during a full ingestion cycle.
- **FR-005**: System MUST upsert (update or insert) crawled data into the local database, ensuring no duplicate entries for the same video ID.
- **FR-006**: System MUST enforce a concurrency limit (e.g., 3-5 simultaneous requests) during the crawl process to avoid rate limits.
- **FR-007**: System MUST validate a pre-shared secret (e.g., cron secret) before executing the ingestion routine.

### Key Entities *(include if feature involves data)*

- **Song Metadata**: Attributes including video ID, title, cover image, uploader name, publish date, and total view count.
- **Crawl Metadata**: A simple status record storing the details of the last ingestion run:
  - `last_run_at`: Timestamp of the last execution.
  - `status`: Outcome (Success/Fail).
  - `processed_pages`: Progress indicator (e.g., "45/50").
  - `last_error_message`: Brief error description if the run failed.

## Assumptions & Dependencies

- **Assumption**: The external platform's search API remains consistent in its signature and response format.
- **Dependency**: Requires a local database for persisting crawled metadata (initialized in Phase 1).
- **Dependency**: Requires a valid network connection to the external platform.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ingestion endpoint successfully processes 50 pages of search results in under 5 minutes without triggering IP blocks.
- **SC-002**: Database contains a minimum of 1,000 unique "SUNO V5" song records after the first successful full crawl.
- **SC-003**: Unauthorized requests to the ingestion endpoint are rejected with 100% accuracy.
- **SC-004**: Signing keys are successfully rotated daily without manual intervention.