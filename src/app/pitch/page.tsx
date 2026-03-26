"use client";

import { useState, useRef } from "react";
import { BoardRoom } from "@/components/board/board-room";
import {
  SpeechInput,
  SpeechInputCancelButton,
  SpeechInputPreview,
  SpeechInputRecordButton,
} from "@/components/ui/speech-input";
import { getScribeToken } from "@/app/actions";

async function getToken() {
  const result = await getScribeToken();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.token!;
}

export default function PitchPage() {
  const [pitch, setPitch] = useState("");
  const [url, setUrl] = useState("");
  const [isInSession, setIsInSession] = useState(false);
  const pitchAtStartRef = useRef("");

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
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-olive-900 px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="The Board"
            className="size-10 invert opacity-60"
          />
          <h1 className="font-display text-3xl text-olive-50 sm:text-5xl">
            Pitch to The Board
          </h1>
          <p className="max-w-md text-center text-sm/6 text-olive-400">
            Describe your startup idea, paste a URL, or use the mic to dictate.
          </p>
        </div>

        {/* Pitch text input + speech */}
        <div className="flex w-full flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-widest text-olive-500">
            Your pitch
          </label>
          <div className="relative">
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="We're building an AI-powered tool that helps freelance designers find and win more clients by automatically analyzing job postings and generating tailored proposals..."
              className="h-36 w-full resize-none rounded-xl border border-olive-700/50 bg-olive-800/50 px-4 py-3 pb-14 text-base/6 sm:text-sm/6 text-olive-100 placeholder:text-olive-600 focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <SpeechInput
                getToken={getToken}
                onStart={() => {
                  pitchAtStartRef.current = pitch;
                }}
                onChange={({ transcript }) => {
                  setPitch(pitchAtStartRef.current + transcript);
                }}
                onStop={({ transcript }) => {
                  setPitch(pitchAtStartRef.current + transcript);
                }}
                onCancel={() => {
                  setPitch(pitchAtStartRef.current);
                }}
                onError={(error) => {
                  console.error("Speech input error:", error);
                }}
              >
                <SpeechInputCancelButton className="text-olive-400 hover:text-olive-200" />
                <SpeechInputPreview placeholder="Listening..." className="text-sm text-olive-300" />
                <SpeechInputRecordButton className="size-10 rounded-lg bg-olive-700 text-olive-200 hover:bg-olive-600" />
              </SpeechInput>
            </div>
          </div>
        </div>

        {/* URL input */}
        <div className="flex w-full flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-widest text-olive-500">
            Startup URL{" "}
            <span className="normal-case tracking-normal text-olive-600">
              (optional)
            </span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourstartup.com"
            className="w-full rounded-xl border border-olive-700/50 bg-olive-800/50 px-4 py-3 text-base sm:text-sm text-olive-100 placeholder:text-olive-600 focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => setIsInSession(true)}
          disabled={!canSubmit}
          suppressHydrationWarning
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
