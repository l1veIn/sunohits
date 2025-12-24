# Feature Specification: UI & Player (Frontend)

**Feature Branch**: `004-ui-player`  
**Created**: 2025-12-24  
**Status**: Draft  
**Input**: User description: "最后是第四阶段：UI 还原与播放器 (Frontend & UI)1. **响应式布局**：左侧 Sidebar（发现、榜单、收藏），中间列表，底部 Player Bar。 2. **播放器实现**：使用原生 <audio> 或 xgplayer 接入 /api/play 源。 3. **性能优化**： * 图片使用 referrerPolicy=\"no-referrer\". * 歌曲列表实现虚拟滚动 (Virtual Scroll)。 * 实现 Web Media Session API（支持锁屏控制）。 开发时候需要启动dev服务器，并且使用browserMCP工具调试"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Music Browsing and Layout (Priority: P1)

As a music enthusiast, I want a clean, responsive interface inspired by Netease Cloud Music so that I can easily browse trending SUNO AI songs across discovery, charts, and my favorite lists.

**Why this priority**: The layout is the foundation of the user experience. Without the sidebar and main list, users cannot navigate the application.

**Independent Test**: Can be fully tested by navigating through the "Discovery", "Charts", and "Favorites" sections in both desktop and mobile viewports.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** viewed on a desktop, **Then** a persistent sidebar is visible on the left and a player bar at the bottom.
2. **Given** the "Charts" section is selected, **When** the page loads, **Then** a list of trending songs (daily trending view) is displayed in the center.

---


### User Story 2 - Audio Playback and Control (Priority: P1)

As a listener, I want to play songs from the list and control them via a dedicated player bar so that I can enjoy the music without interruptions.

**Why this priority**: Playback is the core functionality of the application.

**Independent Test**: Can be tested by clicking a song in the list and verifying that the player bar starts playback using the `/api/play` proxy.

**Acceptance Scenarios**:

1. **Given** a song list, **When** a user clicks on a "Play" button or a song row, **Then** the audio starts playing through the player bar.
2. **Given** audio is playing, **When** the user clicks "Pause" in the player bar, **Then** the audio stops.

---


### User Story 3 - Lock Screen and Background Control (Priority: P2)

As a mobile user, I want to control the music playback from my lock screen or notification area so that I don't have to unlock my phone to skip or pause songs.

**Why this priority**: Enhances the premium feel and mobile usability of the application.

**Independent Test**: Can be tested on a compatible mobile device/simulator by starting playback and checking the system media controls.

**Acceptance Scenarios**:

1. **Given** music is playing, **When** the device is locked, **Then** the song title, artist, and playback controls are visible on the lock screen.
2. **Given** playback is controlled via lock screen, **When** "Next" is pressed, **Then** the player advances to the next song in the list.

---


### User Story 4 - Smooth Infinite Browsing (Priority: P3)

As a heavy user, I want the song list to remain fluid even when browsing hundreds of songs so that the application feels fast and responsive.

**Why this priority**: Performance optimization for long lists of AI-generated content.

**Independent Test**: Can be tested by scrolling through a large list of songs and verifying that the scroll remains smooth and memory usage is stable.

**Acceptance Scenarios**:

1. **Given** a list of 500+ songs, **When** scrolling rapidly, **Then** only the visible items are rendered (Virtual Scroll), and there is no lag.

---


### Edge Cases

- **Network Instability**: How does the player handle buffering or connection loss? (Requirement: Show a loading state or retry mechanism).
- **Missing Media**: What if the `/api/play` proxy returns a 404 or 502? (Requirement: Skip to the next song and show a non-intrusive error toast).
- **Empty Favorites**: What happens when a user visits the "Favorites" tab with no saved songs? (Requirement: Display an "Empty" state with a call to action to discover music).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a responsive 3-pane layout: Sidebar (Left), Content (Center), and Player (Bottom).
- **FR-002**: Sidebar MUST contain navigation links for "Discovery", "Charts", and "Favorites".
- **FR-003**: The "Charts" view MUST display the top trending songs from the `daily_trending_songs` database view.
- **FR-004**: System MUST implement an audio player using the `/api/play` endpoint as the media source.
- **FR-005**: System MUST support basic playback controls: Play, Pause, Next, Previous, Volume, and Progress Seek.
- **FR-006**: System MUST implement Virtual Scrolling for the song list to ensure performance with large datasets.
- **FR-007**: System MUST use `referrerPolicy="no-referrer"` for all Bilibili-sourced images to prevent 403 errors.
- **FR-008**: System MUST implement the Web Media Session API to synchronize playback status with system media controls.
- **FR-009**: The "Favorites" list MUST be persisted locally on the user's device (using browser local storage).

### Key Entities *(include if feature involves data)*

- **Song**: Represents a track with `bvid`, `title`, `pic`, `owner_name`.
- **PlaybackState**: Represents current player status (playing, paused, current song, progress).
- **Favorite**: Represents a user-saved song.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start playback of any song from the charts in under 1 second after clicking.
- **SC-002**: The song list maintains 60 FPS during scrolling on mid-range mobile devices.
- **SC-003**: 100% of images load successfully without 403 errors using the no-referrer policy.
- **SC-004**: System media controls (lock screen/notifications) correctly reflect the active song and playback state.