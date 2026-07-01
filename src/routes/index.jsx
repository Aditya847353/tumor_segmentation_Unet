import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Upload, Cpu, Activity, FileDown, ArrowRight, Brain } from "lucide-react";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brain Tumor Segmentation — AI MRI Analysis" },
      {
        name: "description",
        content:
          "Upload 4-channel MRI (FLAIR, T1, T1CE, T2) and get AI-powered tumor segmentation with 2D slices, 3D mesh, and a downloadable report.",
      },
      { property: "og:title", content: "Brain Tumor Segmentation" },
      {
        property: "og:description",
        content:
          "Upload MRI, run AI segmentation, explore tumor in 2D & 3D, export a clinical-style report.",
      },
    ],
  }),
  component: Index,
});
const FEATURES = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drop in 4-channel NIfTI MRI files. Format and size validated instantly.",
  },
  {
    icon: Cpu,
    title: "Process",
    body: "Run the 3D U-Net inference pipeline. Typical runtime ≈ 30–60 seconds.",
  },
  {
    icon: Activity,
    title: "Analyze",
    body: "Inspect tumor sub-regions, volumes, and centroid in 2D and 3D.",
  },
  {
    icon: FileDown,
    title: "Export",
    body: "Generate a structured medical-style report as PDF, DOCX, or TXT.",
  },
];
function Index() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Brain className="h-4 w-4" />
            BraTS 2021 • 3D U-Net
          </div>

          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl">
            Brain Tumor
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Segmentation
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-400">
            Analyze multi-modal MRI scans using a 3D U-Net model to generate brain tumor
            segmentation, visualize tumor regions across MRI modalities, and export detailed
            reports.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/upload"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#workflow"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-medium text-white transition hover:border-primary/30 hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Stats */}

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              value: "3D",
              label: "MRI Segmentation",
            },
            {
              value: "<60s",
              label: "Inference Time",
            },
            {
              value: "BraTS",
              label: "Benchmark Dataset",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
            >
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="mt-2 text-sm text-gray-400">{item.label}</div>
            </div>
          ))}
        </section>

        {/* Workflow */}

        <section id="workflow" className="mt-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">AI Processing Pipeline</h2>

            <p className="mt-3 text-gray-400">
              Simple workflow from MRI upload to downloadable report.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:bg-white/10"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                  <f.icon className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-semibold text-white">{f.title}</h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}

        <section className="mt-24 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8">
          <h3 className="text-lg font-semibold text-amber-300">Research Disclaimer</h3>

          <p className="mt-3 leading-7 text-gray-400">
            This application is intended solely for research and educational purposes. The generated
            segmentation results are not clinically validated and should never be used as a
            substitute for professional medical diagnosis or treatment. Always consult a qualified
            radiologist.
          </p>
        </section>
      </div>
    </div>
  );
}
