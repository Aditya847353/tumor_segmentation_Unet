import { Link, useRouterState } from "@tanstack/react-router";
const STEPS = [
  { path: "/upload", label: "Upload" },
  { path: "/processing", label: "Process" },
  { path: "/results", label: "Results" },
];
export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stepIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));
  const currentStep = stepIndex === -1 ? 0 : stepIndex + 1;
  const showSteps = stepIndex !== -1;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <img src="./brain-svgrepo-com.svg" alt="Brain" className="h-6 w-6" />
          <span className="text-base font-semibold tracking-tight">Brain Tumor Segmentation</span>
        </Link>
        {showSteps && (
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs font-medium text-muted-foreground">Step {currentStep}/3</span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <span
                  key={s.path}
                  className={
                    "h-1.5 w-10 rounded-full transition-colors " +
                    (i < currentStep ? "bg-primary" : "bg-border")
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
