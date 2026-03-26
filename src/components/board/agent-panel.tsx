import { BOARD_MEMBERS } from "@/lib/board-state";
import type { AgentScore } from "@/lib/board-state";
import { AgentAvatar } from "./agent-avatar";

interface AgentPanelProps {
  activeSpeaker: string | null;
  scores: Record<string, AgentScore>;
  votes: Record<string, { vote: "invest" | "pass" | "abstain"; reason: string }>;
}

export function AgentPanel({ activeSpeaker, scores, votes }: AgentPanelProps) {
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-8">
      {BOARD_MEMBERS.map((member) => (
        <AgentAvatar
          key={member.id}
          member={member}
          isActive={activeSpeaker === member.id}
          score={scores[member.id]}
          vote={votes[member.id]?.vote}
        />
      ))}
    </div>
  );
}
