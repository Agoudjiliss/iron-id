"use client";

import { createContext, useContext } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.iron-id.io";

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

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center h-14 px-6 border-b border-iron-border flex-shrink-0">
        <h1 className="text-sm font-bold text-iron-white">{title}</h1>
        <span className="ml-2 text-xs text-iron-white/30">IronID Admin</span>
      </div>
      <main className="flex-1 p-6 overflow-y-auto space-y-6">{children}</main>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-iron-gold/30 border-t-iron-gold rounded-full animate-spin" />
    </div>
  );
}
