export type BoardPhase = "pitch" | "research" | "deliberation" | "verdict";

export type FindingType = "positive" | "negative" | "neutral";

export type Vote = "invest" | "pass" | "abstain";

export type VerdictType =
  | "unanimous_yes"
  | "unanimous_no"
  | "split"
  | "hung";

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  shortName: string;
  image: string;
  color: string;
  orbColors: [string, string];
}

export interface Finding {
  id: string;
  agentId: string;
  type: FindingType;
  title: string;
  detail: string;
  sourceUrl?: string;
}

export interface AgentScore {
  score: number;
  reason: string;
}

export interface Verdict {
  type: VerdictType;
  overallScore: number;
  summary: string;
  votes: Record<string, { vote: Vote; reason: string }>;
}

export const BOARD_MEMBERS: BoardMember[] = [
  {
    id: "victoria",
    name: "Victoria Sterling",
    role: "Chair & Market",
    shortName: "VS",
    image: "/img/victoria.jpg",
    color: "#6366f1",
    orbColors: ["#4338ca", "#818cf8"],
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    role: "CTO",
    shortName: "MC",
    image: "/img/marcus.jpg",
    color: "#10b981",
    orbColors: ["#047857", "#6ee7b7"],
  },
  {
    id: "priya",
    name: "Priya Kapoor",
    role: "Customer",
    shortName: "PK",
    image: "/img/priya.jpg",
    color: "#f59e0b",
    orbColors: ["#b45309", "#fcd34d"],
  },
  {
    id: "dmitri",
    name: "Dmitri Volkov",
    role: "Contrarian",
    shortName: "DV",
    image: "/img/dmitri.jpg",
    color: "#ef4444",
    orbColors: ["#b91c1c", "#fca5a5"],
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    role: "Finance",
    shortName: "SR",
    image: "/img/sofia.jpg",
    color: "#a855f7", // purple
    orbColors: ["#7e22ce", "#d8b4fe"],
  },
];

export interface BoardState {
  phase: BoardPhase;
  activeSpeaker: string | null;
  findings: Finding[];
  scores: Record<string, AgentScore>;
  verdict: Verdict | null;
  transcript: { agentId: string; text: string }[];
}

export const initialBoardState: BoardState = {
  phase: "pitch",
  activeSpeaker: null,
  findings: [],
  scores: {},
  verdict: null,
  transcript: [],
};
