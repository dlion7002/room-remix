# 02 - Database, Environment, And Storage

## Step 1 - Create `.env.example`

What this file does: documents the environment variables the app expects.

Why it is needed: hackathon projects often move between machines. This gives you a safe template without committing real secrets.

Create `room-remix/.env.example`:

```env
DATABASE_URL="postgresql://room_remix:room_remix_password@localhost:5432/room_remix?schema=public"
ROOM_REMIX_AI_PROVIDER="mock"
NEXT_PUBLIC_APP_NAME="Room Remix"
```

## Step 2 - Create `.env` And `.env.local`

What these files do: store your local development values.

Why it is needed: Prisma CLI reads `.env` for `DATABASE_URL`, while Next.js reads `.env.local` during development. Keeping the same local values in both files avoids migration and runtime mismatch.

Create `room-remix/.env`:

```env
DATABASE_URL="postgresql://room_remix:room_remix_password@localhost:5432/room_remix?schema=public"
ROOM_REMIX_AI_PROVIDER="mock"
NEXT_PUBLIC_APP_NAME="Room Remix"
```

Create `room-remix/.env.local`:

```env
DATABASE_URL="postgresql://room_remix:room_remix_password@localhost:5432/room_remix?schema=public"
ROOM_REMIX_AI_PROVIDER="mock"
NEXT_PUBLIC_APP_NAME="Room Remix"
```

Copy checkpoint:

```text
Expected paths: .env.example, .env, and .env.local
Expected result: all three files contain DATABASE_URL and ROOM_REMIX_AI_PROVIDER="mock".
```

## Step 3 - Create `docker-compose.yml`

What this file does: starts local Postgres and pgAdmin.

Why it is needed: Postgres persists projects, room states, previews, fidelity reports, and interaction events. pgAdmin lets you inspect the database during the demo.

Create `room-remix/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: room-remix-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: room_remix
      POSTGRES_PASSWORD: room_remix_password
      POSTGRES_DB: room_remix
    ports:
      - "5432:5432"
    volumes:
      - room_remix_postgres:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: room-remix-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@roomremix.local
      PGADMIN_DEFAULT_PASSWORD: room_remix_admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  room_remix_postgres:
```

Copy checkpoint:

```text
Expected path: docker-compose.yml
Expected result: Postgres exposes port 5432 and pgAdmin exposes port 5050.
```

## SQLite Quick Mode Fallback

What this note does: gives you a temporary fallback if Docker or Postgres blocks learning.

Why it is needed: Postgres is the best default for the event/CV story, but SQLite can help you keep moving on a constrained machine.

Only use this fallback if local Postgres is unavailable:

```text
1. Change DATABASE_URL to "file:./dev.db".
2. Change datasource provider in prisma/schema.prisma from "postgresql" to "sqlite".
3. Skip pgAdmin instructions because SQLite does not use pgAdmin.
4. Switch back to Postgres before the hackathon demo if possible.
```

## Step 4 - Create `prisma/schema.prisma`

What this file does: defines the persistent database model.

Why it is needed: the app must remember a project across steps instead of acting like a one-shot prompt wrapper. This version uses the Prisma 7 `prisma-client` generator and writes the generated client into `src/generated/prisma`.

Create `room-remix/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Project {
  id                String             @id @default(cuid())
  title             String
  status            String             @default("draft")
  activeRoomStateId String?
  activePreviewId   String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  photos            RoomPhoto[]
  roomStates        RoomState[]
  previews          Preview[]
  interactionEvents InteractionEvent[]

  @@index([status])
}

model RoomPhoto {
  id              String   @id @default(cuid())
  projectId       String
  originalImageUrl String
  width           Int?
  height          Int?
  uploadedAt      DateTime @default(now())
  isSourceOfTruth Boolean  @default(true)

  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

model RoomState {
  id           String   @id @default(cuid())
  projectId    String
  version      Int
  roomShell    Json
  camera       Json
  grid         Json
  objects      Json
  relations    Json
  editContract Json
  preferences  Json?
  designPlan   Json?
  patches      Json
  source       String
  createdAt    DateTime @default(now())

  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  previews     Preview[]

  @@unique([projectId, version])
  @@index([projectId])
}

model Preview {
  id                 String          @id @default(cuid())
  projectId          String
  roomStateId         String
  generatedImageUrl   String
  promptSummary       String
  generationProvider  String
  userFidelityStatus  String?
  createdAt           DateTime        @default(now())

  project             Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  roomState           RoomState       @relation(fields: [roomStateId], references: [id], onDelete: Cascade)
  fidelityReport      FidelityReport?

  @@index([projectId])
  @@index([roomStateId])
}

model FidelityReport {
  id                       String   @id @default(cuid())
  previewId                String   @unique
  systemScore              Float
  windowPreserved          Boolean
  cameraAnglePreserved     Boolean
  bedPositionPreserved     Boolean
  deskPositionPreserved    Boolean
  lockedObjectsPreserved   Boolean
  styleApplied             Boolean
  unexpectedChanges        Json
  recommendedAction        String
  userFeedback             Json?
  createdAt                DateTime @default(now())

  preview                  Preview  @relation(fields: [previewId], references: [id], onDelete: Cascade)
}

model InteractionEvent {
  id            String   @id @default(cuid())
  projectId     String
  type          String
  inputSummary  String
  outputSummary String
  payload       Json?
  createdAt     DateTime @default(now())

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([type])
}
```

Copy checkpoint:

```text
Expected path: prisma/schema.prisma
Expected compile status: npm run db:generate should create src/generated/prisma.
Expected Prisma Studio tables later: Project, RoomPhoto, RoomState, Preview, FidelityReport, InteractionEvent.
```

## Step 5 - Create `prisma.config.ts`

What this file does: tells Prisma where the schema and migrations live, and loads `DATABASE_URL` from your environment.

Why it is needed: Prisma 7 keeps the datasource URL in config instead of directly inside `schema.prisma`.

Create `room-remix/prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Copy checkpoint:

```text
Expected path: prisma.config.ts
Expected result: Prisma CLI can read DATABASE_URL from .env.
```

## Step 6 - Create `src/lib/db.ts`

What this file does: creates one shared Prisma client.

Why it is needed: Next.js hot reload can create many module instances in development. This pattern prevents unnecessary database clients and uses the PostgreSQL adapter required by the generated Prisma client.

Create `room-remix/src/lib/db.ts`:

```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

Copy checkpoint:

```text
Expected path: src/lib/db.ts
Expected compile status: TypeScript should resolve PrismaClient from @/generated/prisma/client after npm run db:generate.
```

## Step 7 - Create `src/lib/storage/local.ts`

What this file does: saves uploaded files into `public/uploads` and returns a URL.

Why it is needed: local storage is enough for a hackathon skeleton, and the database can store the returned URL.

Create `room-remix/src/lib/storage/local.ts`:

```ts
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function saveLocalUpload(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG, and WEBP room photos are supported.");
  }

  const extension = file.type.split("/")[1] ?? "png";
  const fileName = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), bytes);

  return {
    fileName,
    url: `/uploads/${fileName}`,
    size: file.size,
    contentType: file.type,
  };
}
```

Copy checkpoint:

```text
Expected path: src/lib/storage/local.ts
Expected behavior: API routes can save JPEG, PNG, and WEBP files into public/uploads.
```

## Step 8 - Start The Database And Run Prisma

What this does: starts Postgres, creates the first migration, and generates the Prisma client.

Why it is needed: API routes and orchestrator functions need a real database client.

```powershell
npm run db:up
npm run db:migrate -- --name init
npm run db:generate
```

Copy checkpoint:

```text
Expected database status: Postgres is running.
Expected Prisma status: migration is applied and src/generated/prisma is generated.
What to inspect in Prisma Studio: empty tables with the model names from schema.prisma.
```

## Checkpoint

What this does: opens Prisma Studio so you can inspect the empty tables.

Why it is needed: it confirms the database is reachable before you build app logic.

```powershell
npm run db:studio
```
