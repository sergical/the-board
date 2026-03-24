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
        `${idea} market size TAM total addressable market growth rate 2025 2026`,
        { tbs: "qdr:y" },
      ),
      timeoutPromise,
    ]);

    return NextResponse.json({
      results,
      agent: "victoria",
      category: "market",
    });
  } catch {
    return NextResponse.json({
      results:
        "Market research timed out. Continue your analysis using your existing knowledge about this market.",
      agent: "victoria",
      category: "market",
    });
  }
}
