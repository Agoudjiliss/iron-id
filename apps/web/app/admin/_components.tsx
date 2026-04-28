"use client";

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
