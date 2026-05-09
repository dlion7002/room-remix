# Room Remix - Start Here

This app is already implemented so you can focus your learning on the agent parts.

## What You Need Running

- Node.js 20.9 or newer.
- Docker Desktop, for local Postgres.
- npm, already used by this project.

## First Start

From this folder:

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

If `npm run db:up` says it cannot find `dockerDesktopLinuxEngine`, open Docker Desktop first and wait until it says the engine is running. Then rerun:

```powershell
npm run db:up
npm run db:migrate -- --name init
```

The page can load without Postgres, but the mock-room workflow needs the database because projects and Room State versions are persisted through API routes.

## Demo Flow

1. Click `Use mock room`.
2. Click `Analyze`.
3. Confirm or change detected object locks.
4. Click `Save state`.
5. Pick preferences.
6. Click `Generate design board`.
7. Accept or reject a patch.
8. Click `Save patches`.
9. Click `Generate preview`.
10. Answer the fidelity question.

## Agent Files To Study

Start here if your goal is learning agent architecture:

```text
src/lib/types/room-remix.ts
```

Defines the canonical Room State and structured outputs. This is the contract that keeps the agent from becoming random chat.

```text
src/lib/agent/langchain-tools.ts
src/lib/agent/room-remix-graph.ts
```

Shows the minimal LangChain Core tool wrappers and LangGraph StateGraph workflows. This is the CV-friendly agent runtime: graph orchestration, typed tools, provider adapters, Room State, and fidelity validation.

```text
src/lib/ai/provider.ts
src/lib/ai/mock-provider.ts
src/lib/ai/prompts.ts
```

Shows the provider boundary. Replace the mock provider with Gemini, OpenAI, or event APIs later without rewriting the app.

```text
src/lib/orchestrator/tools.ts
src/lib/orchestrator/room-remix-orchestrator.ts
```

This is the persistence workflow around the graph: save projects, version Room State, call LangGraph runners, persist previews, validate fidelity, and record user feedback.

```text
src/lib/generative-ui/component-registry.ts
src/components/room/RoomRemixWorkbench.tsx
```

Shows how structured agent outputs become interactive UI panels instead of plain text.

## Database Inspection

Open pgAdmin:

```text
http://localhost:5050
```

Login:

```text
Email: admin@roomremix.local
Password: room_remix_admin
```

Register a server:

```text
Host: postgres
Port: 5432
Database: room_remix
Username: room_remix
Password: room_remix_password
```

You should see records in:

```text
Project
RoomPhoto
RoomState
Preview
FidelityReport
InteractionEvent
```

## Mock Mode

The app uses mock AI by default:

```env
ROOM_REMIX_AI_PROVIDER="mock"
```

That is intentional. It lets you learn the agent flow before connecting real model APIs.

## Agent Runtime Summary

```text
UI -> API route -> Prisma orchestrator -> LangGraph StateGraph -> LangChain Core tools + RoomAiProvider
```

LangGraph coordinates the multi-step agent flow. LangChain Core is used only for deterministic tools. The custom provider adapter still owns model-specific calls, so mock mode and future real providers use the same graph.

## Known Limitations

- The mock preview is a placeholder image.
- The fidelity report is simulated.
- Uploaded images are stored locally in `public/uploads`.
- The agent provider is designed to be swapped later without changing the LangGraph workflow.
