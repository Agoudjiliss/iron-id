"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavLink {
  href: string;
  label: string;
}

interface NavCta {
  signIn: string;
  signUp: string;
}

interface NavProps {
  locale: string;
  links: NavLink[];
  cta: NavCta;
}

export function Nav({ locale, links, cta }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-iron-black/90 backdrop-blur-md border-b border-iron-border/60"
          : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield size={22} className="text-iron-gold" />
          <span className="text-lg font-bold text-iron-white tracking-tight">
            Iron<span className="text-gradient-gold">ID</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-iron-white/50 hover:text-iron-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + Language switcher */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher current={locale} />
          <Link
            href="/sign-in"
            className="text-sm text-iron-white/60 hover:text-iron-white transition-colors"
          >
            {cta.signIn}
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-iron-gold text-iron-black hover:bg-iron-gold/90 transition-colors"
          >
            {cta.signUp}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-iron-white/60 hover:text-iron-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-iron-black/95 border-b border-iron-border px-6 py-4 space-y-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-sm text-iron-white/60 hover:text-iron-white transition-colors py-1"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            className="block text-sm text-iron-white/60 hover:text-iron-white transition-colors py-1"
          >
            {cta.signIn}
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            className="block w-full text-center px-4 py-2 rounded-xl text-sm font-semibold bg-iron-gold text-iron-black"
          >
            {cta.signUp}
          </Link>
          <div className="pt-2">
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
