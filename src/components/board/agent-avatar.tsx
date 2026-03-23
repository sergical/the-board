import { cn } from "@/lib/utils";
import type { BoardMember, AgentScore } from "@/lib/board-state";

interface AgentAvatarProps {
  member: BoardMember;
  isActive: boolean;
  score?: AgentScore;
  vote?: "invest" | "pass" | "abstain";
}

export function AgentAvatar({ member, isActive, score, vote }: AgentAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative size-14 overflow-hidden rounded-full transition-all duration-500",
          isActive && "scale-110 ring-2 ring-offset-2 ring-offset-olive-900",
        )}
        style={{
          ...(isActive ? { "--tw-ring-color": member.color } as React.CSSProperties : {}),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.image}
          alt={member.name}
          className="size-full object-cover"
        />
        {isActive && (
          <span className="absolute -bottom-1 -right-1 flex size-3">
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: member.color }}
            />
            <span
              className="relative inline-flex size-3 rounded-full"
              style={{ backgroundColor: member.color }}
            />
          </span>
        )}
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-olive-100">{member.name.split(" ")[0]}</div>
        <div className="text-[10px] text-olive-400">{member.role}</div>
      </div>
      {score && (
        <div className="rounded-full bg-olive-800 px-2 py-0.5 text-xs font-mono text-white/80">
          {score.score}/10
        </div>
      )}
      {vote && (
        <div
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            vote === "invest" && "bg-emerald-500/20 text-emerald-400",
            vote === "pass" && "bg-red-500/20 text-red-400",
            vote === "abstain" && "bg-yellow-500/20 text-yellow-400",
          )}
        >
          {vote.toUpperCase()}
        </div>
      )}
    </div>
  );
}
