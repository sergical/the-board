"use server";

export async function getScribeToken(): Promise<{ token?: string; error?: string }> {
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      return { error: `Token request failed: ${response.status}` };
    }

    const data = await response.json();
    return { token: data.token };
  } catch (err) {
    return { error: String(err) };
  }
}
