import Image from "next/image";

interface PreviewPanelProps {
  preview?: {
    id: string;
    generatedImageUrl: string;
    promptSummary: string;
    generationProvider: string;
  };
  disabled?: boolean;
  isLoading?: boolean;
  onGenerate: () => void;
}

export function PreviewPanel({
  preview,
  disabled,
  isLoading,
  onGenerate,
}: PreviewPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Preview</h2>
          <p className="text-sm text-zinc-600">
            Generated only from the active Room State.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isLoading}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate preview"}
        </button>
      </div>

      {preview ? (
        <div className="mt-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            <Image
              src={preview.generatedImageUrl}
              alt="Generated room preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
            Provider: {preview.generationProvider}
          </p>
          <p className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-700">
            {preview.promptSummary}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Generate a design plan first, then request a preview.
        </p>
      )}
    </section>
  );
}

