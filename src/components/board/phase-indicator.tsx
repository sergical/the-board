import { cn } from "@/lib/utils";
import type { BoardPhase } from "@/lib/board-state";

const phases: { key: BoardPhase; label: string }[] = [
  { key: "pitch", label: "Pitch" },
  { key: "research", label: "Research" },
  { key: "deliberation", label: "Deliberation" },
  { key: "verdict", label: "Verdict" },
];

interface PhaseIndicatorProps {
  currentPhase: BoardPhase;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <>
      {/* Mobile: step counter + active label */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="font-mono text-[10px] text-white/40">
          {currentIndex + 1}/{phases.length}
        </span>
        <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
          {phases[currentIndex]?.label}
        </div>
      </div>

      {/* Desktop: full horizontal stepper */}
      <div className="hidden items-center gap-2 sm:flex">
        {phases.map((phase, i) => (
          <div key={phase.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-8",
                  i <= currentIndex ? "bg-white/40" : "bg-white/10",
                )}
              />
            )}
            <div
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                phase.key === currentPhase
                  ? "bg-white/20 text-white"
                  : i < currentIndex
                    ? "text-white/50"
                    : "text-white/20",
              )}
            >
              {phase.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
