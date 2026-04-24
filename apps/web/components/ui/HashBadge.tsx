"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn, truncateHash } from "@/lib/utils";

interface HashBadgeProps {
  hash: string;
  chars?: number;
  className?: string;
  showFull?: boolean;
}

export function HashBadge({
  hash,
  chars = 8,
  className,
  showFull = false,
}: HashBadgeProps) {
  const [copied, setCopied] = useState(false);

  const display = showFull ? hash : truncateHash(hash, chars);

  async function handleCopy() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title={`Click to copy: ${hash}`}
      aria-label={`Hash ${display} — click to copy`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md",
        "bg-iron-slate border border-iron-border",
        "px-3 py-1.5",
        "font-mono text-xs text-iron-white/70",
        "hover:border-iron-gold/40 hover:text-iron-white",
        "transition-all duration-150",
        "cursor-pointer select-none",
        className,
      )}
    >
      <span className="truncate max-w-[280px]">{display}</span>
      <span
        className={cn(
          "flex-shrink-0 transition-all duration-150",
          copied ? "text-iron-green" : "text-iron-white/30 group-hover:text-iron-gold",
        )}
      >
        {copied ? (
          <Check size={12} aria-hidden />
        ) : (
          <Copy size={12} aria-hidden />
        )}
      </span>
    </button>
  );
}
