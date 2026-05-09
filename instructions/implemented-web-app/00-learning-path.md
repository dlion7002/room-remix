# 00 - Learning Path

## What You Will Build

You will manually implement a complete skeleton for Room Remix:

- a Next.js app shell;
- a local Postgres database with Prisma;
- local image upload storage;
- typed room-state models;
- mock AI adapters;
- tool-style orchestration functions;
- API routes;
- a generative-UI-inspired workbench;
- demo data and a fidelity loop.

## Why This Order Matters

The order follows the real architecture:

```text
Foundation -> schema -> types -> mocks -> orchestrator -> API -> UI -> demo -> real AI upgrades
```

This helps you learn the system from the inside out. You first define what the app remembers, then you define how fake and real providers plug in, and only then do you build the interface.

## Main Rule While Implementing

After each instruction file, run the checkpoint commands in that file before moving on. Small checkpoints make debugging much easier during a hackathon.

## Folder You Will Create

Create the real app in:

```text
room-remix/
```

This keeps the app separate from the planning documents and these instructions.

## Skeleton Philosophy

Build the full workflow before polishing:

- The user can upload or use a mock room image.
- The app stores a project.
- The app analyzes the room with mock AI.
- The app shows Room State, grid, objects, locks, and confidence.
- The user confirms or adjusts important facts.
- The app generates a design plan from structured state.
- The user can refine specific design items.
- The user requests a preview.
- The app creates a mock preview and a fidelity report.
- The user confirms whether the preview stayed faithful.

