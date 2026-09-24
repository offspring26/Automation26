# Hybrid packaging

This repository now includes a hybrid package for the React dashboard and Python
execution recorder:

- `Dockerfile` builds the Vite dashboard and serves the static output with Nginx.
- `Dockerfile.recorder` packages `scripts/record_execution.py` in a small Python image.
- `docker-compose.yml` provides `dashboard` and on-demand `recorder` services.
- The root `package.json` provides convenient npm wrappers around local and Docker commands.

## Run the dashboard

```bash
docker compose build dashboard
docker compose up dashboard
```

Open <http://localhost:8080/Automation26/>.

The dashboard is built with the current `data/executions.json`. After recording
new data, rebuild the dashboard image to include it:

```bash
docker compose run --rm recorder
docker compose build dashboard
docker compose up dashboard
```

The recorder defaults to a manual (`workflow_dispatch`) record. To simulate a
scheduled run, set the event name explicitly:

```bash
GITHUB_EVENT_NAME=schedule docker compose run --rm recorder
```

The recorder writes to the host `data/` directory through the compose volume.
It does not commit or push changes; GitHub Actions remains responsible for the
repository's append-only data workflow.

## Local npm commands

```bash
npm install --prefix app
npm run dev
npm run build
```

The existing GitHub Pages workflow remains unchanged and continues to be the
canonical deployment path for the public dashboard.
