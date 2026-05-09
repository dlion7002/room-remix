# 09 - Run Demo And Verify

## Step 1 - Start Postgres And pgAdmin

What this command does: starts the local database and database inspector.

Why it is needed: the Room Remix workflow persists projects, room photos, room states, previews, reports, and interaction events.

```powershell
npm run db:up
```

Open pgAdmin:

```text
http://localhost:5050
```

Login:

```text
Email: admin@roomremix.local
Password: room_remix_admin
```

Add a server in pgAdmin:

```text
Host: postgres
Port: 5432
Database: room_remix
Username: room_remix
Password: room_remix_password
```

## Step 2 - Apply Database Migrations

What this command does: creates or updates your local database tables from `prisma/schema.prisma`.

Why it is needed: the API routes will fail if the tables do not exist.

```powershell
npm run db:migrate
```

## Step 3 - Generate Prisma Client

What this command does: regenerates the TypeScript database client.

Why it is needed: every time the Prisma schema changes, the client must be regenerated.

```powershell
npm run db:generate
```

## Step 4 - Run The App

What this command does: starts the Next.js dev server.

Why it is needed: this is how you test the full workflow in the browser.

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Step 5 - Run Static Checks

What these commands do: run linting and a production build.

Why it is needed: the guide should copy-paste into code that passes both development and production checks.

```powershell
npm run lint
npm run build
```

## Step 6 - Manual Demo Flow

What this flow does: validates the complete mock-mode product path.

Why it is needed: this is the baseline demo you should always keep working during the hackathon.

1. Click `Use mock room`.
2. Click `Analyze`.
3. Confirm the detected elements and locks.
4. Click `Save state`.
5. Select style, budget, goal, and constraints.
6. Click `Generate design board`.
7. Accept or reject one refinement patch.
8. Click `Save patches`.
9. Click `Generate preview`.
10. Read the fidelity report.
11. Click one user fidelity response.
12. Inspect the Room State JSON and Agent Trace.

Expected result:

```text
The app shows a source image, analysis, grid map, detected objects, preferences, design board, patches, preview placeholder, fidelity report, feedback controls, agent trace, and Room State inspector.
```

## Step 7 - Inspect Database Records

What this does: confirms persistence is working, not just client-side state.

Why it is needed: the project story depends on stateful agent memory.

In Prisma Studio:

```powershell
npm run db:studio
```

Check these tables:

```text
Project
RoomPhoto
RoomState
Preview
FidelityReport
InteractionEvent
```

You should see:

- one project;
- one source photo;
- multiple Room State versions as you confirm and refine;
- one preview;
- one fidelity report;
- several interaction events.

## Step 8 - Verify Error Handling

What this step does: confirms failed API responses show a visible UI error and do not leave buttons stuck in a loading state.

Why it is needed: hackathon demos often hit missing database or provider configuration; failures should be explainable.

Test one failure path:

```text
1. Stop Postgres with docker compose stop postgres.
2. In the browser, try Analyze or Generate design board.
3. Confirm the red error alert appears.
4. Confirm the button stops showing its loading text.
5. Restart Postgres with npm run db:up.
```

## Step 9 - Common Fixes

### Dynamic Route Params Error

What this means: your installed Next.js version uses the older synchronous `params` type.

Why it happens: dynamic route API typings changed between Next versions.

Fix each API route context from:

```ts
interface RouteContext {
  params: Promise<{ projectId: string }>;
}

const { projectId } = await context.params;
```

to:

```ts
interface RouteContext {
  params: { projectId: string };
}

const { projectId } = context.params;
```

### Tailwind Import Error

What this means: your Tailwind version expects older directives.

Why it happens: generated Next.js templates differ by Tailwind major version.

Replace:

```css
@import "tailwindcss";
```

with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Prisma Cannot Connect

What this means: Postgres is not running or the URL does not match Docker.

Why it happens: local services may not have started yet.

Run:

```powershell
docker compose ps
npm run db:up
npm run db:migrate
```

### Upload Fails

What this means: the uploaded file type is not JPEG, PNG, or WEBP.

Why it happens: the local upload helper only accepts image types the preview flow expects.

Use:

```text
.jpg
.jpeg
.png
.webp
```

## Definition Of Done

The skeleton is complete when:

- mock mode works end to end;
- database records are created;
- `npm run lint` passes;
- `npm run build` passes;
- the Room State inspector shows objects, grid, relations, edit contract, preferences, plan, and patches;
- the preview step always creates a fidelity report;
- the user is always asked whether the preview stayed faithful;
- failed API responses show a visible error and clear loading state.
