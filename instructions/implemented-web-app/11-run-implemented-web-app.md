# 11 - Run The Implemented Web App

The web app has been implemented directly in:

```text
room-remix/
```

Use this file if you no longer want to manually copy the web-app boilerplate. Your learning focus can now be the agent architecture.

## Start Commands

Open Docker Desktop first.

Then run:

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

If Docker says it cannot find `dockerDesktopLinuxEngine`, Docker Desktop is not running yet.

## What To Learn

Skip most web boilerplate and study these files:

```text
src/lib/types/room-remix.ts
src/lib/ai/provider.ts
src/lib/ai/mock-provider.ts
src/lib/ai/prompts.ts
src/lib/orchestrator/tools.ts
src/lib/orchestrator/room-remix-orchestrator.ts
src/lib/generative-ui/component-registry.ts
```

These files show the agent design:

- canonical Room State;
- provider adapter boundary;
- mock AI outputs;
- tool-style orchestration;
- preview prompt construction;
- fidelity validation loop;
- generative UI component registry.

The detailed startup guide is also available at:

```text
room-remix/START_HERE.md
```

