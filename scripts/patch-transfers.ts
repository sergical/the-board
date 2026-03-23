import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}
const API_KEY = env.ELEVENLABS_API_KEY!;

const agentIds: Record<string, string> = {
  victoria: "agent_2401kmdes5sgf5p98hbv400yfzqr",
  marcus: "agent_5401kmdes72eejqa2cnq4n4e6d4q",
  priya: "agent_3401kmdes8pmfeda1nm2t9kseezd",
  dmitri: "agent_2101kmdes9p1ejnvyrzy871mj77q",
  sofia: "agent_2001kmdesatte2h9fjkqkp3h5485",
};

async function setTransfers(agentId: string, transfers: { agent_id: string; condition: string; name: string }[]) {
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
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
                  transfers: transfers.map(t => ({
                    agent_id: t.agent_id,
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
  });
  if (!res.ok) {
    console.error(`  FAIL ${res.status}:`, await res.text());
  } else {
    console.log(`  OK`);
  }
}

async function main() {
  console.log("Patching agent transfers...\n");

  process.stdout.write("Victoria → all members");
  await setTransfers(agentIds.victoria, [
    { agent_id: agentIds.marcus, name: "Marcus", condition: "When it's time for the CTO to evaluate technical feasibility." },
    { agent_id: agentIds.priya, name: "Priya", condition: "When it's time for the Customer Advocate to evaluate user demand." },
    { agent_id: agentIds.dmitri, name: "Dmitri", condition: "When it's time for the Devil's Advocate to challenge the idea." },
    { agent_id: agentIds.sofia, name: "Sofia", condition: "When it's time for Finance to evaluate unit economics." },
  ]);

  for (const member of ["marcus", "priya", "dmitri", "sofia"] as const) {
    process.stdout.write(`${member} → Victoria`);
    await setTransfers(agentIds[member], [
      { agent_id: agentIds.victoria, name: "Victoria", condition: "After finishing your analysis and presenting findings, transfer back to Victoria the chairperson." },
    ]);
  }

  console.log("\nDone!");
}

main();
