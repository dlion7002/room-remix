# 01 - Bootstrap The App

## Step 1 - Create The Next.js App

What this does: creates the actual application folder and installs the core React, TypeScript, Tailwind, and App Router setup.

Why it is needed: Room Remix needs an interactive web UI, API routes, and server-side code in one project. Next.js gives you all three quickly.

First check Node.js:

```powershell
node --version
```

Copy checkpoint:

```text
Expected: Node.js 20.9 or newer.
Why: current Next.js versions require a modern Node runtime.
```

Run this from the workspace root:

```powershell
npx create-next-app@latest room-remix --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --webpack --no-react-compiler --yes
```

If the CLI still prompts, choose:

```text
TypeScript: Yes
Linter: ESLint
React Compiler: No
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Turbopack/Webpack: Webpack
Import alias: @/*
Package manager: npm
```

Copy checkpoint:

```text
Expected path: room-remix/package.json
Expected result: the app folder exists and uses TypeScript, Tailwind, ESLint, App Router, and src/.
```

## Step 2 - Enter The App Folder

What this does: moves your terminal into the app you just created.

Why it is needed: every later command assumes you are inside `room-remix`.

```powershell
cd room-remix
```

Copy checkpoint:

```text
Expected path: room-remix/
Expected result: your terminal prompt is inside the new app folder.
```

## Step 3 - Install Runtime Dependencies

What this does: adds packages for database access, validation, IDs, UI icons, and small styling helpers.

Why it is needed: these packages support persistence, typed data boundaries, and a polished but lightweight interface. The `@prisma/adapter-pg` and `pg` packages are needed by the Prisma 7 PostgreSQL client setup used in this project.

```powershell
npm install @prisma/client @prisma/adapter-pg pg zod nanoid lucide-react clsx class-variance-authority
```

Copy checkpoint:

```text
Expected path: room-remix/package.json
Expected result: dependencies include Prisma client, Prisma PG adapter, pg, Zod, Lucide, and UI utility packages.
```

## Step 4 - Install Development Dependencies

What this does: adds Prisma's CLI for migrations and generated database clients, plus TypeScript types for the `pg` package.

Why it is needed: Prisma turns the database schema into a typed client you can use from API routes and orchestrator functions.

```powershell
npm install -D prisma @types/pg
```

Copy checkpoint:

```text
Expected path: room-remix/package.json
Expected result: devDependencies include prisma and @types/pg.
```

## Step 5 - Add Helpful Package Scripts

What this does: gives common database commands short names.

Why it is needed: during the hackathon you will run these repeatedly, and short scripts reduce setup friction.

Open `room-remix/package.json` and make sure the `scripts` section includes:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio",
  "db:up": "docker compose up -d"
}
```

Copy checkpoint:

```text
Expected path: package.json
Expected result: npm run db:up, npm run db:generate, npm run db:migrate, and npm run db:studio are available.
```

## Step 6 - Create The Project Folders

What this does: creates the file structure for the room-state system, mock providers, orchestration layer, reusable UI components, and local upload storage.

Why it is needed: the project is easier to understand when each part of the agent workflow has a clear home.

```powershell
New-Item -ItemType Directory -Force `
  prisma, `
  public/uploads, `
  src/lib/ai, `
  src/lib/catalog, `
  src/lib/mock, `
  src/lib/orchestrator, `
  src/lib/storage, `
  src/lib/types, `
  src/components/room, `
  src/app/api/uploads, `
  src/app/api/projects, `
  src/app/api/projects/[projectId]/analyze, `
  src/app/api/projects/[projectId]/state, `
  src/app/api/projects/[projectId]/plan, `
  src/app/api/projects/[projectId]/preview, `
  src/app/api/projects/[projectId]/feedback
```

Copy checkpoint:

```text
Expected paths: src/lib/orchestrator/, src/components/room/, src/app/api/projects/[projectId]/preview/
Expected result: all folders exist before you start copying code into them.
```

## Folder Map

What these folders mean:

```text
prisma/
  Database schema and migrations.

public/uploads/
  Local hackathon image storage. The app stores file URLs in Postgres.

src/lib/types/
  TypeScript definitions for Room State, design plans, previews, and fidelity reports.

src/lib/mock/
  Mock room analysis, mock room state, and sample outputs.

src/lib/catalog/
  Generic design archetypes, not real products.

src/lib/ai/
  Provider interfaces and mock provider implementation.

src/lib/orchestrator/
  Tool-style workflow functions such as analyze, patch state, plan, preview, and validate.

src/lib/storage/
  Local file upload helper.

src/components/room/
  Reusable UI panels for the Room Remix workflow.

src/app/api/
  Next.js route handlers for upload, project creation, analysis, state patching, planning, preview, and feedback.
```

## Checkpoint

What this does: verifies that the fresh app still compiles before you add custom code.

Why it is needed: if the base app is broken, you want to know before adding the Room Remix layers.

```powershell
npm run lint
```
