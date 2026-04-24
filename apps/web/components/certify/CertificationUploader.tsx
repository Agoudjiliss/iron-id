"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  File,
  FileText,
  Image,
  Film,
  Music,
  ExternalLink,
  RotateCcw,
  Plus,
} from "lucide-react";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HashBadge } from "@/components/ui/HashBadge";
import { certifyFile, getCertification, type Certification } from "@/lib/api";

type UploaderState = "idle" | "dragging" | "uploading" | "polling" | "done" | "error";

const MIME_ICONS: Record<string, React.ElementType> = {
  "image/":       Image,
  "video/":       Film,
  "audio/":       Music,
  "application/": FileText,
};

function getFileIcon(mime: string): React.ElementType {
  for (const [prefix, Icon] of Object.entries(MIME_ICONS)) {
    if (mime.startsWith(prefix)) return Icon;
  }
  return File;
}

interface MetadataField {
  key: string;
  value: string;
}

export function CertificationUploader({ apiKey }: { apiKey: string }) {
  const [state, setState] = useState<UploaderState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [cert, setCert] = useState<Certification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [metaFields, setMetaFields] = useState<MetadataField[]>([
    { key: "author", value: "" },
  ]);
  const [webhookUrl, setWebhookUrl] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Metadata helpers ---
  function addMetaField() {
    setMetaFields((f) => [...f, { key: "", value: "" }]);
  }
  function updateMeta(idx: number, k: "key" | "value", v: string) {
    setMetaFields((f) => f.map((field, i) => i === idx ? { ...field, [k]: v } : field));
  }
  function removeMeta(idx: number) {
    setMetaFields((f) => f.filter((_, i) => i !== idx));
  }

  function buildMetadata(): Record<string, string> {
    return Object.fromEntries(
      metaFields
        .filter((f) => f.key.trim() && f.value.trim())
        .map((f) => [f.key.trim(), f.value.trim()]),
    );
  }

  // --- Polling ---
  function startPolling(certId: string) {
    setState("polling");
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 60 × 2s = 2 min max

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollRef.current!);
        setError("Délai d'attente dépassé. Vérifiez l'onglet Certifications.");
        setState("error");
        return;
      }

      try {
        const updated = await getCertification(certId, apiKey);
        setProgress(Math.min(95, 30 + attempts * 1.5));

        if (updated.status === "certified") {
          clearInterval(pollRef.current!);
          setCert(updated);
          setProgress(100);
          setState("done");
        } else if (updated.status === "failed") {
          clearInterval(pollRef.current!);
          setError("La certification a échoué. Réessayez.");
          setState("error");
        }
      } catch {
        // transient error — keep polling
      }
    }, 2000);
  }

  // --- Submit ---
  async function processFile(f: File) {
    setFile(f);
    setError(null);
    setProgress(5);
    setState("uploading");

    try {
      const result = await certifyFile(f, {
        apiKey,
        metadata: buildMetadata(),
        webhookUrl: webhookUrl.trim() || undefined,
      });
      setProgress(30);
      setCert(result);

      if (result.status === "certified") {
        setProgress(100);
        setState("done");
      } else {
        startPolling(result.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setState("error");
    }
  }

  function reset() {
    clearInterval(pollRef.current ?? undefined);
    setState("idle");
    setFile(null);
    setCert(null);
    setError(null);
    setProgress(0);
  }

  // --- Drag & drop ---
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [metaFields, webhookUrl]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (state === "idle") setState("dragging");
  }, [state]);

  const handleDragLeave = useCallback(() => {
    if (state === "dragging") setState("idle");
  }, [state]);

  // ---- Render: Result ----
  if (state === "done" && cert) {
    const FileIcon = cert.file_mime_type ? getFileIcon(cert.file_mime_type) : File;
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Success header */}
        <div className="rounded-2xl bg-iron-green/5 border border-iron-green/20 p-5 flex items-start gap-4">
          <CheckCircle size={36} className="text-iron-green flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-iron-green">Fichier certifié</h2>
            <p className="text-sm text-iron-white/60 mt-0.5">
              La signature C2PA et l'entrée dans le ledger sont confirmées.
            </p>
            <StatusBadge status="certified" size="sm" className="mt-2" />
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl bg-iron-slate border border-iron-border divide-y divide-iron-border">
          {[
            { label: "Fichier",     value: (
              <div className="flex items-center gap-2">
                <FileIcon size={13} className="text-iron-white/40" />
                <span className="text-sm text-iron-white">{cert.file_name}</span>
                {cert.file_size_bytes && (
                  <span className="text-xs text-iron-white/40">{formatBytes(cert.file_size_bytes)}</span>
                )}
              </div>
            )},
            { label: "Empreinte SHA-256", value: cert.file_hash_sha256 ? <HashBadge hash={cert.file_hash_sha256} /> : null },
            { label: "ID de certification", value: <HashBadge hash={cert.id} chars={8} /> },
            { label: "Certifié le",  value: <span className="text-sm text-iron-white">{formatDate(cert.created_at)}</span> },
          ].map(({ label, value }) => value ? (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="text-sm text-iron-white/50 flex-shrink-0">{label}</span>
              <div className="text-right">{value}</div>
            </div>
          ) : null)}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-iron-border text-iron-white/80 hover:bg-iron-border/80 transition-colors"
          >
            <RotateCcw size={13} />
            Certifier un autre fichier
          </button>
          {cert.certified_url && (
            <a
              href={cert.certified_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
            >
              Télécharger le fichier certifié
              <ExternalLink size={12} />
            </a>
          )}
          {cert.file_hash_sha256 && (
            <a
              href={`/verify/${cert.file_hash_sha256}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-iron-slate border border-iron-border text-iron-white/70 hover:text-iron-white transition-colors"
            >
              Page de vérification publique
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ---- Render: Form ----
  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => state === "idle" && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt de fichier"
        onKeyDown={(e) => e.key === "Enter" && state === "idle" && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "min-h-[220px] rounded-2xl border-2 border-dashed",
          "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iron-gold",
          state === "idle"     && "border-iron-border hover:border-iron-gold/50 bg-iron-slate/20 cursor-pointer group",
          state === "dragging" && "border-iron-gold bg-iron-gold/5 scale-[1.01] cursor-copy",
          (state === "uploading" || state === "polling") && "border-iron-blue/40 bg-iron-slate/20 cursor-wait",
          state === "error"    && "border-iron-red/40 bg-iron-red/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        {(state === "idle" || state === "dragging") && (
          <>
            <div className={cn(
              "p-4 rounded-2xl mb-4 transition-colors",
              state === "dragging"
                ? "bg-iron-gold/10"
                : "bg-iron-border/40 group-hover:bg-iron-gold/10",
            )}>
              <Upload size={28} className={cn(
                "transition-colors",
                state === "dragging" ? "text-iron-gold" : "text-iron-white/40 group-hover:text-iron-gold",
              )} />
            </div>
            <p className="font-medium text-iron-white">
              {state === "dragging" ? "Déposez le fichier ici" : "Glissez un fichier ou cliquez"}
            </p>
            <p className="text-sm text-iron-white/40 mt-1">
              Images, vidéos, PDF, audio — max 500 MB selon votre plan
            </p>
          </>
        )}

        {(state === "uploading" || state === "polling") && (
          <div className="flex flex-col items-center gap-3 w-full px-8">
            <Loader2 size={28} className="text-iron-gold animate-spin" />
            <p className="text-sm font-medium text-iron-white">
              {state === "uploading" ? "Envoi en cours…" : "Certification en cours…"}
            </p>
            {file && <p className="text-xs text-iron-white/40">{file.name} · {formatBytes(file.size)}</p>}
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-iron-border rounded-full overflow-hidden">
              <div
                className="h-full bg-iron-gold rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-iron-white/30">{Math.round(progress)}%</p>
          </div>
        )}

        {state === "error" && (
          <>
            <XCircle size={28} className="text-iron-red mb-3" />
            <p className="text-iron-red font-medium text-sm px-6 text-center">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-3 text-xs text-iron-white/50 hover:text-iron-white underline"
            >
              Réessayer
            </button>
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden">
        <div className="px-5 py-3 border-b border-iron-border flex items-center justify-between">
          <p className="text-sm font-medium text-iron-white">Métadonnées (optionnel)</p>
          <button
            onClick={addMetaField}
            className="flex items-center gap-1 text-xs text-iron-gold hover:text-iron-gold-dim transition-colors"
          >
            <Plus size={12} /> Ajouter un champ
          </button>
        </div>
        <div className="p-4 space-y-2">
          {metaFields.map((field, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="Clé (ex: auteur)"
                value={field.key}
                onChange={(e) => updateMeta(idx, "key", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-iron-black border border-iron-border text-sm text-iron-white placeholder:text-iron-white/25 focus:outline-none focus:border-iron-gold/50 transition-colors"
              />
              <input
                type="text"
                placeholder="Valeur"
                value={field.value}
                onChange={(e) => updateMeta(idx, "value", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-iron-black border border-iron-border text-sm text-iron-white placeholder:text-iron-white/25 focus:outline-none focus:border-iron-gold/50 transition-colors"
              />
              {metaFields.length > 1 && (
                <button
                  onClick={() => removeMeta(idx)}
                  className="px-2 text-iron-white/30 hover:text-iron-red transition-colors"
                  aria-label="Supprimer ce champ"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URL */}
      <div>
        <label className="text-sm font-medium text-iron-white/60 mb-1.5 block">
          Webhook URL (optionnel)
        </label>
        <input
          type="url"
          placeholder="https://monapp.com/webhooks/ironid"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-iron-slate border border-iron-border text-sm text-iron-white placeholder:text-iron-white/25 focus:outline-none focus:border-iron-gold/50 transition-colors"
        />
        <p className="text-xs text-iron-white/30 mt-1">
          Un POST sera envoyé à cette URL quand la certification est terminée.
        </p>
      </div>
    </div>
  );
}
