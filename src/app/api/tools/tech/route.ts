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
        `${idea} open source alternative github repository existing solution technical feasibility`,
      ),
      timeoutPromise,
    ]);

    return NextResponse.json({
      results,
      agent: "marcus",
      category: "tech",
    });
  } catch {
    return NextResponse.json({
      results:
        "Technical research timed out. Continue your analysis using your existing knowledge about the technical landscape.",
      agent: "marcus",
      category: "tech",
    });
  }
}
