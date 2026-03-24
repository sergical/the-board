# The Board — Architecture Overview

## What It Is

An AI-powered pitch evaluation platform. Users pitch startup ideas and 5 AI board members — each with a unique voice, personality, and research specialty — evaluate the idea using real-time web research, debate each other, and deliver a verdict.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Voice AI | ElevenLabs Conversational AI (`@elevenlabs/react`) |
| Web Research | Firecrawl Search API |
| UI Components | shadcn/ui, ElevenLabs UI (Conversation, Message, BarVisualizer, SpeechInput) |
| Design System | Oatmeal Tailwind Plus template (olive palette, Instrument Serif + Inter) |
| Deployment | Vercel |

## Architecture Diagram

```
User (Browser)
    │
    ├── Landing Page (/)
    │     Static marketing page with board member cards
    │
    ├── Pitch Page (/pitch)
    │     Text input + SpeechInput (Scribe STT) + optional URL
    │
    └── Board Room (/pitch → BoardRoom component)
          │
          ├── useConversation() ──→ ElevenLabs WebSocket (signed URL)
          │     │
          │     ├── Agent speaks ──→ onAgentChatResponsePart (streaming)
          │     │     └── Regex strips <Marcus>tags</Marcus> + [audio tags]
          │     │     └── Updates transcript in real-time
          │     │
          │     ├── Agent calls client tools ──→ React state updates
          │     │     ├── set_phase → phase indicator
          │     │     ├── set_active_speaker → avatar highlighting
          │     │     ├── add_finding → findings panel
          │     │     ├── update_score → score badges
          │     │     ├── cast_vote → vote badges
          │     │     └── render_verdict → verdict overlay
          │     │
          │     └── Agent calls server tools (webhooks) ──→ Next.js API routes
          │           ├── /api/tools/market ──→ Firecrawl Search
          │           ├── /api/tools/tech ──→ Firecrawl Search
          │           ├── /api/tools/customer ──→ Firecrawl Search
          │           ├── /api/tools/competitor ──→ Firecrawl Search
          │           └── /api/tools/finance ──→ Firecrawl Search
          │
          └── /api/conversation-token ──→ ElevenLabs signed URL
```

## The 5 Board Members

| Member | Role | Voice | Color | Research Focus |
|--------|------|-------|-------|---------------|
| Victoria Sterling | Chair & Market | Alice (British) | Indigo | Market size, TAM, trends |
| Marcus Chen | CTO | Eric (Smooth) | Emerald | GitHub, OSS, tech feasibility |
| Priya Kapoor | Customer Advocate | Sarah (Reassuring) | Amber | Reddit, forums, user pain |
| Dmitri Volkov | Devil's Advocate | Adam (Dominant) | Red | Failed startups, competitors |
| Sofia Reyes | Finance | Matilda (Professional) | Purple | Pricing models, unit economics |

## Multi-Voice Architecture

Single ElevenLabs agent with `supported_voices` configuration. The LLM uses XML tags to switch voices:

```
Victoria speaks without tags (default voice).
<Marcus>Marcus speaks like this.</Marcus>
<Priya>Priya speaks like this.</Priya>
```

The frontend parses these tags to:
1. Detect which board member is speaking
2. Strip tags from displayed transcript
3. Update the active speaker indicator

## Meeting Flow

```
Phase 1: PITCH (0s)
  └── User's pitch displayed, session auto-starts

Phase 2: RESEARCH (0-2 min)
  └── Each member calls their Firecrawl tool, presents findings
  └── Client tools: add_finding(), update_score()

Phase 3: DELIBERATION (2-3 min)
  └── Members argue about findings
  └── Real disagreement between personas

Phase 4: VERDICT (3-4 min)
  └── Each member votes (invest/pass/abstain)
  └── Client tools: cast_vote(), render_verdict()
  └── Overlay shows final decision
```

## Key Files

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pitch/page.tsx              # Pitch input + board room
│   ├── actions.ts                  # Server action: getScribeToken
│   └── api/
│       ├── conversation-token/     # ElevenLabs signed URL
│       └── tools/                  # Firecrawl research endpoints
│           ├── market/
│           ├── tech/
│           ├── customer/
│           ├── competitor/
│           └── finance/
├── components/
│   ├── board/                      # Board room UI
│   │   ├── board-room.tsx          # Main orchestration + useConversation
│   │   ├── agent-panel.tsx         # 5 avatar cards
│   │   ├── agent-avatar.tsx        # Individual avatar
│   │   ├── findings-panel.tsx      # Research findings sidebar
│   │   ├── phase-indicator.tsx     # Phase progress bar
│   │   ├── transcript-panel.tsx    # Transcript (fallback)
│   │   └── verdict-overlay.tsx     # Final verdict modal
│   ├── ui/                         # shadcn + ElevenLabs UI
│   └── elements/                   # Oatmeal template components
├── lib/
│   ├── board-state.ts              # Types, constants, initial state
│   ├── firecrawl.ts                # Firecrawl search helper
│   └── utils.ts                    # cn() utility
└── hooks/
    └── use-scribe.ts               # ElevenLabs Scribe STT hook
```

## Environment Variables

```
ELEVENLABS_API_KEY          # Server-side only
NEXT_PUBLIC_ELEVENLABS_AGENT_ID  # Agent ID (Victoria multi-voice)
FIRECRAWL_API_KEY           # Server-side only
```

---

## Assessment: What Can Be Improved

### High Impact (Should Do)

1. **Deploy to Vercel + update tool URLs** — Currently using ngrok tunnel for Firecrawl webhooks. Deploy to Vercel and point the agent's tool URLs to the production domain for reliability.

2. **Firecrawl `/v2/agent` endpoint** — Currently using basic `/v1/search`. The `/v2/agent` endpoint does autonomous multi-step research (no URLs needed, returns structured JSON). Would make research results dramatically better.

3. **Firecrawl structured extraction** — Use `scrapeOptions.extract` with JSON schemas to get structured data (market size as numbers, competitor names as arrays) instead of raw markdown. Agents could cite specific stats.

4. **URL scraping for pitch context** — When a user pastes a startup URL, use Firecrawl to scrape the site and inject the content into the agent's dynamic variables. Currently the URL is just passed as text.

5. **Session persistence / shareable results** — Save the board meeting results (transcript, findings, scores, verdict) to a database so users can share a link to their results. Great for the viral video angle.

### Medium Impact (Nice to Have)

6. **Post-meeting PDF/report** — Generate a downloadable "Board Minutes" PDF with all findings, scores, and the verdict. KillMyStartup (competitor) does this with an "Autopsy Report."

7. **Voice cloning for more distinct personas** — ElevenLabs Professional Voice Cloning could create truly unique voices rather than using stock voices.

8. **Parallel research** — Currently research happens sequentially (one member at a time). The agent prompt could be updated to trigger multiple research tools simultaneously, with members presenting findings as they arrive.

9. **Streaming text sync with audio** — Use `onAudioAlignment` (character-level timing from ElevenLabs SDK) to sync the transcript display with the actual spoken audio, so text appears word-by-word as it's spoken rather than as a block.

10. **Mobile responsive board room** — The findings panel is hidden on mobile (`max-sm:hidden`). Could show it as a bottom sheet or tab on mobile.

### Low Impact (Polish)

11. **OG image generation** — Dynamic OG images for shared board meeting results (using `@vercel/og` / Satori).

12. **Sound effects** — ElevenLabs supports `tool_call_sound` (typing, elevator sounds) during tool execution. Could add subtle audio cues while research is happening.

13. **Conversation replay** — Use the TranscriptViewer component with `onAudioAlignment` data to let users replay their board meeting with word-level highlighting synced to audio.

14. **Rate limiting** — Add rate limiting to API routes to prevent abuse of Firecrawl/ElevenLabs credits.

15. **Analytics** — Track how many pitches are submitted, average meeting duration, most common verdict types. Good data for the hackathon submission.
