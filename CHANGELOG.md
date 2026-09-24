# Changelog

All notable changes to this project will be documented in this file.

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
