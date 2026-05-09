"use client";

import { useState } from "react";
import { ImageUp, Loader2, Sparkles } from "lucide-react";

interface RoomUploadCardProps {
  onProjectReady: (input: { projectId: string; imageUrl: string }) => void;
}

export function RoomUploadCard({ onProjectReady }: RoomUploadCardProps) {
  const [title, setTitle] = useState("Warm modern bedroom remix");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createProject(useMockImage = false) {
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = "/preview-placeholder.svg";

      if (!file && !useMockImage) {
        throw new Error("Choose a room photo or use the mock room.");
      }

      if (file && !useMockImage) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed.");
        }

        const upload = (await uploadResponse.json()) as { url: string };
        imageUrl = upload.url;
      }

      const projectResponse = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl }),
      });

      if (!projectResponse.ok) {
        throw new Error("Project creation failed. Is Postgres running?");
      }

      const data = (await projectResponse.json()) as {
        project: { id: string };
      };
      onProjectReady({ projectId: data.project.id, imageUrl });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white">
          <ImageUp size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Source room</h2>
          <p className="text-sm text-zinc-600">
            Upload the image the agent must preserve.
          </p>
        </div>
      </div>

      <label className="block text-sm font-medium text-zinc-700">
        Project title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Room photo
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-md border border-dashed border-zinc-300 p-3 text-sm"
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void createProject(false)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ImageUp size={16} />}
          Create from upload
        </button>
        <button
          type="button"
          onClick={() => void createProject(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
        >
          <Sparkles size={16} />
          Use mock room
        </button>
      </div>
    </section>
  );
}

