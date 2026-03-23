"use client";

import { Orb } from "@/components/ui/orb";

export function HeroOrb() {
  return (
    <Orb
      colors={["#3d3d28", "#6b6b4e"]}
      agentState="listening"
      volumeMode="auto"
    />
  );
}
