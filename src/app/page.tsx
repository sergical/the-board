import Link from "next/link";
import { Mic, Search, MessageSquare, Gavel } from "lucide-react";
import { ButtonLink } from "@/components/elements/button";
import { Container } from "@/components/elements/container";
import { Heading } from "@/components/elements/heading";
import { Text } from "@/components/elements/text";
import { Eyebrow } from "@/components/elements/eyebrow";
import { Subheading } from "@/components/elements/subheading";

const boardMembers = [
  {
    name: "Victoria Sterling",
    role: "Chair & Market Strategist",
    image: "/img/victoria.jpg",
    quote: '"The market tells the story. Let me find it."',
  },
  {
    name: "Marcus Chen",
    role: "Technical CTO",
    image: "/img/marcus.jpg",
    quote: '"If it can be built with open source, it will be."',
  },
  {
    name: "Priya Kapoor",
    role: "Customer Advocate",
    image: "/img/priya.jpg",
    quote: '"Do people actually want this? Let me check."',
  },
  {
    name: "Dmitri Volkov",
    role: "Devil's Advocate",
    image: "/img/dmitri.jpg",
    quote: "\"We've seen this before. It didn't end well.\"",
  },
  {
    name: "Sofia Reyes",
    role: "Finance & Unit Economics",
    image: "/img/sofia.jpg",
    quote: '"Show me the numbers or show me the door."',
  },
];

const steps = [
  {
    icon: Mic,
    title: "Pitch",
    desc: "Describe your startup idea by voice or text. Be specific about what you're building, who it's for, and how it makes money.",
  },
  {
    icon: Search,
    title: "Research",
    desc: "Each board member searches the live web via Firecrawl for market data, competitors, GitHub repos, and customer pain points.",
  },
  {
    icon: MessageSquare,
    title: "Deliberate",
    desc: "They argue. The CTO challenges the Contrarian. The Customer Advocate pushes back on Finance. Real multi-voice debate.",
  },
  {
    icon: Gavel,
    title: "Verdict",
    desc: "Unanimous yes, split decision, or hung jury. Every vote is backed by real web research and cited evidence.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-olive-50">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-olive-200 bg-olive-50/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="The Board" className="size-8" />
            <span className="font-display text-xl text-olive-950">
              The Board
            </span>
          </Link>
          <ButtonLink href="/pitch" size="lg">
            Start Pitching
          </ButtonLink>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-olive-100 py-24 sm:py-32">
        <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Heading className="max-w-xl">
            Shark Tank meets YC.
            <br />
            <span className="italic">Powered by AI.</span>
          </Heading>
          <div className="flex max-w-sm flex-col gap-5">
            <Text size="lg">
              What if{" "}
              <a href="https://github.com/garrytan/gstack" target="_blank" className="underline decoration-olive-400 underline-offset-2 hover:text-olive-950">gstack</a>
              {" "}could talk? Five AI board members research your idea, argue about it, and vote.
            </Text>
            <div>
              <ButtonLink href="/pitch" size="lg">
                Enter The Board Room
              </ButtonLink>
            </div>
          </div>
        </Container>
        <Container className="pt-16 sm:pt-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/preview-v4.png"
            alt="The Board in action — 5 AI board members deliberating on a startup pitch"
            className="w-full rounded-2xl shadow-2xl ring-1 ring-olive-200"
          />
        </Container>
      </section>

      {/* Board Members */}
      <section className="bg-olive-50 py-20">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col items-start gap-3">
            <Eyebrow>Meet your board</Eyebrow>
            <Subheading>
              5 investors. 5 voices. Real research.
            </Subheading>
            <Text className="max-w-2xl text-pretty">
              Each board member has a unique voice, personality, and research
              specialty. They use Firecrawl to search the live web before
              forming their opinion.
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {boardMembers.map((member) => (
              <div
                key={member.name}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-sm ring-1 ring-olive-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-olive-950/90 via-olive-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                  <p className="text-sm/5 italic text-olive-200">
                    {member.quote}
                  </p>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-olive-300">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-olive-50 py-20">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col items-start gap-3">
            <Eyebrow>How it works</Eyebrow>
            <Subheading>
              From pitch to verdict in under 5 minutes
            </Subheading>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-2xl bg-olive-200/50 p-6 ring-1 ring-olive-200"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-olive-950 text-olive-100">
                  <item.icon className="size-5" />
                </div>
                <h3 className="font-display text-2xl text-olive-950">
                  {item.title}
                </h3>
                <p className="text-sm/6 text-olive-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-olive-100 py-20">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Subheading>Ready to pitch?</Subheading>
          <Text className="max-w-lg text-olive-600">
            5 minutes. 5 investors. Real research. No sugarcoating.
          </Text>
          <ButtonLink href="/pitch" size="lg">
            Enter The Board Room
          </ButtonLink>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-olive-50 py-8">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-olive-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-5 opacity-40" />
              <span>The Board</span>
              <span className="text-olive-300">·</span>
              <span>
                Powered by{" "}
                <a href="https://elevenlabs.io" target="_blank" className="underline hover:text-olive-700">ElevenLabs</a>
                {" & "}
                <a href="https://firecrawl.dev" target="_blank" className="underline hover:text-olive-700">Firecrawl</a>
              </span>
            </div>
            <div className="text-sm text-olive-500">
              Built by{" "}
              <a href="https://x.com/sergical" target="_blank" className="font-medium text-olive-700 underline">@sergical</a>
              {" for "}
              <a href="https://hacks.elevenlabs.io" target="_blank" className="underline">#ElevenHacks</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
