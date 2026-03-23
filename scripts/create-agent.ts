/**
 * Creates the ElevenLabs conversational AI agent for "The Board".
 *
 * Usage:
 *   npx tsx scripts/create-agent.ts
 *
 * Reads ELEVENLABS_API_KEY from .env.local
 * Outputs the agent ID to set as NEXT_PUBLIC_ELEVENLABS_AGENT_ID
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const API_KEY = env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY in .env.local");
  process.exit(1);
}

// Base URL for server tools — use env or default to localhost
const BASE_URL = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const SYSTEM_PROMPT = `You are the chairperson of "The Board" — a panel of 5 AI investors evaluating a startup pitch. You orchestrate a board meeting by role-playing 5 distinct board members, each with their own personality, research focus, and voice.

## The Board Members

1. **Victoria Sterling** (Chair & Market Strategist) — Authoritative, measured. Researches market size and trends. Opens and closes the meeting. Uses [thoughtful] pauses.
2. **Marcus Chen** (CTO) — Fast-talking, precise, direct. Evaluates technical feasibility and existing solutions. Uses [sigh] at vague tech claims, [whisper] when something is "actually clever."
3. **Priya Kapoor** (Customer Advocate) — Warm, empathetic, probing. Finds real user pain points from forums and reviews. Uses [excited] when finding genuine user need.
4. **Dmitri Volkov** (Devil's Advocate) — Deep voice, skeptical, contrarian. Searches for failed competitors and bear cases. Uses [laugh] dismissively, [sigh] "we've seen this before."
5. **Sofia Reyes** (Finance & Unit Economics) — Sharp, numbers-driven, fast. Researches pricing models and revenue comparables. Uses [whisper] when numbers don't add up.

## Meeting Flow

The user's startup pitch is provided in the dynamic variable {{startup_pitch}}.

### Phase 1: Introduction
- Call set_phase with phase "research"
- Victoria opens: briefly acknowledge the pitch, then introduce each board member
- Call set_active_speaker with agent_id "victoria" before Victoria speaks

### Phase 2: Research (each member investigates)
For EACH board member in order (victoria, marcus, priya, dmitri, sofia):
1. Call set_active_speaker with their agent_id
2. Announce the transition: "Let me ask [Name] to weigh in on [their area]..."
3. Call their research tool (research_market, research_tech, research_customer, research_competitor, research_finance)
4. While waiting, use pre-tool speech in character: "[thoughtful] Let me look into this market..."
5. After getting results, speak the findings IN CHARACTER with audio tags
6. Call add_finding for each key finding (positive, negative, or neutral)
7. Call update_score with their score (1-10) and reason

### Phase 3: Deliberation
- Call set_phase with phase "deliberation"
- Have 2-3 board members respond to each other's findings
- Create genuine disagreement: the CTO might challenge the Contrarian, the Customer Advocate might push back on Finance
- Use audio tags for emotion: [excited], [sigh], [whisper], [laugh]
- Keep each response to 2-3 sentences max

### Phase 4: Verdict
- Call set_phase with phase "verdict"
- Victoria calls for a vote
- For EACH member, call cast_vote with their vote (invest/pass/abstain) and reason
- After all votes, call render_verdict with:
  - verdict_type: "unanimous_yes", "unanimous_no", "split", or "hung"
  - overall_score: weighted average of all scores
  - summary: 2-3 sentence summary of the board's decision

## Rules
- NEVER be sycophantic. If the idea has problems, say so directly.
- Use audio tags naturally: [sigh], [excited], [whisper], [laugh], [thoughtful]
- Keep the total meeting under 4 minutes
- Each board member speaks for 20-30 seconds max
- Call client tools (set_active_speaker, add_finding, update_score, etc.) BEFORE speaking as that character
- Base all opinions on REAL data from the research tools — cite specifics
- The verdict must reflect the actual research findings, not generic feedback`;

const agentConfig = {
  name: "The Board — AI Board of Directors",
  tags: ["elevenhacks", "firecrawl", "hackathon"],
  conversation_config: {
    agent: {
      first_message:
        "Welcome to The Board. I'm Victoria Sterling, your chairperson. I have four fellow board members here with me today — Marcus our CTO, Priya our customer advocate, Dmitri our resident skeptic, and Sofia on finance. We've received your pitch. Let's get started.",
      language: "en",
      dynamic_variables: {
        dynamic_variable_placeholders: {
          startup_pitch: "A startup idea will be provided here.",
        },
      },
      prompt: {
        prompt: SYSTEM_PROMPT,
        llm: "gemini-2.5-flash",
        temperature: 0.8,
        max_tokens: 0,
        tools: [
          // --- Server Tools (Firecrawl research) ---
          {
            type: "webhook",
            name: "research_market",
            description:
              "Research market size, TAM, growth rate, and trends for the startup idea. Call this when Victoria is evaluating the market opportunity.",
            response_timeout_secs: 30,
            force_pre_tool_speech: true,
            execution_mode: "immediate",
            api_schema: {
              url: `${BASE_URL}/api/tools/market`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  idea: {
                    type: "string",
                    description: "The startup idea to research",
                  },
                },
                required: ["idea"],
              },
              content_type: "application/json",
            },
          },
          {
            type: "webhook",
            name: "research_tech",
            description:
              "Research technical feasibility, open-source alternatives, and existing solutions on GitHub. Call this when Marcus is evaluating the technical angle.",
            response_timeout_secs: 30,
            force_pre_tool_speech: true,
            execution_mode: "immediate",
            api_schema: {
              url: `${BASE_URL}/api/tools/tech`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  idea: {
                    type: "string",
                    description: "The startup idea to research",
                  },
                },
                required: ["idea"],
              },
              content_type: "application/json",
            },
          },
          {
            type: "webhook",
            name: "research_customer",
            description:
              "Research user pain points, complaints, and needs from Reddit, forums, and reviews. Call this when Priya is evaluating customer demand.",
            response_timeout_secs: 30,
            force_pre_tool_speech: true,
            execution_mode: "immediate",
            api_schema: {
              url: `${BASE_URL}/api/tools/customer`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  idea: {
                    type: "string",
                    description: "The startup idea to research",
                  },
                },
                required: ["idea"],
              },
              content_type: "application/json",
            },
          },
          {
            type: "webhook",
            name: "research_competitor",
            description:
              "Research competitors, failed similar startups, and funded companies in this space. Call this when Dmitri is playing devil's advocate.",
            response_timeout_secs: 30,
            force_pre_tool_speech: true,
            execution_mode: "immediate",
            api_schema: {
              url: `${BASE_URL}/api/tools/competitor`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  idea: {
                    type: "string",
                    description: "The startup idea to research",
                  },
                },
                required: ["idea"],
              },
              content_type: "application/json",
            },
          },
          {
            type: "webhook",
            name: "research_finance",
            description:
              "Research pricing models, revenue comparables, and unit economics for similar businesses. Call this when Sofia is evaluating the financials.",
            response_timeout_secs: 30,
            force_pre_tool_speech: true,
            execution_mode: "immediate",
            api_schema: {
              url: `${BASE_URL}/api/tools/finance`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  idea: {
                    type: "string",
                    description: "The startup idea to research",
                  },
                },
                required: ["idea"],
              },
              content_type: "application/json",
            },
          },
          // --- Client Tools (UI updates) ---
          {
            type: "client",
            name: "set_phase",
            description:
              "Update the board meeting phase displayed in the UI. Call this at each phase transition.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["phase"],
              properties: {
                phase: {
                  type: "string",
                  description:
                    'The current phase: "research", "deliberation", or "verdict"',
                  enum: ["research", "deliberation", "verdict"],
                },
              },
            },
          },
          {
            type: "client",
            name: "set_active_speaker",
            description:
              "Highlight which board member is currently speaking and change the orb color. Call this BEFORE speaking as each character.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["agent_id"],
              properties: {
                agent_id: {
                  type: "string",
                  description:
                    'The board member ID: "victoria", "marcus", "priya", "dmitri", or "sofia"',
                  enum: ["victoria", "marcus", "priya", "dmitri", "sofia"],
                },
              },
            },
          },
          {
            type: "client",
            name: "add_finding",
            description:
              "Add a research finding to the findings panel. Call this after each key discovery from research.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["agent_id", "type", "title", "detail"],
              properties: {
                agent_id: {
                  type: "string",
                  description: "Which board member found this",
                },
                type: {
                  type: "string",
                  description: "Finding sentiment",
                  enum: ["positive", "negative", "neutral"],
                },
                title: {
                  type: "string",
                  description: "Short title (e.g. 'TAM: $47B')",
                },
                detail: {
                  type: "string",
                  description: "Brief detail about the finding",
                },
              },
            },
          },
          {
            type: "client",
            name: "update_score",
            description:
              "Set a board member's score for the pitch. Call after each member finishes their analysis.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["agent_id", "score", "reason"],
              properties: {
                agent_id: {
                  type: "string",
                  description: "The board member giving the score",
                },
                score: {
                  type: "number",
                  description: "Score from 1-10",
                },
                reason: {
                  type: "string",
                  description: "Brief reason for the score",
                },
              },
            },
          },
          {
            type: "client",
            name: "cast_vote",
            description:
              "Record a board member's vote. Call during the verdict phase for each member.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["agent_id", "vote", "reason"],
              properties: {
                agent_id: {
                  type: "string",
                  description: "The board member voting",
                },
                vote: {
                  type: "string",
                  description: "The vote",
                  enum: ["invest", "pass", "abstain"],
                },
                reason: {
                  type: "string",
                  description: "Brief reason for the vote",
                },
              },
            },
          },
          {
            type: "client",
            name: "render_verdict",
            description:
              "Display the final verdict overlay. Call after all votes are cast.",
            expects_response: false,
            parameters: {
              type: "object",
              required: ["verdict_type", "overall_score", "summary"],
              properties: {
                verdict_type: {
                  type: "string",
                  description: "Type of verdict",
                  enum: ["unanimous_yes", "unanimous_no", "split", "hung"],
                },
                overall_score: {
                  type: "number",
                  description: "Overall score from 1-10",
                },
                summary: {
                  type: "string",
                  description:
                    "2-3 sentence summary of the board's decision and key reasons",
                },
              },
            },
          },
        ],
      },
    },
    tts: {
      model_id: "eleven_v3_conversational",
      voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel — clear, professional
      expressive_mode: true,
      suggested_audio_tags: [
        { tag: "thoughtful", description: "Victoria pausing to consider" },
        { tag: "excited", description: "Genuine enthusiasm about a finding" },
        { tag: "sigh", description: "Disappointment or frustration" },
        { tag: "whisper", description: "Aside or private observation" },
        { tag: "laugh", description: "Dismissive or amused reaction" },
      ],
    },
    conversation: {
      max_duration_seconds: 600,
    },
    turn: {
      turn_timeout: 15,
      silence_end_call_timeout: 60,
    },
  },
};

async function main() {
  console.log("Creating The Board agent...");
  console.log(`Server tools pointing to: ${BASE_URL}`);

  const response = await fetch(
    "https://api.elevenlabs.io/v1/convai/agents/create",
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentConfig),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to create agent: ${response.status}`);
    console.error(error);
    process.exit(1);
  }

  const data = await response.json();
  console.log("\nAgent created successfully!");
  console.log(`Agent ID: ${data.agent_id}`);
  console.log(`\nAdd this to your .env.local:`);
  console.log(`NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${data.agent_id}`);
}

main();
