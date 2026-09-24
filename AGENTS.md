# AGENTS.md

## Purpose

This document guides agents and human contributors maintaining Automation26.

## Project summary

- `scripts/record_execution.py` records scheduled and manual workflow runs in the append-only `data/executions.json` log.
- `.github/workflows/record-execution.yml` runs the recorder daily at 03:14 UTC and supports manual dispatch.
- `app/` is the Vite + React dashboard published through GitHub Pages.
- `Dockerfile` packages the dashboard with Nginx.
- `Dockerfile.recorder` packages the Python recorder.
- `docker-compose.yml` provides local dashboard and recorder services.
- `.github/workflows/publish-container-images.yml` publishes both images to GHCR.

## Release 1.1 packaging status

- Root and dashboard package metadata are version `1.1.0`.
- Dashboard image: `ghcr.io/offspring26/automation26-dashboard`.
- Recorder image: `ghcr.io/offspring26/automation26-recorder`.
- GHCR publishing targets `linux/amd64` and `linux/arm64` using Docker Buildx.
- Release tags use the `v1.1.0` format; the corresponding npm version is `1.1.0`.
- The dashboard container listens on port `8080` and serves the project at `/Automation26/`.

## Safety rules

- Do not rewrite or reorder `data/executions.json`; changes must remain append-only with clear provenance.
- Do not add long-lived credentials. GHCR publishing uses the workflow `GITHUB_TOKEN` with `packages: write`.
- Changes to data-writing workflows, deployment configuration, or publishing permissions must be small, documented, and reviewed by a human before merge.
- Do not modify historical commits. Use a documented compensating record if historical data needs correction.

## Development and verification

```bash
# Dashboard
npm install --prefix app
npm run build

# Local containers
docker compose build
docker compose up dashboard
curl -fsS http://localhost:8080/healthz

# Recorder, writing through the mounted data volume
docker compose run --rm recorder
ons, open an issue and wait for human approval.
