"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import type { DisconnectionDetails } from "@elevenlabs/react";
import { AudioBars } from "./audio-bars";
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

function cleanText(text: string): string {
  return text
    .replace(/<\/?(Marcus|Priya|Dmitri|Sofia)>/gi, "")
    .replace(/\[(?:thoughtful|sigh|excited|whisper|laugh|pause)\]\s*/gi, "")
    .trim();
}

function detectSpeaker(text: string, fallback: string): string {
  const match = text.match(/<(Marcus|Priya|Dmitri|Sofia)>/i);
  return match ? match[1].toLowerCase() : fallback;
}

/** Strip self-referential phrases when Victoria is the speaker */
function filterSelfReferences(text: string, speaker: string): string {
  if (speaker !== "victoria") return text;
  return text
    .replace(/\b(?:thank(?:s| you),?\s*victoria)\b/gi, "")
    .replace(/\b(?:well said,?\s*victoria)\b/gi, "")
    .trim();
}

export function BoardRoom({ pitch, onEnd }: BoardRoomProps) {
  const [state, setState] = useState<BoardState>({
    ...initialBoardState,
    transcript: [{ agentId: "user", text: pitch }],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [researchingTool, setResearchingTool] = useState<string | null>(null);

  // Use a ref to track activeSpeaker so callbacks always have current value
  const activeSpeakerRef = useRef<string>("victoria");
  // Track the conversation instance for delayed sendContextualUpdate
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      console.log(`[EL] onConnect — conversationId: ${conversationId}`);
      setIsConnected(true);
      setIsConnecting(false);
    },
    onDisconnect: (details: DisconnectionDetails) => {
      console.log(`[EL] onDisconnect — reason: ${details.reason}`, details);
      setIsConnected(false);

      if (details.reason === "error") {
        setState((prev) => ({
          ...prev,
          transcript: [
            ...prev.transcript,
            {
              agentId: "system",
              text: `Session interrupted: ${details.message ?? "connection error"}. You may need to restart.`,
            },
          ],
        }));
      }
    },
    onMessage: (message) => {
      console.log(`[EL] onMessage — source: ${message.source}, event_id: ${message.event_id}, text: "${message.message.slice(0, 100)}..."`);

      const clean = cleanText(message.message);
      if (!clean || clean === "..." || clean.length < 3) {
        console.log(`[EL] onMessage — FILTERED (too short or noise): "${clean}"`);
        return;
      }

      if (message.source === "user") {
        // Skip mic noise / short utterances — user already has their pitch in transcript
        if (clean.length < 10) {
          console.log(`[EL] onMessage — FILTERED user message (< 10 chars): "${clean}"`);
          return;
        }
        setState((prev) => ({
          ...prev,
          transcript: [...prev.transcript, { agentId: "user", text: clean }],
        }));
      } else {
        const speaker = detectSpeaker(message.message, activeSpeakerRef.current);
        const filtered = filterSelfReferences(clean, speaker);
        if (!filtered || filtered.length < 3) {
          console.log(`[EL] onMessage — FILTERED after self-ref removal: "${filtered}"`);
          return;
        }
        setState((prev) => ({
          ...prev,
          transcript: [...prev.transcript, { agentId: speaker, text: filtered }],
        }));
      }
    },
    onError: (error, context) => {
      console.error("[EL] onError —", error, context);
      setIsConnecting(false);
    },
    onStatusChange: ({ status }) => {
      console.log(`[EL] onStatusChange — ${status}`);
    },
    onModeChange: ({ mode }) => {
      console.log(`[EL] onModeChange — ${mode}`);
    },
    onInterruption: (props) => {
      console.log(`[EL] onInterruption — event_id: ${props.event_id}`);
    },
    onConversationMetadata: (props) => {
      console.log(`[EL] onConversationMetadata —`, JSON.stringify(props).slice(0, 500));
    },
    onAgentToolRequest: (props) => {
      console.log(`[EL] onAgentToolRequest — tool: ${props.tool_name}, call_id: ${props.tool_call_id}, type: ${props.tool_type}`);
      setResearchingTool(props.tool_name);
    },
    onAgentToolResponse: (props) => {
      console.log(`[EL] onAgentToolResponse — tool: ${props.tool_name}, error: ${props.is_error}, called: ${props.is_called}`);
      setResearchingTool(null);
    },
    onDebug: (props) => {
      console.log(`[EL] onDebug —`, props);
    },
  });

  // Keep conversationRef in sync
  conversationRef.current = conversation;

  // Delayed contextual update — send Victoria guidance 10s after connection
  // to avoid interfering with agent initialization
  useEffect(() => {
    if (!isConnected) return;
    const timer = setTimeout(() => {
      console.log("[EL] Sending delayed contextual update (Victoria self-reference guidance)");
      conversationRef.current?.sendContextualUpdate(
        "IMPORTANT RULE: Victoria Sterling must never address herself by name or thank herself. " +
        "When transitioning from Victoria's own analysis to another speaker, say 'Let me now turn to [Name]' " +
        "or 'I'd like to hear from [Name]' — never 'Thank you, Victoria'."
      );
    }, 10000);
    return () => clearTimeout(timer);
  }, [isConnected]);

  // Client tools — use setState updater functions (no stale closures)
  const clientTools = {
    set_phase: useCallback(async (params: { phase: string }) => {
      console.log(`[EL] clientTool:set_phase — ${params.phase}`);
      setState((prev) => ({ ...prev, phase: params.phase as BoardState["phase"] }));
      return `Phase set to ${params.phase}`;
    }, []),
    set_active_speaker: useCallback(async (params: { agent_id: string }) => {
      console.log(`[EL] clientTool:set_active_speaker — ${params.agent_id}`);
      activeSpeakerRef.current = params.agent_id;
      setState((prev) => ({ ...prev, activeSpeaker: params.agent_id }));
      return `Active speaker: ${params.agent_id}`;
    }, []),
    add_finding: useCallback(async (params: { agent_id: string; type: string; title: string; detail: string; source_url?: string }) => {
      console.log(`[EL] clientTool:add_finding — ${params.agent_id}: ${params.title}`);
      const finding: Finding = {
        id: crypto.randomUUID(),
        agentId: params.agent_id,
        type: params.type as Finding["type"],
        title: params.title,
        detail: params.detail,
        sourceUrl: params.source_url,
      };
      setState((prev) => ({ ...prev, findings: [...prev.findings, finding] }));
      return `Finding added: ${params.title}`;
    }, []),
    update_score: useCallback(async (params: { agent_id: string; score: number; reason: string }) => {
      console.log(`[EL] clientTool:update_score — ${params.agent_id}: ${params.score}/10`);
      setState((prev) => ({
        ...prev,
        scores: { ...prev.scores, [params.agent_id]: { score: params.score, reason: params.reason } },
      }));
      return `Score updated: ${params.agent_id} = ${params.score}/10`;
    }, []),
    cast_vote: useCallback(async (params: { agent_id: string; vote: string; reason: string }) => {
      console.log(`[EL] clientTool:cast_vote — ${params.agent_id}: ${params.vote}`);
      setState((prev) => ({
        ...prev,
        verdict: {
          ...(prev.verdict ?? { type: "split" as const, overallScore: 0, summary: "", votes: {} }),
          votes: {
            ...(prev.verdict?.votes ?? {}),
            [params.agent_id]: { vote: params.vote as "invest" | "pass" | "abstain", reason: params.reason },
          },
        },
      }));
      return `Vote cast: ${params.agent_id} = ${params.vote}`;
    }, []),
    render_verdict: useCallback(async (params: { verdict_type: string; overall_score: number; summary: string }) => {
      console.log(`[EL] clientTool:render_verdict — ${params.verdict_type}, score: ${params.overall_score}`);
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
    }, []),
  };

  // Auto-start session on mount
  useEffect(() => {
    let cancelled = false;

    async function connect() {
      setIsConnecting(true);
      try {
        // If pitch contains a URL, scrape it first for structured data
        let enrichedPitch = pitch;
        const urlMatch = pitch.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          try {
            const scrapeRes = await fetch("/api/scrape-startup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: urlMatch[0] }),
            });
            const { summary } = await scrapeRes.json();
            if (summary) {
              enrichedPitch = `${pitch}\n\n--- Scraped from ${urlMatch[0]} ---\n${summary}`;
            }
          } catch {
            // Scrape failed, continue with original pitch
          }
        }
        if (cancelled) return;

        const res = await fetch("/api/conversation-token");
        const { signedUrl } = await res.json();
        if (cancelled) return;

        console.log("[EL] Starting session with dynamicVariables:", { startup_pitch: enrichedPitch.slice(0, 100) + "..." });
        await conversation.startSession({
          signedUrl,
          dynamicVariables: { startup_pitch: enrichedPitch },
          clientTools,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("[EL] Failed to start session:", err);
          setIsConnecting(false);
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      conversation.endSession().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endSession = useCallback(async () => {
    await conversation.endSession();
    onEnd();
  }, [conversation, onEnd]);

  // Map tool names to friendly labels
  const toolLabels: Record<string, string> = {
    market_research: "market data",
    tech_research: "technical landscape",
    customer_research: "customer feedback",
    competitor_research: "competitor landscape",
    finance_research: "financial data",
  };

  return (
    <div className="dark flex h-screen flex-col bg-olive-900 text-olive-50">
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
        {/* Agent panel + status */}
        <div className="flex items-center justify-between border-b border-olive-800 px-4 py-4">
          <AgentPanel
            activeSpeaker={state.activeSpeaker}
            scores={state.scores}
            votes={state.verdict?.votes ?? {}}
          />
          <div className="flex flex-col items-center gap-1">
            {isConnecting && (
              <span className="text-xs text-olive-500">Connecting...</span>
            )}
            {isConnected && (
              <>
                <AudioBars
                  getVolume={conversation.getOutputVolume}
                  getFrequencyData={conversation.getOutputByteFrequencyData}
                  isActive={conversation.isSpeaking}
                  barCount={7}
                  className="h-10"
                />
                <div className="flex items-center gap-1.5">
                  <div className={`size-1.5 rounded-full ${conversation.isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-olive-500"}`} />
                  <span className="text-[10px] text-olive-400">
                    {researchingTool
                      ? `Researching ${toolLabels[researchingTool] ?? researchingTool}...`
                      : conversation.isSpeaking
                        ? "Speaking"
                        : "Listening"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transcript + Findings */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col border-r border-olive-800">
            <div className="border-b border-olive-800 px-4 py-2 text-xs font-medium tracking-wider text-olive-500">
              TRANSCRIPT
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel entries={state.transcript} />
            </div>
          </div>

          {/* Findings */}
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
        <VerdictOverlay verdict={state.verdict} scores={state.scores} onPitchAgain={onEnd} />
      )}
    </div>
  );
}
