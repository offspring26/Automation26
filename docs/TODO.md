# TODO - Repository Optimization Ideas & Implementation

This document tracks repository improvements for Automation26. Formal architectural decisions are documented in [ADR.md](./ADR.md).

This note collects potential improvements for Automation26. The recommendations are prioritized for practical impact and preserve the repository's append-only execution history.

## 1. Avoid unnecessary GitHub Pages builds

`deploy-pages.yml` currently runs on every push to `main`, even when only documentation or unrelated files change. Add path filters for dashboard and execution-data changes, plus any workflow/configuration files that affect the deployment. Retain the `workflow_run` trigger so successful recorder runs still publish updated data.

- **Benefit:** fewer redundant builds and deployments, with less CI time and clearer workflow activity.
- **Files:** `.github/workflows/deploy-pages.yml`, `README.md`
- **Status:** **Completed in v1.5.0.** Added path filters (`data/executions.json`, `app/**`, `.github/workflows/deploy-pages.yml`) while retaining `workflow_run` and `workflow_dispatch`.

## 2. Align Node versions across build and test workflows

CI currently tests with Node 22, while the Pages workflow and dashboard Docker build use Node 24. Choose a supported version and use it consistently across CI, deployment, and Docker builds.

- **Benefit:** tests run against the same runtime used to build and publish the dashboard, reducing runtime-related surprises.
- **Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`, `Dockerfile`
- **Status:** **Completed in v1.5.0 (see [ADR 0002](./ADR.md#adr-0002-build-runtime--ci-node-version-alignment)).** Standardized Node 24 across all environments.

## 3. Make local dashboard data consistent with production

Local development reads `app/public/executions.json`, currently an empty placeholder. Pages and the Docker build instead copy in `data/executions.json`. Add a documented sync command or development script that copies the canonical data file into the app's public directory before starting the dev server.

- **Benefit:** developers preview the same execution history users see in production without manually editing or replacing the placeholder.
- **Files:** `package.json`, `app/package.json`, `README.md`, `scripts/sync_data.py`
- **Status:** **Completed in v1.5.0.** Added `scripts/sync_data.py`, `npm run sync-data`, and automated `npm run dev` synchronization.

## 4. Refresh setup and deployment documentation

The README still instructs contributors to generate and commit `app/package-lock.json`, although the lockfile exists. It also describes Pages deployment as responding to changes to the execution data or app, while the current workflow triggers on all pushes to `main`. Update the instructions to match the actual workflow and retain one reliable source of truth for setup steps.

- **Benefit:** less confusion during onboarding and fewer mismatches between documented and actual behavior.
- **Files:** `README.md`, `PACKAGING.md`
- **Status:** **Completed in v1.5.0.** Removed stale lockfile instructions, updated workflow triggers, and updated container tags to `v1.5.0`.

## 5. Monitor data growth before changing storage

The recorder reads the full JSON array and rewrites it on every run, and the dashboard processes the full history. This is straightforward and appropriate for the current small dataset. Track the size of `data/executions.json` and build times; consider a storage or processing change only if growth creates a measurable problem.

Any future migration should preserve the append-only history, be documented, and receive human review. Avoid changing the data format preemptively.

- **Benefit:** avoids premature optimization while providing data growth visibility.
- **Files:** `scripts/record_execution.py`, `scripts/validate_executions.py`, `app/src/analytics.js`, `AGENTS.md`
- **Status:** **Completed in v1.5.0 (formalized in [ADR 0001](./ADR.md#adr-0001-defer-data-scaling-changes-and-maintain-append-only-json-log)).** Retained append-only JSON structure and added file-size telemetry to validation.

## Future Exploration (Post-1.5)

- **Execution Metrics History**: Track long-term trend statistics or export CSV/summary metrics if consumer tooling requires non-JSON formats.
- **Alerting & Notifications**: Evaluate optional webhooks or notifications if consecutive elevated delays occur.
