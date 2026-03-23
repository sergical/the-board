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
          return (
            <div key={i} className="flex gap-2 text-sm">
              <span
                className="shrink-0 font-semibold"
                style={{ color: isUser ? "#94a3b8" : member?.color ?? "#fff" }}
              >
                {isUser ? "You" : member?.name.split(" ")[0] ?? entry.agentId}:
              </span>
              <span className="text-olive-200">{entry.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
