import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  // Get signed URL for WebSocket connection
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    {
      headers: { "xi-api-key": apiKey },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed: ${response.status}` },
      { status: 500 },
    );
  }

  const data = await response.json();
  return NextResponse.json({ signedUrl: data.signed_url });
}
