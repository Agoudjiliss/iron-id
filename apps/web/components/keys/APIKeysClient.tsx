"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Key, Loader2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const { getToken } = useAuth();
  const t = useTranslations("keys");
  const tCommon = useTranslations("common");

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
    getToken().then((token) => {
      if (!token) { setLoading(false); return; }
      listAPIKeys(token)
        .then(setKeys)
        .catch(() => setError(t("loadError")))
        .finally(() => setLoading(false));
    });
  }, [getToken]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    const token = await getToken();
    if (!token) { setError(t("sessionExpired")); return; }

    setCreating(true);
    setError(null);
    try {
      const created = await createAPIKey(keyName.trim(), environment, token);
      const lintrk = (
        window as Window & {
          lintrk?: (action: string, data: { conversion_id: number }) => void;
        }
      ).lintrk;
      lintrk?.("track", { conversion_id: 27563273 });
      setNewKey(created as NewKey);
      setKeys((prev) => [created, ...prev]);
      setShowForm(false);
      setKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createError"));
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    const token = await getToken();
    if (!token) { setError(t("sessionExpired")); return; }

    setRevoking(id);
    try {
      await revokeAPIKey(id, token);
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: false } : k));
      if (newKey?.id === id) setNewKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("revokeError"));
    } finally {
      setRevoking(null);
    }
  }

  const activeCount = keys.filter((k) => k.is_active).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-iron-white/50">
          {activeCount === 0
            ? t("activeCount_zero")
            : activeCount === 1
            ? t("activeCount_one")
            : t("activeCount_other", { count: activeCount })}
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
        >
          <Plus size={14} />
          {t("newKey")}
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
            {t("createTitle")}
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-iron-white/50">{t("keyName")}</label>
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
            <label className="text-xs text-iron-white/50">{t("environment")}</label>
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
              {creating ? t("creating") : t("createKey")}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setKeyName(""); }}
              className="px-4 py-2 rounded-xl text-sm text-iron-white/50 hover:text-iron-white bg-iron-border hover:bg-iron-border/80 transition-colors"
            >
              {t("cancel")}
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
        {t("bcryptInfo")}
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="flex items-center justify-center h-32 gap-2 text-iron-white/40 text-sm">
          <Loader2 size={16} className="animate-spin" />
          {tCommon("loading")}
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-2xl bg-iron-slate border border-iron-border p-10 text-center">
          <Key size={28} className="text-iron-border mx-auto mb-3" />
          <p className="text-sm text-iron-white/40">{t("noKeys")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {newKey && (
            <APIKeyCard
              key={`new-${newKey.id}`}
              apiKey={newKey}
              rawKey={newKey.raw_key}
              onRevoke={handleRevoke}
              isRevoking={revoking === newKey.id}
            />
          )}

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
