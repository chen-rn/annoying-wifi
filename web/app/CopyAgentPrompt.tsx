"use client";

import { useState } from "react";

const AGENT_PROMPT = `Install auto-wi2-captive-accept on this Mac.

1. Clone https://github.com/chen-rn/auto-wi2-captive-accept into ~/Documents/projects (or wherever I keep code).
2. cd into the cloned directory and run ./install.sh.
3. The installer expects npm on PATH and will pull Playwright + Chromium. Let it run.
4. Confirm the LaunchAgent is loaded:
     launchctl list | grep auto-wi2-captive-accept
   And tail the status:
     cat "$HOME/Library/Logs/auto-wi2-captive-accept.status"

It runs every 30 seconds, detects Wi2 captive portals (DOUTOR, Starbucks, Wi2 Free), and auto-accepts them in headless Chromium. Designed for DOUTOR_FREE_Wi-Fi and at_STARBUCKS_Wi2; other Wi2 SSIDs may or may not work.`;

type Props = {
  children: React.ReactNode;
  copiedLabel?: React.ReactNode;
  className?: string;
};

export function CopyAgentPrompt({
  children,
  copiedLabel = "Copied",
  className = "action-link",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the prompt below:", AGENT_PROMPT);
    }
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? copiedLabel : children}
    </button>
  );
}
