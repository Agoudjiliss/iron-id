"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Key, AlertTriangle } from "lucide-react";
import { listAPIKeys, type APIKey } from "@/lib/api";
import { CertificationUploader } from "./CertificationUploader";
import { cn } from "@/lib/utils";

/**
 * Client component that loads the user's API keys, lets them select one,
 * then mounts the CertificationUploader with the selected key.
 */
export function CertifyPageClient() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [rawKey, setRawKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) { setLoading(false); return; }
      listAPIKeys(token)
        .then((k) => {
          const active = k.filter((key) => key.is_active);
          setKeys(active);
          if (active.length > 0) setSelectedKeyId(active[0].id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-iron-white/40 text-sm">
        Chargement des clés API…
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-8 text-center">
        <Key size={32} className="text-iron-white/20 mx-auto mb-3" />
        <p className="text-sm font-medium text-iron-white mb-1">Aucune clé API active</p>
        <p className="text-xs text-iron-white/40 mb-4">
          Vous avez besoin d'une clé API pour certifier des fichiers.
        </p>
        <a
          href="/keys"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
        >
          Créer une clé API
        </a>
      </div>
    );
  }

  // If using a manually entered key (e.g. for testing)
  const activeApiKey = rawKey.startsWith("iid_") ? rawKey : null;

  return (
    <div className="space-y-4">
      {/* Key selector */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-iron-white">
          <Key size={14} className="text-iron-gold" />
          Clé API utilisée
        </div>

        <select
          value={selectedKeyId}
          onChange={(e) => setSelectedKeyId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-iron-black border border-iron-border text-sm text-iron-white focus:outline-none focus:border-iron-gold/50 transition-colors"
        >
          {keys.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name} — {k.key_prefix}
            </option>
          ))}
        </select>

        {/* Raw key input (shown only if no key is selected) */}
        <div className="space-y-1">
          <label className="text-xs text-iron-white/40">
            Ou collez votre clé complète (iid_live_…)
          </label>
          <input
            type="password"
            placeholder="iid_live_..."
            value={rawKey}
            onChange={(e) => setRawKey(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-xl text-sm font-mono",
              "bg-iron-black border border-iron-border",
              "text-iron-white placeholder:text-iron-white/20",
              "focus:outline-none focus:border-iron-gold/50 transition-colors",
            )}
          />
        </div>

        {!activeApiKey && (
          <div className="flex items-center gap-2 text-xs text-iron-red/80">
            <AlertTriangle size={12} />
            Collez votre clé API complète pour certifier un fichier.
          </div>
        )}
      </div>

      {/* Uploader — only active when we have a raw key */}
      {activeApiKey ? (
        <CertificationUploader apiKey={activeApiKey} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-iron-border h-[200px] flex items-center justify-center opacity-50">
          <p className="text-sm text-iron-white/40">Entrez votre clé API pour commencer</p>
        </div>
      )}
    </div>
  );
}
