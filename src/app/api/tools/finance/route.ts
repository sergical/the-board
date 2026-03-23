import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const results = await firecrawlSearch(
      `${idea} pricing model revenue business model unit economics SaaS subscription`,
    );

    return NextResponse.json({
      results,
      agent: "sofia",
      category: "finance",
    });
  } catch {
    return NextResponse.json(
      { error: "Finance research failed" },
      { status: 500 },
    );
  }
}
