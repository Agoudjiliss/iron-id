"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Key } from "lucide-react";
import { listAPIKeys, type APIKey } from "@/lib/api";
import { CertificationUploader } from "./CertificationUploader";

/**
 * Client component that authenticates via Clerk session token,
 * then mounts the CertificationUploader.
 */
export function CertifyPageClient() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) { setLoading(false); return; }
      setSessionToken(token);
      listAPIKeys(token)
        .then((k) => setKeys(k.filter((key) => key.is_active)))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-iron-white/40 text-sm">
        Chargement…
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-8 text-center">
        <p className="text-sm text-iron-white/40">Session expirée. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.length > 0 && (
        <div className="rounded-2xl bg-iron-slate border border-iron-border px-4 py-3 flex items-center gap-2 text-sm text-iron-white/60">
          <Key size={13} className="text-iron-gold flex-shrink-0" />
          {keys.length} clé{keys.length > 1 ? "s" : ""} API active{keys.length > 1 ? "s" : ""} sur votre compte
        </div>
      )}
      <CertificationUploader sessionToken={sessionToken} />
    </div>
  );
}
