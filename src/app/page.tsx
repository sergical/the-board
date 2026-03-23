import Link from "next/link";
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
    quote: '"Show me the unit economics or show me the door."',
  },
];

const steps = [
  {
    step: "01",
    title: "Pitch",
    desc: "Describe your startup idea by voice or text. Be specific about what you're building, who it's for, and how it makes money.",
  },
  {
    step: "02",
    title: "Research",
    desc: "Each board member searches the live web via Firecrawl for market data, competitors, GitHub repos, and customer pain points.",
  },
  {
    step: "03",
    title: "Deliberate",
    desc: "They argue. The CTO challenges the Contrarian. The Customer Advocate pushes back on Finance. Real multi-voice debate.",
  },
  {
    step: "04",
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
        <Container className="flex flex-col items-center gap-8">
          <Eyebrow>AI Board of Directors</Eyebrow>
          <Heading className="max-w-4xl text-center">
            Pitch your startup.{" "}
            <span className="italic">They&apos;ll be honest.</span>
          </Heading>
          <Text
            size="lg"
            className="flex max-w-2xl flex-col gap-4 text-center"
          >
            5 AI investors with different voices, different perspectives, and
            real-time web research. They argue about your idea. Then they vote.
          </Text>
          <div className="flex items-center gap-4 pt-2">
            <ButtonLink href="/pitch" size="lg">
              Enter The Board Room
            </ButtonLink>
          </div>
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
      <section className="bg-olive-950 py-20">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col items-start gap-3">
            <Eyebrow className="bg-olive-800 text-olive-300">
              How it works
            </Eyebrow>
            <Subheading className="text-white">
              From pitch to verdict in under 5 minutes
            </Subheading>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="flex flex-col gap-3 rounded-2xl bg-olive-900 p-6 ring-1 ring-olive-800"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-olive-800 font-mono text-sm font-semibold text-olive-300">
                  {item.step}
                </div>
                <h3 className="font-display text-2xl text-white">
                  {item.title}
                </h3>
                <p className="text-sm/6 text-olive-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Powered by */}
      <section className="bg-olive-100 py-16">
        <Container className="flex flex-col items-center gap-6">
          <Eyebrow>Powered by</Eyebrow>
          <div className="flex items-center gap-10">
            <a
              href="https://elevenlabs.io"
              target="_blank"
              className="font-display text-2xl text-olive-800 transition-colors hover:text-olive-950"
            >
              ElevenLabs
            </a>
            <span className="text-olive-300">&times;</span>
            <a
              href="https://firecrawl.dev"
              target="_blank"
              className="font-display text-2xl text-olive-800 transition-colors hover:text-olive-950"
            >
              Firecrawl
            </a>
          </div>
          <p className="max-w-md text-center text-sm text-olive-500">
            5 ElevenAgents with unique voices and agent transfer. Real-time web
            research via Firecrawl Search API. Multi-agent deliberation with
            expressive audio tags.
          </p>
        </Container>
      </section>

      {/* CTA + Footer */}
      <section className="bg-olive-950 pt-20 pb-10">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Subheading className="text-white">
            Ready to face The Board?
          </Subheading>
          <Text className="max-w-lg text-olive-400">
            Your startup idea deserves honest feedback backed by real data. Not
            generic AI platitudes.
          </Text>
          <ButtonLink href="/pitch" color="light" size="lg">
            Start Pitching
          </ButtonLink>
          <div className="mt-12 border-t border-olive-800 pt-8 text-sm text-olive-600">
            Built by{" "}
            <a
              href="https://x.com/sergical"
              target="_blank"
              className="font-medium text-olive-400 underline"
            >
              @sergical
            </a>{" "}
            for{" "}
            <a
              href="https://hacks.elevenlabs.io"
              target="_blank"
              className="underline"
            >
              #ElevenHacks
            </a>{" "}
            Week 1
          </div>
        </Container>
      </section>
    </div>
  );
}
