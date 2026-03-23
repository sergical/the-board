"use client";

import { useState, useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Orb } from "@/components/ui/orb";
import { AgentPanel } from "./agent-panel";
import { TranscriptPanel } from "./transcript-panel";
import { FindingsPanel } from "./findings-panel";
import { PhaseIndicator } from "./phase-indicator";
import { VerdictOverlay } from "./verdict-overlay";
import {
  BOARD_MEMBERS,
  initialBoardState,
  type BoardState,
  type Finding,
  type Verdict,
} from "@/lib/board-state";

interface BoardRoomProps {
  pitch: string;
  onEnd: () => void;
}

export function BoardRoom({ pitch, onEnd }: BoardRoomProps) {
  const [state, setState] = useState<BoardState>(initialBoardState);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const orbColorsRef = useRef<[string, string]>(["#4338ca", "#818cf8"]);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      setIsConnecting(false);
    },
    onDisconnect: () => {
      setIsConnected(false);
    },
    onMessage: (message) => {
      const source = message.source === "user" ? "user" : detectSpeaker(message.message);
      setState((prev) => ({
        ...prev,
        transcript: [
          ...prev.transcript,
          { agentId: source, text: message.message },
        ],
      }));
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      setIsConnecting(false);
    },
  });

  // Detect which board member is speaking based on message content
  function detectSpeaker(text: string): string {
    // The agent system prompt will prefix messages or use client tools
    // For fallback detection, check for name mentions
    for (const member of BOARD_MEMBERS) {
      const firstName = member.name.split(" ")[0];
      if (text.startsWith(`${firstName}:`)) return member.id;
    }
    return state.activeSpeaker ?? "victoria";
  }

  // Client tools that ElevenAgents will call to update the UI
  const clientTools = {
    set_phase: useCallback(async (params: { phase: string }) => {
      const phase = params.phase as BoardState["phase"];
      setState((prev) => ({ ...prev, phase }));
      return `Phase set to ${phase}`;
    }, []),

    set_active_speaker: useCallback(async (params: { agent_id: string }) => {
      const member = BOARD_MEMBERS.find((m) => m.id === params.agent_id);
      if (member) {
        orbColorsRef.current = member.orbColors;
        setState((prev) => ({ ...prev, activeSpeaker: params.agent_id }));
      }
      return `Active speaker: ${params.agent_id}`;
    }, []),

    add_finding: useCallback(
      async (params: {
        agent_id: string;
        type: string;
        title: string;
        detail: string;
        source_url?: string;
      }) => {
        const finding: Finding = {
          id: crypto.randomUUID(),
          agentId: params.agent_id,
          type: params.type as Finding["type"],
          title: params.title,
          detail: params.detail,
          sourceUrl: params.source_url,
        };
        setState((prev) => ({
          ...prev,
          findings: [...prev.findings, finding],
        }));
        return `Finding added: ${params.title}`;
      },
      [],
    ),

    update_score: useCallback(
      async (params: { agent_id: string; score: number; reason: string }) => {
        setState((prev) => ({
          ...prev,
          scores: {
            ...prev.scores,
            [params.agent_id]: { score: params.score, reason: params.reason },
          },
        }));
        return `Score updated: ${params.agent_id} = ${params.score}/10`;
      },
      [],
    ),

    cast_vote: useCallback(
      async (params: {
        agent_id: string;
        vote: string;
        reason: string;
      }) => {
        setState((prev) => ({
          ...prev,
          verdict: {
            ...(prev.verdict ?? {
              type: "split" as const,
              overallScore: 0,
              summary: "",
              votes: {},
            }),
            votes: {
              ...(prev.verdict?.votes ?? {}),
              [params.agent_id]: {
                vote: params.vote as "invest" | "pass" | "abstain",
                reason: params.reason,
              },
            },
          },
        }));
        return `Vote cast: ${params.agent_id} = ${params.vote}`;
      },
      [],
    ),

    render_verdict: useCallback(
      async (params: {
        verdict_type: string;
        overall_score: number;
        summary: string;
      }) => {
        setState((prev) => ({
          ...prev,
          phase: "verdict",
          verdict: {
            type: params.verdict_type as Verdict["type"],
            overallScore: params.overall_score,
            summary: params.summary,
            votes: prev.verdict?.votes ?? {},
          },
        }));
        return `Verdict rendered: ${params.verdict_type}`;
      },
      [],
    ),
  };

  const startSession = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    if (!agentId) {
      console.error("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID");
      return;
    }
    setIsConnecting(true);
    try {
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
        dynamicVariables: {
          startup_pitch: pitch,
        },
        clientTools,
      });
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsConnecting(false);
    }
  }, [conversation, pitch, clientTools]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
    onEnd();
  }, [conversation, onEnd]);

  const agentState = isConnected
    ? (conversation.status === "connected" ? "listening" : "thinking")
    : isConnecting
      ? "thinking"
      : null;

  return (
    <div className="flex h-screen flex-col bg-olive-900 text-olive-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-olive-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="The Board" className="size-6 invert" />
          <div className="font-display text-lg">The Board</div>
        </div>
        <PhaseIndicator currentPhase={state.phase} />
        <button
          onClick={endSession}
          className="rounded-full bg-olive-800 px-3 py-1 text-xs font-medium text-olive-300 hover:bg-olive-700"
        >
          End Session
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Agent panel */}
        <div className="border-b border-olive-800 px-4 py-4">
          <AgentPanel
            activeSpeaker={state.activeSpeaker}
            scores={state.scores}
            votes={state.verdict?.votes ?? {}}
          />
        </div>

        {/* Orb + Controls */}
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <div className="relative h-48 w-48 sm:h-56 sm:w-56">
            <Orb
              colorsRef={orbColorsRef}
              agentState={agentState}
              volumeMode="auto"
            />
          </div>
          {!isConnected && !isConnecting && (
            <button
              onClick={startSession}
              className="rounded-full bg-olive-100 px-6 py-2 text-sm font-semibold text-olive-950 transition-colors hover:bg-olive-50"
            >
              Start Board Meeting
            </button>
          )}
          {isConnecting && (
            <div className="text-sm text-olive-400">Connecting...</div>
          )}
          {isConnected && (
            <div className="flex items-center gap-2">
              <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-olive-400">Board is in session</span>
            </div>
          )}
        </div>

        {/* Transcript + Findings */}
        <div className="flex flex-1 overflow-hidden border-t border-olive-800">
          <div className="flex flex-1 flex-col border-r border-olive-800">
            <div className="border-b border-olive-800 px-4 py-2 text-xs font-medium tracking-wider text-olive-500">
              TRANSCRIPT
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel entries={state.transcript} />
            </div>
          </div>
          <div className="flex w-80 flex-col max-sm:hidden">
            <div className="border-b border-olive-800 px-4 py-2 text-xs font-medium tracking-wider text-olive-500">
              FINDINGS
            </div>
            <div className="flex-1 overflow-hidden">
              <FindingsPanel findings={state.findings} />
            </div>
          </div>
        </div>
      </div>

      {/* Verdict Overlay */}
      {state.phase === "verdict" && state.verdict && (
        <VerdictOverlay verdict={state.verdict} onPitchAgain={onEnd} />
      )}
    </div>
  );
}
