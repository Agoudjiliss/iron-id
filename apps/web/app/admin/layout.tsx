"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, BarChart2, Users, Tag, MessageSquare, Gift,
  LogOut, ChevronRight, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.iron-id.io";

// ── Context ──────────────────────────────────────────────────────────────────
export const AdminKeyContext = createContext<string>("");
export function useAdminKey() { return useContext(AdminKeyContext); }

export function adminFetch(path: string, key: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": key,
      ...(init.headers ?? {}),
    },
  });
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/admin",          label: "Overview",  icon: BarChart2      },
  { href: "/admin/users",    label: "Users",     icon: Users          },
  { href: "/admin/coupons",  label: "Coupons",   icon: Tag            },
  { href: "/admin/trials",   label: "Trials",    icon: Gift           },
  { href: "/admin/feedback", label: "Feedback",  icon: MessageSquare  },
];

// ── Gate ─────────────────────────────────────────────────────────────────────
function AdminGate({ onKey }: { onKey: (k: string) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/v1/admin/stats`, {
        headers: { "X-Admin-Key": input.trim() },
      });
      if (res.ok) {
        sessionStorage.setItem("ironid_admin_key", input.trim());
        onKey(input.trim());
      } else {
        setError("Invalid admin key.");
      }
    } catch {
      setError("Cannot reach API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-iron-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield size={28} className="text-iron-gold" />
          <span className="text-xl font-bold text-iron-white">IronID Admin</span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-iron-border bg-iron-slate p-8 space-y-4"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-iron-gold/10 border border-iron-gold/20 mx-auto mb-4">
            <Lock size={20} className="text-iron-gold" />
          </div>
          <h1 className="text-center text-lg font-bold text-iron-white">Admin Access</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter admin key…"
            className="w-full px-4 py-3 rounded-xl border border-iron-border bg-iron-black/50 text-iron-white text-sm placeholder:text-iron-white/20 focus:outline-none focus:border-iron-gold/50"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-iron-gold text-iron-black font-bold text-sm hover:bg-iron-gold/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying…" : "Access dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col w-56 min-h-screen bg-iron-slate border-r border-iron-border flex-shrink-0">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-iron-border">
        <Shield size={18} className="text-iron-gold" />
        <span className="text-sm font-bold text-iron-white">
          Iron<span className="text-gradient-gold">ID</span>{" "}
          <span className="text-iron-white/30 font-normal">admin</span>
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-iron-gold/10 text-iron-gold"
                  : "text-iron-white/50 hover:text-iron-white hover:bg-iron-border/50",
              )}
            >
              <Icon size={15} className={active ? "text-iron-gold" : "text-iron-white/30"} />
              {label}
              {active && <ChevronRight size={11} className="ml-auto text-iron-gold/60" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-iron-border pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-iron-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ironid_admin_key");
    setAdminKey(stored);
    setChecked(true);
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("ironid_admin_key");
    setAdminKey(null);
  }

  if (!checked) return null;

  if (!adminKey) {
    return <AdminGate onKey={setAdminKey} />;
  }

  return (
    <AdminKeyContext.Provider value={adminKey}>
      <div className="flex min-h-screen bg-iron-black text-iron-white">
        <AdminSidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminKeyContext.Provider>
  );
}
