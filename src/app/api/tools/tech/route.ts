import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const results = await firecrawlSearch(
      `${idea} open source alternative github repository existing solution technical feasibility`,
    );

    return NextResponse.json({
      results,
      agent: "marcus",
      category: "tech",
    });
  } catch {
    return NextResponse.json(
      { error: "Tech research failed" },
      { status: 500 },
    );
  }
}
