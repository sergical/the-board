interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

interface FirecrawlSearchResponse {
  success: boolean;
  data: FirecrawlSearchResult[];
}

export async function firecrawlSearch(
  query: string,
  options?: {
    limit?: number;
    sources?: string[];
    tbs?: string;
  },
): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return "Error: Firecrawl API key not configured.";
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: options?.limit ?? 3,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Firecrawl error:", response.status, text);
      return `Could not complete research: ${response.status}`;
    }

    const data: FirecrawlSearchResponse = await response.json();

    if (!data.success || !data.data?.length) {
      return "No results found for this query.";
    }

    // Format results into a readable summary for the agent to speak
    const summaries = data.data.map((result, i) => {
      const content = result.markdown
        ? result.markdown.slice(0, 500)
        : result.description;
      return `Source ${i + 1}: ${result.title}\n${content}\nURL: ${result.url}`;
    });

    return summaries.join("\n\n---\n\n");
  } catch (error) {
    console.error("Firecrawl search failed:", error);
    return "Research temporarily unavailable.";
  }
}
