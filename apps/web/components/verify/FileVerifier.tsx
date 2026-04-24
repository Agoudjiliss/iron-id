"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Search, ShieldCheck, ShieldX, Loader2, ExternalLink, FileText, Clock, Hash } from "lucide-react";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HashBadge } from "@/components/ui/HashBadge";
import { verifyByHash, verifyByUpload, type VerificationResult } from "@/lib/api";

type VerifyState = "idle" | "dragging" | "computing" | "uploading" | "done" | "error";

export function FileVerifier() {
  const t = useTranslations("verify");
  const tc = useTranslations("common");

  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  async function processFile(f: File) {
    setFile(f);
    setError(null);
    setState("computing");

    try {
      setState("uploading");
      const res = await verifyByUpload(f);
      setResult(res);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("error"));
      setState("error");
    }
  }

  async function handleHashLookup() {
    const hash = hashInput.trim().toLowerCase();
    if (hash.length !== 64 || !/^[0-9a-f]+$/.test(hash)) {
      setError("Format SHA-256 invalide (64 caractères hexadécimaux attendus).");
      return;
    }

    setError(null);
    setFile(null);
    setState("uploading");

    try {
      const res = await verifyByHash(hash);
      setResult(res);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("error"));
      setState("error");
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    if (state === "dragging") setState("idle");
  }, [state]);

  function reset() {
    setState("idle");
    setResult(null);
    setError(null);
    setFile(null);
    setHashInput("");
  }

  // --- Render ---

  if (state === "done" && result) {
    return <VerificationResult result={result} onReset={reset} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={t("dropzone.idle")}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "min-h-[260px] rounded-2xl border-2 border-dashed",
          "cursor-pointer transition-all duration-200",
          "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iron-gold",
          state === "idle"     && "border-iron-border hover:border-iron-gold/50 bg-iron-slate/30",
          state === "dragging" && "border-iron-gold bg-iron-gold/5 scale-[1.01]",
          (state === "computing" || state === "uploading") && "border-iron-blue/50 bg-iron-slate/30 cursor-wait",
          state === "error"    && "border-iron-red/50 bg-iron-red/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        {state === "idle" || state === "dragging" ? (
          <>
            <div className={cn(
              "mb-4 p-4 rounded-2xl transition-colors",
              state === "dragging" ? "bg-iron-gold/10" : "bg-iron-border/50 group-hover:bg-iron-gold/10",
            )}>
              <Upload
                size={32}
                className={cn(
                  "transition-colors",
                  state === "dragging" ? "text-iron-gold" : "text-iron-white/40 group-hover:text-iron-gold",
                )}
              />
            </div>
            <p className="text-iron-white font-medium mb-1">
              {state === "dragging" ? t("dropzone.dragging") : t("dropzone.idle")}
            </p>
            <p className="text-iron-white/40 text-sm">{t("dropzone.hint")}</p>
          </>
        ) : state === "computing" ? (
          <>
            <Loader2 size={32} className="text-iron-blue animate-spin mb-4" />
            <p className="text-iron-white font-medium">{t("dropzone.computing")}</p>
            {file && <p className="text-iron-white/40 text-sm mt-1">{file.name} · {formatBytes(file.size)}</p>}
          </>
        ) : state === "uploading" ? (
          <>
            <Loader2 size={32} className="text-iron-gold animate-spin mb-4" />
            <p className="text-iron-white font-medium">{t("dropzone.uploading")}</p>
          </>
        ) : state === "error" ? (
          <>
            <ShieldX size={32} className="text-iron-red mb-4" />
            <p className="text-iron-red font-medium">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-3 text-sm text-iron-white/50 hover:text-iron-white underline"
            >
              {tc("tryAgain")}
            </button>
          </>
        ) : null}
      </div>

      {/* Hash input */}
      <div className="space-y-2">
        <label className="text-sm text-iron-white/60 font-medium">
          {t("hashInput.label")}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-white/30" />
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder={t("hashInput.placeholder")}
              maxLength={64}
              onKeyDown={(e) => e.key === "Enter" && handleHashLookup()}
              className={cn(
                "w-full pl-8 pr-4 py-2.5 rounded-xl",
                "bg-iron-slate border border-iron-border",
                "font-mono text-sm text-iron-white placeholder:text-iron-white/25",
                "focus:outline-none focus:border-iron-gold/60",
                "transition-colors",
              )}
            />
          </div>
          <button
            onClick={handleHashLookup}
            disabled={hashInput.length === 0 || state === "uploading"}
            className={cn(
              "px-4 py-2.5 rounded-xl font-medium text-sm",
              "bg-iron-gold text-iron-black",
              "hover:bg-iron-gold-dim transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "flex items-center gap-2",
            )}
          >
            <Search size={14} />
            {t("hashInput.button")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Verification Result Component ----

interface ResultProps {
  result: VerificationResult;
  onReset: () => void;
}

function VerificationResult({ result, onReset }: ResultProps) {
  const t = useTranslations("verify.result");

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Status header */}
      <div className={cn(
        "rounded-2xl p-6 mb-6 border",
        result.is_certified
          ? "bg-iron-green/5 border-iron-green/20"
          : "bg-iron-red/5 border-iron-red/20",
      )}>
        <div className="flex items-center gap-4 mb-3">
          {result.is_certified ? (
            <ShieldCheck size={40} className="text-iron-green flex-shrink-0" />
          ) : (
            <ShieldX size={40} className="text-iron-red flex-shrink-0" />
          )}
          <div>
            <h2 className={cn(
              "text-xl font-bold",
              result.is_certified ? "text-iron-green" : "text-iron-red",
            )}>
              {result.is_certified ? t("certified") : t("notCertified")}
            </h2>
            <p className="text-iron-white/60 text-sm mt-0.5">
              {result.is_certified ? t("certifiedDesc") : t("notCertifiedDesc")}
            </p>
          </div>
        </div>
        <StatusBadge
          status={result.is_certified ? "certified" : "not_certified"}
          size="sm"
        />
      </div>

      {/* Details */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border divide-y divide-iron-border">
        <DetailRow
          icon={<Hash size={14} />}
          label={t("hash")}
          value={<HashBadge hash={result.file_hash_sha256} chars={10} />}
        />

        {result.file_name && (
          <DetailRow
            icon={<FileText size={14} />}
            label={t("fileName")}
            value={result.file_name}
          />
        )}

        {result.certified_at && (
          <DetailRow
            icon={<Clock size={14} />}
            label={t("certifiedAt")}
            value={formatDate(result.certified_at)}
          />
        )}

        {result.certification_id && (
          <DetailRow
            icon={<ShieldCheck size={14} />}
            label={t("certId")}
            value={
              <HashBadge
                hash={result.certification_id}
                chars={8}
                className="font-mono text-xs"
              />
            }
          />
        )}

        {result.ledger_history_count > 0 && (
          <DetailRow
            icon={<Search size={14} />}
            label={t("ledgerEntries")}
            value={String(result.ledger_history_count)}
          />
        )}
      </div>

      {/* C2PA Manifest (collapsible) */}
      {result.c2pa_manifest && (
        <details className="mt-4 rounded-2xl bg-iron-slate border border-iron-border overflow-hidden">
          <summary className="px-5 py-3 cursor-pointer text-sm font-medium text-iron-white/70 hover:text-iron-white flex items-center gap-2 select-none">
            <FileText size={14} />
            {t("manifest")}
          </summary>
          <pre className="px-5 pb-4 text-xs font-mono text-iron-white/60 overflow-x-auto">
            {JSON.stringify(result.c2pa_manifest, null, 2)}
          </pre>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={onReset}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium",
            "bg-iron-border text-iron-white/80",
            "hover:bg-iron-border/80 transition-colors",
          )}
        >
          {t("verifyAnother")}
        </button>

        {result.verification_url && (
          <a
            href={result.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2",
              "px-4 py-2 rounded-xl text-sm font-medium",
              "bg-iron-gold text-iron-black",
              "hover:bg-iron-gold-dim transition-colors",
            )}
          >
            {t("downloadCertified")}
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// ---- Sub-component ----

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-2 text-iron-white/50 text-sm flex-shrink-0">
        <span className="text-iron-white/30">{icon}</span>
        {label}
      </div>
      <div className="text-sm text-iron-white text-right">{value}</div>
    </div>
  );
}
