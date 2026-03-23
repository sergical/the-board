"use client";

import { useState } from "react";
import { BoardRoom } from "@/components/board/board-room";

export default function PitchPage() {
  const [pitch, setPitch] = useState("");
  const [url, setUrl] = useState("");
  const [isInSession, setIsInSession] = useState(false);

  if (isInSession) {
    return (
      <BoardRoom
        pitch={url ? `${pitch}\n\nStartup URL: ${url}` : pitch}
        onEnd={() => {
          setIsInSession(false);
          setPitch("");
          setUrl("");
        }}
      />
    );
  }

  const canSubmit = pitch.trim().length > 0 || url.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-olive-900 px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="The Board" className="size-10 invert opacity-60" />
          <h1 className="font-display text-4xl text-olive-50 sm:text-5xl">
            Pitch to The Board
          </h1>
          <p className="max-w-md text-center text-sm/6 text-olive-400">
            Describe your startup idea, or drop a URL and we&apos;ll research
            it. You&apos;ll speak directly with the board once inside.
          </p>
        </div>

        {/* Pitch text input */}
        <div className="flex w-full flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-widest text-olive-500">
            Your pitch
          </label>
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="We're building an AI-powered tool that helps freelance designers find and win more clients by automatically analyzing job postings and generating tailored proposals..."
            className="h-36 w-full resize-none rounded-xl border border-olive-700/50 bg-olive-800/50 px-4 py-3 text-sm/6 text-olive-100 placeholder:text-olive-600 focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600"
          />
        </div>

        {/* URL input */}
        <div className="flex w-full flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-widest text-olive-500">
            Startup URL <span className="normal-case tracking-normal text-olive-600">(optional)</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourstartup.com"
            className="w-full rounded-xl border border-olive-700/50 bg-olive-800/50 px-4 py-3 text-sm text-olive-100 placeholder:text-olive-600 focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => setIsInSession(true)}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-olive-100 py-4 text-sm font-semibold text-olive-950 transition-colors hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-20 sm:w-auto sm:rounded-full sm:px-12"
        >
          Enter The Board Room
        </button>

        <a
          href="/"
          className="text-xs text-olive-600 transition-colors hover:text-olive-400"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
