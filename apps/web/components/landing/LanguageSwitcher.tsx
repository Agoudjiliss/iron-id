"use client";
import { useTransition } from "react";
import { setLocale } from "@/lib/actions/locale";

const LANGS = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "عر", flag: "🇸🇦" },
];

interface Props {
  current: string;
  /** compact = mobile header version (flag + label, bigger touch target) */
  compact?: boolean;
}

export function LanguageSwitcher({ current, compact = false }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSwitch(code: string) {
    if (code === current) return;
    startTransition(async () => {
      await setLocale(code);
      window.location.reload();
    });
  }

  if (compact) {
    // Mobile version — flag buttons side by side, gold ring on active
    return (
      <div className={`flex items-center gap-1 ${isPending ? "opacity-60" : ""}`}>
        {LANGS.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => handleSwitch(code)}
            aria-label={label}
            className={`
              flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold
              border transition-all duration-150
              ${current === code
                ? "bg-iron-gold/15 border-iron-gold text-iron-gold"
                : "border-iron-border/60 text-iron-white/50 hover:text-iron-white hover:border-iron-white/30"
              }
            `}
          >
            <span className="text-sm leading-none">{flag}</span>
            <span className="hidden xs:inline">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Desktop version — pill group
  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl border border-iron-border bg-iron-black/50 p-1 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            current === code
              ? "bg-iron-gold text-iron-black"
              : "text-iron-white/40 hover:text-iron-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
