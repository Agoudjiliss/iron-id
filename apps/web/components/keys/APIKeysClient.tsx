"use client";

import { useEffect, useState } from "react";
import { Plus, Key, Loader2, Info } from "lucide-react";
import {
  createAPIKey,
  listAPIKeys,
  revokeAPIKey,
  type APIKey,
} from "@/lib/api";
import { APIKeyCard } from "./APIKeyCard";
import { cn } from "@/lib/utils";

interface NewKey extends APIKey {
  raw_key: string;
}

export function APIKeysClient() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKey, setNewKey] = useState<NewKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [environment, setEnvironment] = useState<"production" | "test">("production");

  useEffect(() => {
    listAPIKeys()
      .then(setKeys)
      .catch(() => setError("Impossible de charger les clés API."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const created = await createAPIKey(keyName.trim(), environment);
      setNewKey(created as NewKey);
      setKeys((prev) => [created, ...prev]);
      setShowForm(false);
      setKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await revokeAPIKey(id);
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: false } : k));
      if (newKey?.id === id) setNewKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la révocation.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-iron-white/50">
          {keys.filter((k) => k.is_active).length} clé{keys.filter((k) => k.is_active).length !== 1 ? "s" : ""} active{keys.filter((k) => k.is_active).length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
        >
          <Plus size={14} />
          Nouvelle clé
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-iron-slate border border-iron-gold/30 p-5 space-y-4 animate-fade-in"
        >
          <h3 className="text-sm font-semibold text-iron-white flex items-center gap-2">
            <Key size={14} className="text-iron-gold" />
            Créer une nouvelle clé API
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-iron-white/50">Nom de la clé</label>
            <input
              type="text"
              autoFocus
              placeholder="ex: Production app, CI/CD pipeline…"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              maxLength={255}
              required
              className="w-full px-3 py-2 rounded-xl bg-iron-black border border-iron-border text-sm text-iron-white placeholder:text-iron-white/25 focus:outline-none focus:border-iron-gold/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-iron-white/50">Environnement</label>
            <div className="flex gap-2">
              {(["production", "test"] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium transition-colors border",
                    environment === env
                      ? "bg-iron-gold/10 border-iron-gold/40 text-iron-gold"
                      : "bg-iron-black border-iron-border text-iron-white/50 hover:text-iron-white",
                  )}
                >
                  {env === "production" ? "iid_live_…" : "iid_test_…"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!keyName.trim() || creating}
              className="flex-1 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {creating && <Loader2 size={13} className="animate-spin" />}
              {creating ? "Création…" : "Créer la clé"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setKeyName(""); }}
              className="px-4 py-2 rounded-xl text-sm text-iron-white/50 hover:text-iron-white bg-iron-border hover:bg-iron-border/80 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-iron-red/10 border border-iron-red/20 text-iron-red text-sm">
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-iron-blue/5 border border-iron-blue/20 text-xs text-iron-white/50">
        <Info size={13} className="text-iron-blue flex-shrink-0 mt-0.5" />
        Les clés sont hachées avec bcrypt dès leur création. Seul le préfixe est affiché par la suite.
        Traitez vos clés comme des mots de passe.
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="flex items-center justify-center h-32 gap-2 text-iron-white/40 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Chargement…
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-2xl bg-iron-slate border border-iron-border p-10 text-center">
          <Key size={28} className="text-iron-border mx-auto mb-3" />
          <p className="text-sm text-iron-white/40">Aucune clé API. Créez-en une pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Show newly created key first with raw key */}
          {newKey && (
            <APIKeyCard
              key={`new-${newKey.id}`}
              apiKey={newKey}
              rawKey={newKey.raw_key}
              onRevoke={handleRevoke}
              isRevoking={revoking === newKey.id}
            />
          )}

          {/* All other keys */}
          {keys
            .filter((k) => k.id !== newKey?.id)
            .map((k) => (
              <APIKeyCard
                key={k.id}
                apiKey={k}
                onRevoke={handleRevoke}
                isRevoking={revoking === k.id}
              />
            ))}
        </div>
      )}
    </div>
  );
}
