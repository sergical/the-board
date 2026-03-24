import { NextResponse } from "next/server";
import Firecrawl from "@mendable/firecrawl-js";

export async function POST(request: Request) {
  const { url } = await request.json();
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || !url) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  try {
    console.log(`[Scrape] Scraping URL: ${url}`);
    const client = new Firecrawl({ apiKey });
    const result = await client.scrape(url, {
      formats: [
        "markdown",
        {
          type: "json",
          schema: {
            type: "object",
            properties: {
              company_name: { type: "string" },
              tagline: { type: "string" },
              what_they_do: { type: "string" },
              pricing: { type: "string" },
              key_features: { type: "array", items: { type: "string" } },
            },
          },
        },
      ],
      onlyMainContent: true,
    });

    console.log(`[Scrape] Result keys:`, Object.keys(result ?? {}));
    console.log(`[Scrape] Result preview:`, JSON.stringify(result).slice(0, 300));

    const json = (result as Record<string, unknown>).json as Record<string, unknown> | undefined;
    const markdown = (result as Record<string, unknown>).markdown as string | undefined;

    console.log(`[Scrape] JSON extract:`, json ? Object.keys(json) : "none");
    console.log(`[Scrape] Markdown length:`, markdown?.length ?? 0);

    let summary = "";
    if (json) {
      if (json.company_name) summary += `Company: ${json.company_name}\n`;
      if (json.tagline) summary += `Tagline: ${json.tagline}\n`;
      if (json.what_they_do) summary += `What they do: ${json.what_they_do}\n`;
      if (json.pricing) summary += `Pricing: ${json.pricing}\n`;
      if (Array.isArray(json.key_features) && json.key_features.length) {
        summary += `Key features: ${json.key_features.join(", ")}\n`;
      }
    }
    if (markdown) {
      summary += `\n--- Website Content ---\n${markdown}`;
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}
