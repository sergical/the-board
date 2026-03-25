import Firecrawl from "@mendable/firecrawl-js";

function getClient() {
  return new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });
}

export async function firecrawlSearch(
  query: string,
  options?: {
    limit?: number;
    tbs?: string;
  },
): Promise<string> {
  if (!process.env.FIRECRAWL_API_KEY) {
    return "Error: Firecrawl API key not configured.";
  }

  try {
    const client = getClient();
    console.log(`[Firecrawl] Searching: "${query}" (limit: ${options?.limit ?? 3}, tbs: ${options?.tbs ?? "none"})`);

    const result = await client.search(query, {
      limit: options?.limit ?? 2,
      tbs: options?.tbs,
      timeout: 10000,
    });

    console.log(`[Firecrawl] Raw result type: ${typeof result}, keys: ${Object.keys(result ?? {}).join(", ")}`);
    console.log(`[Firecrawl] Result preview:`, JSON.stringify(result).slice(0, 300));

    // SDK returns { web: [...] } or { data: [...] } depending on version
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;
    const items: unknown[] = r.web ?? r.data ?? (Array.isArray(r) ? r : []);

    console.log(`[Firecrawl] Items found: ${items.length}`);

    if (!items.length) {
      return "No results found for this query.";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summaries = items.map((item: any, i: number) => {
      const content = item.markdown
        ? item.markdown.slice(0, 500)
        : item.description ?? "";
      console.log(`[Firecrawl] Result ${i + 1}: ${item.title} (${item.url})`);
      return `Source ${i + 1}: ${item.title ?? "Untitled"}\n${content}\nURL: ${item.url ?? ""}`;
    });

    return summaries.join("\n\n---\n\n");
  } catch (error) {
    console.error("[Firecrawl] Search failed:", error);
    return "Research temporarily unavailable.";
  }
}
