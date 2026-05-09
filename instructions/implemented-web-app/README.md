# Implemented Web App Instructions

These documents are mostly web-app setup and implementation references. The actual app has already been created in:

```text
room-remix/
```

Use the app startup guide first:

[../../room-remix/START_HERE.md](../../room-remix/START_HERE.md)

## Practical Run Path

From the repository root:

```powershell
cd "C:\AAMisArchivos\AAprogramming\AI-Sysems\AI Tinkerers hackathon\room-remix"
npm run db:up
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

Open:

```text
http://localhost:3000
```

If Docker reports that `dockerDesktopLinuxEngine` cannot be found, open Docker Desktop first and wait for it to finish starting.

## Files In This Folder

1. [00-learning-path.md](00-learning-path.md)
2. [01-bootstrap-app.md](01-bootstrap-app.md)
3. [02-database-env-and-storage.md](02-database-env-and-storage.md)
4. [06-api-routes.md](06-api-routes.md)
5. [07-ui-components.md](07-ui-components.md)
6. [08-app-pages-and-styles.md](08-app-pages-and-styles.md)
7. [09-run-demo-and-verify.md](09-run-demo-and-verify.md)
8. [11-run-implemented-web-app.md](11-run-implemented-web-app.md)

## What Not To Spend Time On

Since the web app is already implemented, you do not need to manually copy these files unless you want to practice setup. For learning the agent design, go to:

[../agent-system/README.md](../agent-system/README.md)

## GitHub Desktop Note

If GitHub Desktop complains about `room-remix`, read:

[../github-desktop-error.md](../github-desktop-error.md)

The short version: the workspace currently has a root Git repository and `room-remix/` also contains its own `.git` folder. GitHub Desktop can treat that as an embedded repository instead of normal project files.
