"use client";
import { useTransition } from "react";
import { setLocale } from "@/lib/actions/locale";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "عر" },
];

export function LanguageSwitcher({ current }: { current: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSwitch(code: string) {
    if (code === current) return;
    startTransition(async () => {
      await setLocale(code);
      window.location.reload();
    });
  }

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
