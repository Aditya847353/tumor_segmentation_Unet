import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brain, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAnalysis } from "@/lib/analysis-store";
import { runHfInference } from "@/lib/hf-inference.functions";
export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing — Brain Tumor Segmentation" },
      {
        name: "description",
        content: "Running the 3D U-Net segmentation pipeline on your MRI study.",
      },
    ],
  }),
  component: ProcessingPage,
});
const STAGES = [
  "Uploading MRI volumes to the model…",
  "Preprocessing & normalizing volumes…",
  "Running 3D U-Net inference on GPU…",
  "Post-processing segmentation mask…",
  "Rendering visualizations…",
];
function ProcessingPage() {
  const navigate = useNavigate();
  const { files, setResult } = useAnalysis();
  const runInference = runHfInference;
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsedS, setElapsedS] = useState(0);
  const startedRef = useRef(false);
  // Guard: if user lands here directly without files, send them to upload
  useEffect(() => {
    if (files.length < 4) {
      navigate({ to: "/upload" });
    }
  }, [files.length, navigate]);
  useEffect(() => {
    if (startedRef.current || files.length < 4) return;
    startedRef.current = true;
    const startedAt = performance.now();
    const timer = setInterval(() => {
      setElapsedS(Math.floor((performance.now() - startedAt) / 1000));
      setStageIdx((i) => Math.min(STAGES.length - 1, i + (Math.random() < 0.25 ? 1 : 0)));
    }, 1500);
    const fd = new FormData();
    for (const u of files) fd.append(u.channel, u.file, u.file.name);
    runInference(fd)
      .then((result) => {
        clearInterval(timer);
        setResult({ ...result, timestamp: new Date().toISOString() });
        navigate({ to: "/results" });
      })
      .catch((err) => {
        clearInterval(timer);
        const msg = err instanceof Error ? err.message : "Inference failed";
        toast.error("Inference failed", { description: msg });
        navigate({ to: "/upload" });
      });
    return () => clearInterval(timer);
  }, [files, navigate, runInference, setResult]);
  const stage = STAGES[stageIdx];
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">Step 2 of 3</p>
      <h1 className="mt-1 text-2xl font-semibold text-foreground">Running segmentation</h1>

      <div className="relative my-10">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative inline-flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
          <Brain className="h-12 w-12 text-primary" />
        </div>
      </div>

      <p className="flex items-center gap-2 text-sm text-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {stage}
      </p>

      <div className="mt-6 w-full">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{elapsedS}s elapsed</span>
          <span>First run can take ~60s (cold start)</span>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Calling the Hugging Face Space{" "}
        <code className="rounded bg-card px-1 py-0.5 text-foreground">
          adityaAnand0/brain-tumor-demo
        </code>{" "}
        — a MONAI 3D U-Net trained on BraTS 2021.
      </p>
    </div>
  );
}
