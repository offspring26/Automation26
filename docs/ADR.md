# Architecture Decision Records (ADR)

## ADR 0001: Defer Data Scaling Changes and Maintain Append-Only JSON Log

### Status
Accepted

### Context
`data/executions.json` serves as the repository's single source of truth for execution telemetry. In version 1.4/1.5, the dataset contains fewer than 100 entries and is ~14 KB in size.

Each run of `scripts/record_execution.py` loads the JSON file, parses it, appends one execution record, and writes it back formatted with standard 2-space indentation. The React dashboard reads the full file at build/runtime.

Potential alternatives (e.g. SQLite via WASM, partitioned monthly JSON files, newline-delimited JSON Lines) were reviewed in `docs/archive.md`. However, prematurely changing the storage architecture introduces complexity, risks breaking downstream static consumption by GitHub Pages, and risks violating project safety constraints regarding history preservation.

### Decision
1. **Maintain Append-Only JSON**: Continue using single `data/executions.json` format while datasets remain small (<1 MB / ~5,000 runs, representing >10 years of daily executions).
2. **Track Storage and Validation Metrics**: Include file size tracking directly in `scripts/validate_executions.py` so each CI run and recording step reports size metrics.
3. **Threshold for Migration**: Only evaluate partitioned or stream-based storage if data size or dashboard build time degrades measurably.
4. **Safety Compliance**: Any future format evolution must preserve append-only history and provenance, be small and documented, and undergo explicit human review.

### Consequences
- **Positive**: Zero breaking changes to GitHub Pages static builds, simple diffs in Git history, minimal complexity.
- **Negative**: The entire JSON file is loaded into memory on each run, which is negligible at current scale (~14 KB).

---

## ADR 0002: Build Runtime & CI Node Version Alignment

### Status
Accepted

### Context
In version 1.4.0, CI tested the test suite and dashboard build using Node 22, whereas the GitHub Pages workflow and dashboard Docker image used Node 24. This created potential discrepancy between test verification and production deployment.

### Decision
Align the Node runtime across all environments to Node 24 (`node-version: 24` in `ci.yml`, `deploy-pages.yml`, and `FROM node:24-alpine` in `Dockerfile`).

### Consequences
- Consistent runtime across local container builds, CI checks, and production Pages deployments.
