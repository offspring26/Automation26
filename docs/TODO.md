# TODO

This is just a draft file. First version, it should later be extended to be an ADR - Architecture Decision Record.

The biggest practical wins are reducing unnecessary CI work and correcting a few mismatches between the documentation and actual behavior. The dashboard’s data file is only about 14 KB, so I wouldn’t prioritize performance changes yet.

1. **Avoid rebuilding Pages for unrelated pushes.** `deploy-pages.yml` runs on every push to `main`, including documentation-only changes. Add path filters for dashboard/data changes (and relevant workflow files), while keeping the `workflow_run` trigger for recorder updates. This should reduce redundant builds and deploys. Workflow · README’s stated trigger behavior
2. **Use one Node version across CI and release builds.** CI tests with Node 22, while the Pages workflow and dashboard Docker build use Node 24. Align them so tests exercise the same runtime used for publishing. CI · Pages build · Docker build
3. **Make local dashboard data match production.** Local development reads app/public/executions.json, which is currently an empty placeholder; Pages and Docker builds copy in data/executions.json. Add a local sync/dev command so developers see the real log without manually replacing the placeholder. README · Pages data copy · Docker data copy
4. **Update stale README instructions.** It says to generate and commit the npm lockfile, but app/package-lock.json is already present. It also describes Pages as responding to data/app changes, whereas the workflow currently responds to all pushes to main. Keeping setup and trigger instructions aligned with the actual configuration will make onboarding more reliable. README · Lockfile
5. **Defer data-scaling changes until there’s evidence they’re needed.** The recorder loads and rewrites the complete JSON array on each run, and the dashboard processes the full history. That could become costly as the log grows, but changing the format or write path would affect the append-only history and its consumers. Track file size/build time first; any migration should be small, documented, and human-reviewed under the project’s safety rules. Recorder · Safety rules
