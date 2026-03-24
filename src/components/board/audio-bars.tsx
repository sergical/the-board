"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioBarsProps {
  getVolume: () => number;
  getFrequencyData?: () => Uint8Array | undefined;
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export function AudioBars({
  getVolume,
  getFrequencyData,
  isActive,
  barCount = 5,
  className,
}: AudioBarsProps) {
  const [levels, setLevels] = useState<number[]>(new Array(barCount).fill(0));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      setLevels(new Array(barCount).fill(0));
      return;
    }

    function tick() {
      const freqData = getFrequencyData?.();
      if (freqData && freqData.length > 0) {
        const step = Math.floor(freqData.length / barCount);
        const newLevels = Array.from({ length: barCount }, (_, i) => {
          const val = freqData[i * step] ?? 0;
          return val / 255;
        });
        setLevels(newLevels);
      } else {
        const vol = getVolume();
        const newLevels = Array.from({ length: barCount }, (_, i) => {
          const offset = Math.sin(Date.now() / 200 + i * 1.2) * 0.3;
          return Math.max(0, Math.min(1, vol + offset * vol));
        });
        setLevels(newLevels);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, barCount, getVolume, getFrequencyData]);

  return (
    <div className={cn("flex items-end justify-center gap-1", className)}>
      {levels.map((level, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-olive-400 transition-[height] duration-75"
          style={{ height: `${Math.max(4, level * 32)}px` }}
        />
      ))}
    </div>
  );
}
