# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-11-06

### Added

- **Local Data Synchronization**: Added `scripts/sync_data.py` and `npm run sync-data` (plus automated `predev` sync in `app/package.json`) to copy canonical `data/executions.json` into `app/public/executions.json` so local development accurately previews production execution data.
- **Data Growth Monitoring**: Added storage size reporting to `scripts/validate_executions.py` to continuously track data file size (KB) on validation passes.
- **Architecture Decision Records (ADRs)**: Added `docs/ADR.md` establishing policies to defer unnecessary data restructuring while monitoring growth (ADR 0001) and standardizing runtime versions (ADR 0002).
- **Unit Test Coverage for Data Sync**: Added `tests/test_sync_data.py` testing data copying, error handling, and directory creation.
- **Accessibility & Defensive Analytics**: Added `aria-pressed` state attributes to time-range filter buttons in `App.jsx`, and added resilient timestamp checks in `filterRecordsByRange`.

### Changed

- **GitHub Pages Deployment Path Filters**: Added path filters (`data/executions.json`, `app/**`, `.github/workflows/deploy-pages.yml`) to `.github/workflows/deploy-pages.yml` to prevent redundant builds on doc-only pushes while maintaining `workflow_run` triggers for scheduled runs.
- **Node Runtime Alignment**: Standardized Node 24 across CI (`.github/workflows/ci.yml`), GitHub Pages deployment (`deploy-pages.yml`), and Dockerfile (`node:24-alpine`).
- **Dockerfile Health Check Alignment**: Updated container health check to ping `/healthz` directly instead of `/Automation26/`, matching `docker/nginx.conf` and eliminating access log clutter.
- **Recorder Container Image Packaging**: Packaged the entire `scripts/` directory into `Dockerfile.recorder`.
- **Documentation & Lockfile Instructions**: Updated `README.md` to remove stale lockfile generation steps, clarify Pages triggers, document the new `sync-data` command, and bump container tags to `v1.5.0`.
- Updated package versions to `1.5.0` across root and dashboard packages.

### Container images

- `ghcr.io/offspring26/automation26-dashboard:1.5.0`
- `ghcr.io/offspring26/automation26-recorder:1.5.0`

## [1.4.0] - 2026-11-02

### Added

- **Time-Range Filtering**: Added time-window selectors (`7 Days`, `30 Days`, `90 Days`, `All Time`) to the dashboard, keeping chart height compact and readable as historical logs grow.
- **Trend Analysis & 7-Run Rolling Average**: Added rolling delay calculation and a 7-run trend stat card displaying delay drift direction (`↑`, `↓`, `→`) and rolling averages in tooltips.
- **Health Status Indicator & Delay Thresholds**: Added a real-time status badge in the header categorizing the latest scheduled execution (`Healthy`, `Moderate Delay`, `Elevated Delay`) with visual warning cues for runs with delay ≥ 10 minutes.
- **Recorder Unit Test Suite**: Added comprehensive unit tests in `tests/test_record_execution.py` verifying delay calculation, day boundaries, and trigger handling.
- **Data Schema Validation**: Added `scripts/validate_executions.py` to validate record schemas, ISO timestamps, and delay integrity in `data/executions.json`, integrated directly into `record-execution.yml`.
- **Frontend Test Suite & CI Verification**: Added `app/src/analytics.test.js` using Node's native test runner, combined `npm test` script across Python, data validation, and JavaScript, and added `.github/workflows/ci.yml` for automated CI validation.

### Changed

- Updated version metadata to `1.4.0` across root and dashboard packages.
- Modularized recorder script with testable `build_record` helper.

### Container images

- `ghcr.io/offspring26/automation26-dashboard:1.4.0`
- `ghcr.io/offspring26/automation26-recorder:1.4.0`

## [1.3.0] - 2026-11-02

### Added

- Version number badge displayed in the header and footer of the generated dashboard website.
- GitHub Pages deployment trigger on push to `main` and release tags in `.github/workflows/deploy-pages.yml` so that code updates deploy immediately to GitHub Pages.

### Changed

- **Recharts v3 Upgrade**: Upgraded `recharts` from `^2.12.7` to `^3.10.1`, removing deprecation warnings and reducing bundle module overhead.
- **Bundle Optimization & Code Splitting**: Configured Vite Rollup `manualChunks` in `vite.config.js` to split vendor code into `vendor-react`, `vendor-d3`, and `vendor-recharts`, reducing main app bundle to ~8 kB and eliminating chunk size warnings.
- Updated package versions to `1.3.0`.

### Container images

- `ghcr.io/offspring26/automation26-dashboard:1.3.0`
- `ghcr.io/offspring26/automation26-recorder:1.3.0`

## [1.2.0] - 2026-11-02

### Added

- Light mode support for the React dashboard with seamless toggle between dark and light themes.
- Automatic detection of system color scheme (`prefers-color-scheme`) with persistent `localStorage` preference.
- Theme-aware Recharts styling (grid lines, axes, text, bars, and custom tooltips adapt cleanly to light and dark themes).
- Anti-flash script in `index.html` preventing theme flicker on initial load.

### Changed

- Refactored dashboard CSS to use CSS custom properties for maintainable theme variables.
- Updated root and dashboard package versions to `1.2.0`.
- Synchronized repository with origin changes.

### Fixed

- Fixed unclosed bash code block and truncated sentence in `AGENTS.md`.
- Cleaned up untracked scratch scripts.

### Container images

- `ghcr.io/offspring26/automation26-dashboard:1.2.0`
- `ghcr.io/offspring26/automation26-recorder:1.2.0`

## [1.1.0] - 2026-09-24

### Added

- Hybrid npm and Docker packaging for the React dashboard and Python recorder.
- Docker Compose services for the dashboard and on-demand recorder.
- GHCR publishing workflow for dashboard and recorder images.
- Multi-platform container publishing for `linux/amd64` and `linux/arm64`.
- Health check configuration for the dashboard container.
- Packaging documentation and release guidance.

### Changed

- Root package metadata and dashboard package version updated to `1.1.0`.
- Container image tags now include branch, release, SHA, and default-branch `latest` tags.

### Container images

- `ghcr.io/offspring26/automation26-dashboard:1.1.0`
- `ghcr.io/offspring26/automation26-recorder:1.1.0`

## [Unreleased]

### Added

- Space for upcoming changes after the 1.1.0 release.

## [0.1.0] - 2026-09-07

### Added

- Project scaffold and initial README.
- GitHub Actions workflows for recording executions and deploying Pages.
- AGENTS.md describing agent rules and onboarding.
- Vite + React dashboard in app/ and sample data in data/executions.json.
- scripts/record_execution.py and supporting scripts.
- .gitignore updates.

(See individual commits and pull requests for more details.)
