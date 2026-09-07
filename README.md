# Automation26 — daily 03:14 execution tracker

![GitHub License](https://img.shields.io/github/license/offspring26/Automation26)
![GitHub Release](https://img.shields.io/github/v/release/offspring26/Automation26)

Every day at **03:14 UTC**, a GitHub Action runs, records the exact time it
actually started (cron start times drift under load — that's the point of
this), and appends the record to `data/executions.json`. Manual runs
(`workflow_dispatch`) are recorded too, tagged separately, with no delay
computed since they have no scheduled time to compare against.

A second workflow rebuilds a small Vite/React dashboard and deploys it to
GitHub Pages every time the data changes, showing a bar chart of delay (in
minutes) per scheduled run.

## Repo layout

```
.github/workflows/
  record-execution.yml   # cron '14 3 * * *' + workflow_dispatch → appends to data/executions.json
  deploy-pages.yml       # on push to data/executions.json or app/** → builds + deploys app/
scripts/
  record_execution.py    # computes actual vs scheduled time, appends the record
data/
  executions.json        # the "database" — append-only JSON log, committed by CI
app/                      # Vite + React dashboard, fetches data/executions.json at build time
```

## One-time setup

1. **Copy these files into your repo root** (preserving the directory
   structure above), commit, and push to `main`.

2. **Allow the workflow to push commits back to the repo.**
   Go to `Settings → Actions → General → Workflow permissions` and select
   **"Read and write permissions"**. Without this, `record-execution.yml`
   can't push the updated `data/executions.json`.

3. **Enable GitHub Pages via Actions.**
   Go to `Settings → Pages → Build and deployment → Source` and choose
   **"GitHub Actions"** (not "Deploy from a branch"). `deploy-pages.yml`
   handles the rest.

4. **Check the base path.** `app/vite.config.js` sets
   `base: '/Automation26/'`, which is correct for a project site at
   `https://offspring26.github.io/Automation26/`. If you ever rename the
   repo, update this to match.

5. **Generate a lockfile once**, since `deploy-pages.yml` uses `npm ci`
   (which requires `package-lock.json`):
   ```bash
   cd app
   npm install
   git add package-lock.json
   git commit -m "chore: add lockfile"
   git push
   ```

6. **Trigger it.** Either wait for 03:14 UTC, or go to
   `Actions → Record Scheduled Execution → Run workflow` to fire it
   manually right away and confirm the whole pipeline (record → commit →
   deploy) works end to end.

## How the delay is computed

For scheduled runs, `scripts/record_execution.py` takes the run's actual
UTC timestamp and compares it to that same day's `03:14:00 UTC` — the
difference in seconds is `delay_seconds`. Manual runs get
`scheduled_time_utc: null` and `delay_seconds: null`, and show up on the
chart in grey with no bar height.

## Local development

```bash
cd app
npm install
npm run dev
```

The dev server reads `app/public/executions.json` (currently an empty
array as a placeholder) — drop some sample records in there matching the
schema used in `data/executions.json` if you want to preview the chart
with data before the first real run happens.
