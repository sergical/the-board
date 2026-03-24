"use client";

import { useRef, useEffect } from "react";
import { BOARD_MEMBERS } from "@/lib/board-state";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptEntry {
  agentId: string;
  text: string;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

function getMemberById(id: string) {
  return BOARD_MEMBERS.find((m) => m.id === id);
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-olive-600">
        Waiting for the board to speak...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {entries.map((entry, i) => {
          const member = getMemberById(entry.agentId);
          const isUser = entry.agentId === "user";
          const isSystem = entry.agentId === "system";

          if (isSystem) {
            return (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-900/50 text-[10px] text-amber-400">
                  !
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <span className="text-xs font-semibold text-amber-400">System</span>
                  <span className="italic text-olive-400">{entry.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={i} className="flex gap-3 text-sm">
              {/* Avatar bubble */}
              {isUser ? (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-olive-700 text-[10px] font-bold text-olive-300">
                  You
                </div>
              ) : member ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image}
                  alt={member.name}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="size-8 shrink-0 rounded-full bg-olive-700" />
              )}
              {/* Message */}
              <div className="flex flex-col gap-0.5 pt-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: isUser ? "#94a3b8" : member?.color ?? "#fff" }}
                >
                  {isUser ? "You" : member?.name.split(" ")[0] ?? entry.agentId}
                </span>
                <span className="text-olive-200">{entry.text}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
