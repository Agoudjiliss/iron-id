"use client";

const LANGS = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "عر", flag: "🇸🇦" },
];

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface Props {
  current: string;
  compact?: boolean;
}

export function LanguageSwitcher({ current, compact = false }: Props) {
  function handleSwitch(code: string) {
    if (code === current) return;

    // 1. Write cookie directly from the browser (no server action required).
    //    The NEXT_LOCALE cookie is not httpOnly, so JS can write it.
    document.cookie =
      `NEXT_LOCALE=${code}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;

    // 2. Full navigation to the same URL — guaranteed fresh server render.
    //    The browser sends the new cookie in the request so the server
    //    picks up the new locale immediately.
    window.location.href =
      window.location.pathname + window.location.search;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LANGS.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => handleSwitch(code)}
            aria-label={`Switch to ${label}`}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold
              border transition-all duration-150 min-w-[36px] justify-center
              ${current === code
                ? "bg-iron-gold/15 border-iron-gold text-iron-gold"
                : "border-iron-border/60 text-iron-white/50 hover:text-iron-white hover:border-iron-white/30 active:scale-95"
              }
            `}
          >
            <span className="text-sm leading-none">{flag}</span>
            <span className="hidden sm:inline ml-0.5">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Desktop pill group
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-iron-border bg-iron-black/50 p-1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          aria-label={`Switch to ${label}`}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            current === code
              ? "bg-iron-gold text-iron-black"
              : "text-iron-white/40 hover:text-iron-white active:scale-95"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
