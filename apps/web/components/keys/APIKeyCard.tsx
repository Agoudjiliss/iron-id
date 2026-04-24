"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Trash2, Key, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { APIKey } from "@/lib/api";

interface APIKeyCardProps {
  apiKey: APIKey;
  rawKey?: string;           // Only present immediately after creation
  onRevoke: (id: string) => void;
  isRevoking?: boolean;
}

export function APIKeyCard({
  apiKey,
  rawKey,
  onRevoke,
  isRevoking = false,
}: APIKeyCardProps) {
  const [revealed, setRevealed] = useState(!!rawKey);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const displayValue = rawKey && revealed ? rawKey : apiKey.key_prefix;

  async function handleCopy() {
    const toCopy = rawKey ?? apiKey.key_prefix;
    await navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-iron-slate border transition-colors",
        apiKey.is_active
          ? "border-iron-border hover:border-iron-gold/20"
          : "border-iron-border/30 opacity-60",
        rawKey && "border-iron-gold/30 ring-1 ring-iron-gold/10",
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-2 rounded-xl",
              apiKey.is_active ? "bg-iron-gold/10" : "bg-iron-border/50",
            )}>
              <Key size={14} className={apiKey.is_active ? "text-iron-gold" : "text-iron-white/30"} />
            </div>
            <div>
              <p className="text-sm font-semibold text-iron-white">{apiKey.name}</p>
              <p className="text-xs text-iron-white/40">
                {apiKey.is_active ? "Active" : "Révoquée"}
              </p>
            </div>
          </div>

          {/* New badge */}
          {rawKey && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-iron-green/15 text-iron-green ring-1 ring-iron-green/20">
              Nouvelle
            </span>
          )}
        </div>

        {/* Key display */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-iron-black border border-iron-border overflow-hidden">
            <code className="flex-1 text-xs font-mono text-iron-white/70 truncate">
              {revealed && rawKey ? rawKey : displayValue}
            </code>
          </div>

          {rawKey && (
            <button
              onClick={() => setRevealed(!revealed)}
              title={revealed ? "Masquer" : "Révéler"}
              className="flex-shrink-0 p-2 rounded-xl text-iron-white/40 hover:text-iron-white hover:bg-iron-border transition-colors"
            >
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copier"
            className="flex-shrink-0 p-2 rounded-xl text-iron-white/40 hover:text-iron-gold hover:bg-iron-gold/10 transition-colors"
          >
            {copied ? <Check size={14} className="text-iron-green" /> : <Copy size={14} />}
          </button>
        </div>

        {/* New key warning */}
        {rawKey && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-iron-gold/5 border border-iron-gold/20 text-xs text-iron-gold/80">
            ⚠️ Copiez cette clé maintenant — elle ne sera plus affichée.
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-iron-white/30">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Créée le {formatDate(apiKey.created_at)}
          </span>
          {apiKey.last_used_at && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              Utilisée le {formatDate(apiKey.last_used_at)}
            </span>
          )}
        </div>
      </div>

      {/* Revoke action */}
      {apiKey.is_active && (
        <div className="border-t border-iron-border/50 px-4 py-3 flex justify-end">
          {confirmRevoke ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-iron-white/50">Confirmer la révocation ?</span>
              <button
                onClick={() => setConfirmRevoke(false)}
                className="text-xs text-iron-white/40 hover:text-iron-white px-2 py-1 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => { setConfirmRevoke(false); onRevoke(apiKey.id); }}
                disabled={isRevoking}
                className="text-xs text-iron-red hover:text-iron-red/80 px-3 py-1 rounded-lg bg-iron-red/10 hover:bg-iron-red/20 transition-colors disabled:opacity-40"
              >
                {isRevoking ? "Révocation…" : "Révoquer"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRevoke(true)}
              className="flex items-center gap-1.5 text-xs text-iron-white/30 hover:text-iron-red transition-colors"
            >
              <Trash2 size={12} />
              Révoquer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
