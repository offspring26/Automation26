# Repository Optimization Ideas

This note collects potential improvements for Automation26. The recommendations are prioritized for practical impact and preserve the repository's append-only execution history.

## 1. Avoid unnecessary GitHub Pages builds

`deploy-pages.yml` currently runs on every push to `main`, even when only documentation or unrelated files change. Add path filters for dashboard and execution-data changes, plus any workflow/configuration files that affect the deployment. Retain the `workflow_run` trigger so successful recorder runs still publish updated data.

**Benefit:** fewer redundant builds and deployments, with less CI time and clearer workflow activity.

**Files:** `.github/workflows/deploy-pages.yml`, `README.md`

## 2. Align Node versions across build and test workflows

CI currently tests with Node 22, while the Pages workflow and dashboard Docker build use Node 24. Choose a supported version and use it consistently across CI, deployment, and Docker builds.

**Benefit:** tests run against the same runtime used to build and publish the dashboard, reducing runtime-related surprises.

**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`, `Dockerfile`

## 3. Make local dashboard data consistent with production

Local development reads `app/public/executions.json`, currently an empty placeholder. Pages and the Docker build instead copy in `data/executions.json`. Add a documented sync command or development script that copies the canonical data file into the app's public directory before starting the dev server.

**Benefit:** developers preview the same execution history users see in production without manually editing or replacing the placeholder.

**Files:** `package.json`, `README.md`, optionally a small script under `scripts/`

## 4. Refresh setup and deployment documentation

The README still instructs contributors to generate and commit `app/package-lock.json`, although the lockfile exists. It also describes Pages deployment as responding to changes to the execution data or app, while the current workflow triggers on all pushes to `main`. Update the instructions to match the actual workflow and retain one reliable source of truth for setup steps.

**Benefit:** less confusion during onboarding and fewer mismatches between documented and actual behavior.

**Files:** `README.md`, `PACKAGING.md`

## 5. Monitor data growth before changing storage

The recorder reads the full JSON array and rewrites it on every run, and the dashboard processes the full history. This is straightforward and appropriate for the current small dataset. Track the size of `data/executions.json` and build times; consider a storage or processing change only if growth creates a measurable problem.

Any future migration should preserve the append-only history, be documented, and receive human review. Avoid changing the data format preemptively.

**Files:** `scripts/record_execution.py`, `app/src/analytics.js`, `AGENTS.md`

## Suggested order

1. Update stale README instructions.
2. Align Node versions.
3. Add Pages path filters and verify recorder-triggered deployments still work.
4. Add a local data-sync command.
5. Measure data growth and revisit storage only when needed.
