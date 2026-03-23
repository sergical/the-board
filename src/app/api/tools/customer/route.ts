import { NextResponse } from "next/server";
import { firecrawlSearch } from "@/lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = body.idea || body.startup_idea || "startup";

    const results = await firecrawlSearch(
      `${idea} user complaints pain points reddit forum review problems frustrations`,
    );

    return NextResponse.json({
      results,
      agent: "priya",
      category: "customer",
    });
  } catch {
    return NextResponse.json(
      { error: "Customer research failed" },
      { status: 500 },
    );
  }
}
