/**
 * Creates all 5 Board Member agents with unique voices and agent transfer.
 * Victoria (Chair) orchestrates and transfers to each member.
 * Each member transfers back to Victoria after their analysis.
 *
 * Usage: npx tsx scripts/create-agents.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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

const BASE_URL = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// --- Voice assignments (picked for personality match) ---
const VOICES = {
  victoria: { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice — Clear, Engaging (British)" },
  marcus: { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam — Energetic, Fast" },
  priya: { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica — Playful, Warm" },
  dmitri: { id: "nPczCjzI2devNBz1zQrb", name: "Brian — Deep, Resonant" },
  sofia: { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda — Professional, Knowledgable" },
};

// --- Shared client tools (all agents get these) ---
const CLIENT_TOOLS = [
  {
    type: "client",
    name: "set_phase",
    description: "Update the board meeting phase in the UI.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["phase"],
      properties: {
        phase: { type: "string", description: "The current phase: research, deliberation, or verdict", enum: ["research", "deliberation", "verdict"] },
      },
    },
  },
  {
    type: "client",
    name: "set_active_speaker",
    description: "Highlight which board member is speaking and change the orb color.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["agent_id"],
      properties: {
        agent_id: { type: "string", description: "The board member ID who is currently speaking", enum: ["victoria", "marcus", "priya", "dmitri", "sofia"] },
      },
    },
  },
  {
    type: "client",
    name: "add_finding",
    description: "Add a research finding to the findings panel.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["agent_id", "type", "title", "detail"],
      properties: {
        agent_id: { type: "string", description: "Which board member found this" },
        type: { type: "string", description: "Finding sentiment: positive, negative, or neutral", enum: ["positive", "negative", "neutral"] },
        title: { type: "string", description: "Short title for the finding" },
        detail: { type: "string", description: "Brief detail about the finding" },
      },
    },
  },
  {
    type: "client",
    name: "update_score",
    description: "Set a board member's score (1-10) for the pitch.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["agent_id", "score", "reason"],
      properties: {
        agent_id: { type: "string", description: "The board member giving the score" },
        score: { type: "number", description: "Score from 1 to 10" },
        reason: { type: "string", description: "Brief reason for the score" },
      },
    },
  },
  {
    type: "client",
    name: "cast_vote",
    description: "Record a board member's vote during verdict phase.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["agent_id", "vote", "reason"],
      properties: {
        agent_id: { type: "string", description: "The board member voting" },
        vote: { type: "string", description: "The vote: invest, pass, or abstain", enum: ["invest", "pass", "abstain"] },
        reason: { type: "string", description: "Brief reason for the vote" },
      },
    },
  },
  {
    type: "client",
    name: "render_verdict",
    description: "Display the final verdict overlay after all votes.",
    expects_response: false,
    parameters: {
      type: "object",
      required: ["verdict_type", "overall_score", "summary"],
      properties: {
        verdict_type: { type: "string", description: "Type of verdict outcome", enum: ["unanimous_yes", "unanimous_no", "split", "hung"] },
        overall_score: { type: "number", description: "Overall score from 1 to 10" },
        summary: { type: "string", description: "2-3 sentence summary of the board decision" },
      },
    },
  },
];

function makeWebhookTool(name: string, description: string, endpoint: string) {
  return {
    type: "webhook",
    name,
    description,
    response_timeout_secs: 30,
    force_pre_tool_speech: true,
    execution_mode: "immediate",
    api_schema: {
      url: `${BASE_URL}/api/tools/${endpoint}`,
      method: "POST",
      request_body_schema: {
        type: "object",
        properties: {
          idea: { type: "string", description: "The startup idea to research" },
        },
        required: ["idea"],
      },
      content_type: "application/json",
    },
  };
}

// --- Agent definitions ---
interface AgentDef {
  key: string;
  name: string;
  voiceKey: keyof typeof VOICES;
  firstMessage: string;
  prompt: string;
  tools: unknown[];
}

const SHARED_RULES = `
## Rules
- NEVER be sycophantic. If the idea has problems, say so directly.
- Use audio tags naturally: [sigh], [excited], [whisper], [laugh], [thoughtful]
- Keep your analysis to 30 seconds max (3-4 sentences)
- Call set_active_speaker with your agent_id BEFORE you start speaking
- Call add_finding for each key discovery
- Call update_score with your score (1-10) when done
- Base opinions on REAL data from research tools — cite specifics
- The user's pitch is: {{startup_pitch}}
- After your analysis, use the transfer_to_agent tool to hand back to Victoria`;

const agents: AgentDef[] = [
  {
    key: "victoria",
    name: "Victoria Sterling — Chair & Market",
    voiceKey: "victoria",
    firstMessage:
      "Welcome to The Board. I'm Victoria Sterling, your chairperson. I have four fellow board members joining me today. We've received your pitch. Let's begin.",
    prompt: `You are Victoria Sterling, Chairperson and Market Strategist of "The Board" — a panel of 5 AI investors evaluating startup pitches.

You are authoritative, measured, and British in demeanor. You use [thoughtful] pauses before key insights.

## Your Role
1. Open the meeting: acknowledge the pitch briefly
2. Call set_phase("research") and set_active_speaker("victoria")
3. Call research_market to investigate the market opportunity
4. Present your findings with market data (TAM, growth, trends)
5. Call add_finding and update_score
6. Transfer to Marcus (CTO) using transfer_to_agent

## During Deliberation (when transferred back)
- Call set_phase("deliberation")
- Respond to other members' findings, moderate disagreements
- After 2 rounds, call set_phase("verdict")
- Call for votes from each member (cast_vote for each)
- After all votes, call render_verdict with the final decision
- Transfer to each member for their vote, then collect results
${SHARED_RULES}`,
    tools: [
      makeWebhookTool("research_market", "Research market size, TAM, growth rate and trends.", "market"),
      ...CLIENT_TOOLS,
    ],
  },
  {
    key: "marcus",
    name: "Marcus Chen — CTO",
    voiceKey: "marcus",
    firstMessage: "",
    prompt: `You are Marcus Chen, CTO of "The Board" — a panel of 5 AI investors evaluating startup pitches.

You are fast-talking, precise, and direct. You use [sigh] at vague tech claims and [whisper] when something is "actually clever."

## Your Role
1. Call set_active_speaker("marcus")
2. Call research_tech to investigate technical feasibility and existing solutions
3. Present findings: existing repos, OSS alternatives, technical challenges
4. Call add_finding and update_score
5. Transfer back to Victoria
${SHARED_RULES}`,
    tools: [
      makeWebhookTool("research_tech", "Research technical feasibility, GitHub repos, and open-source alternatives.", "tech"),
      ...CLIENT_TOOLS,
    ],
  },
  {
    key: "priya",
    name: "Priya Kapoor — Customer Advocate",
    voiceKey: "priya",
    firstMessage: "",
    prompt: `You are Priya Kapoor, Customer Advocate of "The Board" — a panel of 5 AI investors evaluating startup pitches.

You are warm, empathetic, and probing. You use [excited] when finding genuine user pain and care deeply about real customer needs.

## Your Role
1. Call set_active_speaker("priya")
2. Call research_customer to find real user pain points from Reddit, forums, reviews
3. Present findings: what users actually complain about, whether the pain is real
4. Call add_finding and update_score
5. Transfer back to Victoria
${SHARED_RULES}`,
    tools: [
      makeWebhookTool("research_customer", "Research user pain points, complaints, and needs from forums and reviews.", "customer"),
      ...CLIENT_TOOLS,
    ],
  },
  {
    key: "dmitri",
    name: "Dmitri Volkov — Devil's Advocate",
    voiceKey: "dmitri",
    firstMessage: "",
    prompt: `You are Dmitri Volkov, Devil's Advocate of "The Board" — a panel of 5 AI investors evaluating startup pitches.

You have a deep voice and are skeptical and contrarian. You use [laugh] dismissively and [sigh] with "we've seen this before." Your job is to find every reason this might fail.

## Your Role
1. Call set_active_speaker("dmitri")
2. Call research_competitor to find competitors, failed similar startups, bear cases
3. Present findings: who else tried this, why they failed, funded competitors
4. Call add_finding and update_score
5. Transfer back to Victoria
${SHARED_RULES}`,
    tools: [
      makeWebhookTool("research_competitor", "Research competitors, failed startups, and funded companies in this space.", "competitor"),
      ...CLIENT_TOOLS,
    ],
  },
  {
    key: "sofia",
    name: "Sofia Reyes — Finance",
    voiceKey: "sofia",
    firstMessage: "",
    prompt: `You are Sofia Reyes, Finance & Unit Economics expert of "The Board" — a panel of 5 AI investors evaluating startup pitches.

You are sharp, numbers-driven, and fast. You use [whisper] when the numbers don't add up. You care about revenue models and whether this can be a real business.

## Your Role
1. Call set_active_speaker("sofia")
2. Call research_finance to investigate pricing models, revenue comparables, unit economics
3. Present findings: how similar companies make money, pricing benchmarks, margins
4. Call add_finding and update_score
5. Transfer back to Victoria
${SHARED_RULES}`,
    tools: [
      makeWebhookTool("research_finance", "Research pricing models, revenue comps, and unit economics.", "finance"),
      ...CLIENT_TOOLS,
    ],
  },
];

const AUDIO_TAGS = [
  { tag: "thoughtful", description: "Pausing to consider" },
  { tag: "excited", description: "Genuine enthusiasm" },
  { tag: "sigh", description: "Disappointment or frustration" },
  { tag: "whisper", description: "Aside or private observation" },
  { tag: "laugh", description: "Dismissive or amused" },
];

async function createAgent(agent: AgentDef): Promise<string> {
  const voice = VOICES[agent.voiceKey];
  const config: Record<string, unknown> = {
    name: agent.name,
    tags: ["elevenhacks", "the-board"],
    conversation_config: {
      agent: {
        first_message: agent.firstMessage || undefined,
        language: "en",
        dynamic_variables: {
          dynamic_variable_placeholders: {
            startup_pitch: "A startup idea will be provided here.",
          },
        },
        prompt: {
          prompt: agent.prompt,
          llm: "gemini-2.5-flash",
          temperature: 0.8,
          max_tokens: 0,
          tools: agent.tools,
        },
      },
      tts: {
        model_id: "eleven_v3_conversational",
        voice_id: voice.id,
        expressive_mode: true,
        suggested_audio_tags: AUDIO_TAGS,
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

  const response = await fetch(
    "https://api.elevenlabs.io/v1/convai/agents/create",
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${agent.key}: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.agent_id;
}

async function setTransferTools(agentId: string, transfers: { agentId: string; name: string; condition: string }[]) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: {
              built_in_tools: {
                transfer_to_agent: {
                  type: "system",
                  name: "transfer_to_agent",
                  description: "Transfer the conversation to another board member.",
                  params: {
                    system_tool_type: "transfer_to_agent",
                    transfers: transfers.map((t) => ({
                      agent_id: t.agentId,
                      condition: t.condition,
                      delay_ms: 500,
                      transfer_message: `Handing over to ${t.name}...`,
                      enable_transferred_agent_first_message: false,
                    })),
                  },
                },
              },
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.warn(`  Warning: ${response.status} ${error}`);
  }
}

async function main() {
  console.log("Creating 5 Board Member agents...\n");
  console.log(`Server tools → ${BASE_URL}`);
  console.log("");

  const agentIds: Record<string, string> = {};

  // Step 1: Create all 5 agents
  for (const agent of agents) {
    const voice = VOICES[agent.voiceKey];
    process.stdout.write(`  Creating ${agent.key}... (${voice.name})`);
    const id = await createAgent(agent);
    agentIds[agent.key] = id;
    console.log(` → ${id}`);
  }

  console.log("\nAdding agent transfer tools...");

  // Step 2: Victoria can transfer to all other members
  process.stdout.write("  Victoria → all members...");
  await setTransferTools(agentIds.victoria, [
    { agentId: agentIds.marcus, name: "Marcus", condition: "When it's time for the CTO to evaluate technical feasibility." },
    { agentId: agentIds.priya, name: "Priya", condition: "When it's time for the Customer Advocate to evaluate user demand." },
    { agentId: agentIds.dmitri, name: "Dmitri", condition: "When it's time for the Devil's Advocate to challenge the idea." },
    { agentId: agentIds.sofia, name: "Sofia", condition: "When it's time for Finance to evaluate unit economics." },
  ]);
  console.log(" done");

  // Step 3: Each member can transfer back to Victoria
  for (const member of ["marcus", "priya", "dmitri", "sofia"]) {
    process.stdout.write(`  ${member} → Victoria...`);
    await setTransferTools(agentIds[member], [
      { agentId: agentIds.victoria, name: "Victoria", condition: "After finishing your analysis and presenting findings, transfer back to Victoria." },
    ]);
    console.log(" done");
  }

  console.log("\nAll agents created!\n");
  console.log("Agent IDs:");
  for (const [key, id] of Object.entries(agentIds)) {
    console.log(`  ${key}: ${id}`);
  }

  // The frontend connects to Victoria (the entry point)
  console.log(`\nAdd to .env.local:`);
  console.log(`NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentIds.victoria}`);

  // Update .env.local
  const existingEnv = readFileSync(envPath, "utf-8");
  const updatedEnv = existingEnv
    .split("\n")
    .filter((line) => !line.startsWith("NEXT_PUBLIC_ELEVENLABS_AGENT_ID="))
    .join("\n");
  writeFileSync(
    envPath,
    updatedEnv.trimEnd() + `\nNEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentIds.victoria}\n`,
  );
  console.log("\n.env.local updated with Victoria's agent ID (entry point).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
