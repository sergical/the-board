"use client";

import { BOARD_MEMBERS } from "@/lib/board-state";
import type { Finding } from "@/lib/board-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FindingsPanelProps {
  findings: Finding[];
}

function getMemberById(id: string) {
  return BOARD_MEMBERS.find((m) => m.id === id);
}

export function FindingsPanel({ findings }: FindingsPanelProps) {
  if (findings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-olive-600">
        Research findings will appear here...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {findings.map((finding) => {
          const member = getMemberById(finding.agentId);
          return (
            <div
              key={finding.id}
              className="flex items-start gap-2 rounded-lg bg-olive-800/50 p-3 text-sm"
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0 text-base leading-none",
                  finding.type === "positive" && "text-emerald-400",
                  finding.type === "negative" && "text-red-400",
                  finding.type === "neutral" && "text-yellow-400",
                )}
              >
                {finding.type === "positive"
                  ? "+"
                  : finding.type === "negative"
                    ? "-"
                    : "!"}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="font-medium text-olive-100">{finding.title}</div>
                <div className="text-xs text-olive-400">{finding.detail}</div>
                {member && (
                  <div
                    className="mt-1 text-[10px] font-medium"
                    style={{ color: member.color }}
                  >
                    via {member.name.split(" ")[0]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
