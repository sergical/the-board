import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const results = await firecrawlSearch(
      `${idea} competitors funded startups failed shutdown similar companies landscape`,
    );

    return NextResponse.json({
      results,
      agent: "dmitri",
      category: "competitor",
    });
  } catch {
    return NextResponse.json(
      { error: "Competitor research failed" },
      { status: 500 },
    );
  }
}
