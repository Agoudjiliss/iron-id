"use client";

import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-iron-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="relative z-50 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <header className="h-16 flex items-center justify-between px-6 border-b border-iron-border bg-iron-black/50 backdrop-blur-sm sticky top-0 z-30">
        {/* Left: mobile menu + page title */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-1.5 rounded-lg text-iron-white/50 hover:text-iron-white hover:bg-iron-border transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div>
            <h1 className="text-base font-semibold text-iron-white">{title}</h1>
            {description && (
              <p className="text-xs text-iron-white/40 hidden sm:block">{description}</p>
            )}
          </div>
        </div>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 rounded-lg text-iron-white/40 hover:text-iron-white hover:bg-iron-border transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-iron-border"
            />
          )}
        </div>
      </header>
    </>
  );
}
