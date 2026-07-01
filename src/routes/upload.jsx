import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UploadCloud, X, Check, AlertCircle, Trash2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAnalysis } from "@/lib/analysis-store";
export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload MRI — Brain Tumor Segmentation" },
      {
        name: "description",
        content:
          "Upload your 4-channel MRI files (FLAIR, T1, T1CE, T2) in NIfTI format to run AI tumor segmentation.",
      },
    ],
  }),
  component: UploadPage,
});
const CHANNELS = ["FLAIR", "T1", "T1CE", "T2"];
const MAX_BYTES = 100 * 1024 * 1024;
function detectChannel(name) {
  const lower = name.toLowerCase();
  // Order matters: T1CE before T1
  if (lower.includes("flair")) return "FLAIR";
  if (lower.includes("t1ce") || lower.includes("t1c")) return "T1CE";
  if (lower.includes("t2")) return "T2";
  if (lower.includes("t1")) return "T1";
  return null;
}
function isNifti(name) {
  const lower = name.toLowerCase();
  return lower.endsWith(".nii") || lower.endsWith(".nii.gz");
}
function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function UploadPage() {
  const navigate = useNavigate();
  const { files, setFiles } = useAnalysis();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);
  const byChannel = useMemo(() => {
    const m = new Map();
    for (const f of files) m.set(f.channel, f);
    return m;
  }, [files]);
  const addFiles = useCallback(
    (list) => {
      const incoming = Array.from(list);
      const next = new Map(byChannel);
      let added = 0;
      for (const file of incoming) {
        if (!isNifti(file.name)) {
          toast.error(`Invalid format: ${file.name}`, {
            description: "Only .nii or .nii.gz accepted.",
          });
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`File too large: ${file.name}`, {
            description: `${formatBytes(file.size)} exceeds the 100 MB limit.`,
          });
          continue;
        }
        const channel = detectChannel(file.name);
        if (!channel) {
          toast.error(`Could not infer channel for ${file.name}`, {
            description: "Filename must contain FLAIR, T1, T1CE, or T2.",
          });
          continue;
        }
        if (next.has(channel)) {
          toast.warning(`${channel} replaced`, {
            description: file.name,
          });
        }
        next.set(channel, { file, channel });
        added++;
      }
      if (added > 0) {
        setFiles(Array.from(next.values()));
        toast.success(`${added} file${added > 1 ? "s" : ""} added`);
      }
    },
    [byChannel, setFiles],
  );
  const removeChannel = (c) => {
    setFiles(files.filter((f) => f.channel !== c));
  };
  const clearAll = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };
  const count = files.length;
  const ready = count === 4;
  const onNext = () => {
    if (!ready) return;
    setProcessing(true);
    navigate({ to: "/processing" });
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Step 1 of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Upload MRI files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide all four channels: FLAIR, T1, T1CE, and T2 (.nii or .nii.gz, max 100 MB each).
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={
          "flex h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground transition-colors " +
          (dragOver
            ? "border-primary bg-primary/10 text-foreground"
            : "border-primary/40 bg-card hover:border-primary/60 hover:bg-card/70")
        }
      >
        <UploadCloud className="mb-3 h-10 w-10 text-primary/80" />
        <p className="text-sm font-medium text-foreground">
          Drag MRI files here or click to browse
        </p>
        <p className="mt-1 text-xs">
          Filenames should contain the channel label (e.g. <code>brats_flair.nii.gz</code>)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".nii,.nii.gz,application/gzip"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            Channels <span className="text-muted-foreground">({count}/4 uploaded)</span>
          </p>
          <button
            type="button"
            onClick={clearAll}
            disabled={count === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        </div>
        <ul className="divide-y divide-border">
          {CHANNELS.map((c) => {
            const entry = byChannel.get(c);
            return (
              <li key={c} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-full " +
                    (entry ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")
                  }
                >
                  {entry ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{c}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry
                      ? `${entry.file.name} · ${formatBytes(entry.file.size)}`
                      : "Awaiting file"}
                  </p>
                </div>
                {entry && (
                  <button
                    type="button"
                    onClick={() => removeChannel(c)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${c}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {ready
            ? "All channels ready."
            : `Add ${4 - count} more file${4 - count === 1 ? "" : "s"} to continue.`}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!ready || processing}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? "Loading…" : "Next →"}
        </button>
      </div>
    </div>
  );
}
