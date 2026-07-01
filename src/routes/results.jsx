import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Download, FileJson } from "lucide-react";
import { useEffect } from "react";
import { useAnalysis } from "@/lib/analysis-store";
export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — Brain Tumor Segmentation" },
      {
        name: "description",
        content:
          "View tumor sub-region segmentation, volume statistics, 3D mesh, and download a clinical report.",
      },
    ],
  }),
  component: ResultsPage,
});
function ResultsPage() {
  const navigate = useNavigate();
  const { result, files, reset } = useAnalysis();
  useEffect(() => {
    if (!result) navigate({ to: "/upload" });
  }, [result, navigate]);
  if (!result) return null;
  const downloadJson = () => {
    const payload = {
      timestamp: result.timestamp,
      inferenceMs: result.inferenceMs,
      statusText: result.statusText,
      voxelCountsHtml: result.voxelCountsHtml,
      summaryMd: result.summaryMd,
      inputs: files.map((f) => ({ channel: f.channel, name: f.file.name })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segmentation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Step 3 of 3</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">Segmentation results</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Inference completed in {(result.inferenceMs / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadJson}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            <FileJson className="h-4 w-4" /> JSON
          </button>
          <a
            href={result.maskUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            <Download className="h-4 w-4" /> Mask
          </a>
          <Link
            to="/upload"
            onClick={() => reset()}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            New analysis
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
        <ImageCard title="FLAIR" url={result.flairUrl} />

        <ImageCard title="T1" url={result.t1Url} />

        <ImageCard title="T1CE" url={result.t1ceUrl} />

        <ImageCard title="T2" url={result.t2Url} />

        <ImageCard title="Segmentation Mask" url={result.maskUrl} />

        <ImageCard title="Overlay" url={result.overlayUrl} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3 text-xs">
        <Legend color="#ef4444" label="Necrotic Core" />
        <Legend color="#22c55e" label="Peritumoral Edema" />
        <Legend color="#3b82f6" label="Enhancing Tumor" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Voxel counts per class</h2>
          <div
            className="prose prose-invert max-w-none text-sm [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left"
            dangerouslySetInnerHTML={{ __html: result.voxelCountsHtml }}
          />
        </section>
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Summary</h2>
          {result.statusText ? (
            <pre className="mb-3 whitespace-pre-wrap rounded bg-muted p-2 text-lg text-muted-foreground">
              {result.statusText}
            </pre>
          ) : null}
        </section>
      </div>

      {result.confidenceHtml ? (
        <section className="mt-4 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            Prediction Confidence
          </h2>
          {/*
              This HTML is generated by format_confidence_html() in the Space's
              utils.py and returned verbatim as output[10] from /predict. It
              already contains the Overall/Tumour-region badges and the
              per-class confidence bars with their own inline colours, so we
              render it as-is to stay pixel-identical to the Hugging Face UI.
            */}
          <div
            className="confidence-block"
            dangerouslySetInnerHTML={{ __html: result.confidenceHtml }}
          />
        </section>
      ) : null}

      <p className="mt-6 text-xs text-muted-foreground">
        Model:{" "}
        <a
          className="underline hover:text-foreground"
          href="https://huggingface.co/spaces/adityaAnand0/brain-tumor-demo"
          target="_blank"
          rel="noreferrer"
        >
          adityaAnand0/brain-tumor-demo
        </a>{" "}
        — MONAI 3D U-Net trained on BraTS 2021 (Dice ≈ 0.73).
      </p>
    </div>
  );
}
function ImageCard({ title, url }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-card">
      <figcaption className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </figcaption>
      <img
        src={url}
        alt={title}
        className="block h-auto w-full bg-black object-contain"
        loading="lazy"
      />
    </figure>
  );
}
function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
