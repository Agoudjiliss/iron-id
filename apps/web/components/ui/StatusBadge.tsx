"use client";

import { cn } from "@/lib/utils";
import type { CertificationStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: CertificationStatus | "verified" | "not_certified";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CONFIG = {
  certified:     { label: "Certifié",      dot: "bg-iron-green",  text: "text-iron-green",  ring: "ring-iron-green/20",  icon: "✓" },
  verified:      { label: "Vérifié",       dot: "bg-iron-green",  text: "text-iron-green",  ring: "ring-iron-green/20",  icon: "✓" },
  pending:       { label: "En attente",    dot: "bg-iron-gold",   text: "text-iron-gold",   ring: "ring-iron-gold/20",   icon: "⏳" },
  processing:    { label: "Traitement…",   dot: "bg-iron-blue",   text: "text-iron-blue",   ring: "ring-iron-blue/20",   icon: "⚙" },
  failed:        { label: "Échoué",        dot: "bg-iron-red",    text: "text-iron-red",    ring: "ring-iron-red/20",    icon: "✕" },
  not_certified: { label: "Non certifié",  dot: "bg-iron-red",    text: "text-iron-red",    ring: "ring-iron-red/20",    icon: "✕" },
} as const;

const SIZE = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1   text-sm gap-1.5",
  lg: "px-4 py-1.5 text-base gap-2",
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const { label, dot, text, ring, icon } = CONFIG[status] ?? CONFIG.failed;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        "bg-iron-slate",
        ring,
        text,
        SIZE[size],
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          dot,
          size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2",
          status === "processing" && "animate-pulse",
        )}
      />
      {label}
    </span>
  );
}
