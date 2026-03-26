import { BOARD_MEMBERS } from "@/lib/board-state";
import type { AgentScore } from "@/lib/board-state";
import { AgentAvatar } from "./agent-avatar";

interface AgentPanelProps {
  activeSpeaker: string | null;
  scores: Record<string, AgentScore>;
  votes: Record<string, { vote: "invest" | "pass" | "abstain"; reason: string }>;
}

export function AgentPanel({ activeSpeaker, scores, votes }: AgentPanelProps) {
  const activeMember = BOARD_MEMBERS.find((m) => m.id === activeSpeaker) ?? BOARD_MEMBERS[0];
  const inactiveMembers = BOARD_MEMBERS.filter((m) => m.id !== activeMember.id);

  return (
    <>
      {/* Mobile: prominent speaker + collapsed others */}
      <div className="flex items-center gap-3 sm:hidden">
        <AgentAvatar
          member={activeMember}
          isActive={activeSpeaker === activeMember.id}
          score={scores[activeMember.id]}
          vote={votes[activeMember.id]?.vote}
          variant="prominent"
        />
        <div className="flex -space-x-2">
          {inactiveMembers.map((member) => (
            <AgentAvatar
              key={member.id}
              member={member}
              isActive={false}
              vote={votes[member.id]?.vote}
              variant="collapsed"
            />
          ))}
        </div>
      </div>

      {/* Desktop: full row */}
      <div className="hidden items-start justify-center gap-8 sm:flex">
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
    </>
  );
}
