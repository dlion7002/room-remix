# 08 - App Pages And Styles

## Step 1 - Replace `src/app/page.tsx`

What this file does: makes the Room Remix workbench the first screen.

Why it is needed: the hackathon demo should open directly into the usable agentic interface, not a marketing page.

Replace `room-remix/src/app/page.tsx`:

```tsx
import { RoomRemixWorkbench } from "@/components/room/RoomRemixWorkbench";

export default function Home() {
  return <RoomRemixWorkbench />;
}
```

Copy checkpoint:

```text
Expected path: src/app/page.tsx
Expected browser behavior: http://localhost:3000 opens directly into the Room Remix workbench.
```

## Step 2 - Replace `src/app/layout.tsx`

What this file does: defines app metadata and the root HTML structure.

Why it is needed: clear metadata helps the app feel intentional during local demos and screenshots.

Replace `room-remix/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Room Remix",
  description: "Verifiable Room-State Interior Design Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Copy checkpoint:

```text
Expected path: src/app/layout.tsx
Expected metadata: browser tab title is Room Remix.
```

## Step 3 - Replace `src/app/globals.css`

What this file does: defines global Tailwind import, base colors, and stable rendering defaults.

Why it is needed: the UI should be calm, dense, and easy to scan, because this is an operational design-agent tool.

Replace `room-remix/src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  background: #fafafa;
  color: #18181b;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: #fafafa;
}

body {
  min-height: 100%;
  margin: 0;
  background: #fafafa;
  color: #18181b;
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}
```

Copy checkpoint:

```text
Expected path: src/app/globals.css
Expected visual behavior: app uses a light, quiet, workbench-style base theme.
```

## Tailwind Version Note

What this note does: helps if your generated app uses the older Tailwind syntax.

Why it is needed: `create-next-app@latest` changes over time.

If your generated `globals.css` originally used these lines, keep them instead of `@import "tailwindcss";`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then paste the rest of the CSS below those lines.

## Step 4 - Optional `package.json` Name Update

What this change does: renames the app package.

Why it is needed: it makes terminal output and dependency metadata match the project.

In `room-remix/package.json`, set:

```json
{
  "name": "room-remix"
}
```

Do not replace the whole file with only that block. Change only the existing `name` field.

## Checkpoint

What this does: starts the development server.

Why it is needed: this is the first full UI smoke test.

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```
