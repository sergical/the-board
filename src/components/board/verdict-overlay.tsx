"use client";

import { BOARD_MEMBERS } from "@/lib/board-state";
import type { Verdict } from "@/lib/board-state";
import { cn } from "@/lib/utils";

interface VerdictOverlayProps {
  verdict: Verdict;
  onPitchAgain: () => void;
}

const verdictLabels: Record<string, string> = {
  unanimous_yes: "UNANIMOUS YES",
  unanimous_no: "UNANIMOUS NO",
  split: "SPLIT DECISION",
  hung: "HUNG JURY",
};

const verdictColors: Record<string, string> = {
  unanimous_yes: "text-emerald-400",
  unanimous_no: "text-red-400",
  split: "text-yellow-400",
  hung: "text-orange-400",
};

export function VerdictOverlay({ verdict, onPitchAgain }: VerdictOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-olive-900 p-8 shadow-2xl ring-1 ring-olive-700">
        {/* Verdict Type */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium tracking-widest text-olive-400">
            THE VERDICT
          </div>
          <div
            className={cn(
              "font-display text-4xl tracking-tight sm:text-5xl",
              verdictColors[verdict.type],
            )}
          >
            {verdictLabels[verdict.type]}
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex flex-col items-center gap-1">
          <div className="font-mono text-6xl font-bold text-white">
            {verdict.overallScore}
            <span className="text-2xl text-white/40">/10</span>
          </div>
        </div>

        {/* Individual Votes */}
        <div className="flex flex-wrap justify-center gap-4">
          {BOARD_MEMBERS.map((member) => {
            const memberVote = verdict.votes[member.id];
            if (!memberVote) return null;
            return (
              <div
                key={member.id}
                className="flex flex-col items-center gap-1 rounded-xl bg-olive-800/50 px-4 py-3"
              >
                <div
                  className="flex size-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.shortName}
                </div>
                <div className="text-xs text-olive-300">
                  {member.name.split(" ")[0]}
                </div>
                <div
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    memberVote.vote === "invest" &&
                      "bg-emerald-500/20 text-emerald-400",
                    memberVote.vote === "pass" &&
                      "bg-red-500/20 text-red-400",
                    memberVote.vote === "abstain" &&
                      "bg-yellow-500/20 text-yellow-400",
                  )}
                >
                  {memberVote.vote.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <p className="max-w-lg text-center text-sm text-olive-300">
          {verdict.summary}
        </p>

        {/* Actions */}
        <button
          onClick={onPitchAgain}
          className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-olive-950 transition-colors hover:bg-white/90"
        >
          Pitch Again
        </button>
      </div>
    </div>
  );
}
