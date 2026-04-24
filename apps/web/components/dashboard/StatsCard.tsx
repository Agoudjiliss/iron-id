import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "gold" | "green" | "blue" | "red";
  className?: string;
}

const ACCENT = {
  gold:  { icon: "text-iron-gold",  bg: "bg-iron-gold/10",  ring: "ring-iron-gold/20"  },
  green: { icon: "text-iron-green", bg: "bg-iron-green/10", ring: "ring-iron-green/20" },
  blue:  { icon: "text-iron-blue",  bg: "bg-iron-blue/10",  ring: "ring-iron-blue/20"  },
  red:   { icon: "text-iron-red",   bg: "bg-iron-red/10",   ring: "ring-iron-red/20"   },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "gold",
  className,
}: StatsCardProps) {
  const { icon: iconColor, bg: iconBg, ring } = ACCENT[accent];

  return (
    <div
      className={cn(
        "rounded-2xl bg-iron-slate border border-iron-border p-5",
        "hover:border-iron-gold/20 transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl ring-1", iconBg, ring)}>
          <Icon size={18} className={iconColor} />
        </div>

        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.value >= 0
                ? "bg-iron-green/10 text-iron-green"
                : "bg-iron-red/10 text-iron-red",
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-iron-white tabular-nums">{value}</p>
      <p className="text-sm text-iron-white/50 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-iron-white/30 mt-1">{subtitle}</p>}
    </div>
  );
}
