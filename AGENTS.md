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

Setup Status (as of 2026-09-07)
-------------------------------
✅ **All core infrastructure is fully operational:**
- Workflow permissions set to "Read and write" (allows data commits by bot)
- GitHub Pages source configured to "GitHub Actions"
- npm dependencies locked via app/package-lock.json
- First execution record logged (manual dispatch on 2026-09-07 at 10:30:10 UTC)
- Dashboard deployed and live at https://offspring26.github.io/Automation26/
- Next scheduled run: 2026-09-08 at 03:14 UTC (expected to start recording live delay data)

See **STATUS.md** for detailed setup completion report, workflow diagrams, and testing notes.

Agent constraints and safety rules
- Do NOT rewrite or reorder data/executions.json. All changes to this file should be append-only and committed with clear provenance.
- Avoid changing historical commits. If data needs correction, open an issue and propose a documented migration, or add a new compensating record — do not alter past records in-place.
- All changes that modify data/executions.json, .github workflows, or deployment configuration must be small, explained in the PR body, and set to a human reviewer for approval before merge.
- The repository uses GitHub Actions to commit data — ensure the repo's Actions permissions are not escalated by agent changes.

Branching and commit policy for agents
- Branch naming: use short, descriptive names: agent/<task>-<short-id> (example: agent/add-chart-tooltip-007)
- Commit messages: follow Conventional Commits where possible (feat:, fix:, chore:, docs:, ci:, style:, refactor:, perf:, test:). Include a one-line summary and optional body.
- One logical change per branch/PR. Keep PRs small and focused.

Pull Requests
- Open a PR from your branch to the default branch (main or repo default).
- PR template should include: what changed, why, screenshots (if UI), test steps, and roll-back plan.
- Mark PRs that touch automated data-writing workflows as "Needs human review" and set at least one human reviewer.

Testing and local development
- Python script: run locally with
  python3 scripts/record_execution.py
  (It will append to data/executions.json — if running locally, use a temporary copy or run in a throwaway branch.)
- Frontend:
  cd app
  npm install
  npm run dev
  The dev server reads app/public/executions.json. Place sample records there to preview the chart.

Permissions and secrets
- No secret or private credentials are stored in this repo. The workflows run on GitHub Actions and use the default GITHUB_TOKEN to push commits. Do not attempt to add long-lived tokens or secrets.

Observability and debugging
- Check Actions logs for both workflows (.github/workflows/record-execution.yml and deploy-pages.yml) if something fails.
- The record job sets python logs to stdout; the commit step prints whether there are changes to commit.

Suggested first tasks for an agent
1. Add a small unit-style test harness for scripts/record_execution.py that verifies delay computation for scheduled and manual runs.
2. Make the dashboard pipeline read data/executions.json at runtime (optional) or add a small script to generate sample data for local dev.
3. Add CI checks that prevent accidentally committing malformed JSON to data/executions.json (pre-commit or a lightweight GitHub Action).

Contact & escalation
- For any change that could delete or rewrite data or escalate permissions, open an issue and wait for human approval.


----
Generated by an assistant to help future agents work in this repository. Keep changes small; prefer PRs over direct pushes for anything beyond trivial docs.
