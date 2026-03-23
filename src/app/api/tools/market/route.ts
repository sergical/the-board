import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const results = await firecrawlSearch(
      `${idea} market size TAM total addressable market growth rate 2025 2026`,
    );

    return NextResponse.json({
      results,
      agent: "victoria",
      category: "market",
    });
  } catch {
    return NextResponse.json(
      { error: "Market research failed" },
      { status: 500 },
    );
  }
}
