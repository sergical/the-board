import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

const TOOL_TIMEOUT = 20000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Research timed out")), TOOL_TIMEOUT),
    );

    const results = await Promise.race([
      firecrawlSearch(
        `${idea} pricing model revenue business model unit economics SaaS subscription`,
      ),
      timeoutPromise,
    ]);

    return NextResponse.json({
      results,
      agent: "sofia",
      category: "finance",
    });
  } catch {
    return NextResponse.json({
      results:
        "Financial research timed out. Continue your analysis using your existing knowledge about the business model.",
      agent: "sofia",
      category: "finance",
    });
  }
}
