import { useCallback, useRef, useState } from "react";
import { verifyFile, type VerifyResponse } from "../api";
import { useI18n } from "../i18n";

const STATUS_MAP: Record<string, { labelKey: string; color: string; bg: string; border: string }> = {
  authentic: {
    labelKey: "status.authentic",
    color: "text-emerald-800 dark:text-emerald-200",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  modified: {
    labelKey: "status.modified",
    color: "text-amber-800 dark:text-amber-200",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
  suspect: {
    labelKey: "status.suspect",
    color: "text-orange-800 dark:text-orange-200",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  unverified: {
    labelKey: "status.unverified",
    color: "text-ink-muted",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-600",
  },
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      onFile(e.dataTransfer.files?.[0] ?? null);
    },
    [onFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await verifyFile(file);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const st = result ? STATUS_MAP[result.status] || STATUS_MAP.unverified : null;

  return (
    <div className="max-w-form mx-auto px-page py-6 sm:py-10">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink mb-4 sm:mb-6 leading-tight">
        {t("verify.title")}
      </h1>

      {!result && (
        <>
          <div
            role="button"
            tabIndex={0}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`card border-2 border-dashed p-6 sm:p-10 min-h-[200px] sm:min-h-0 text-center cursor-pointer transition-all duration-150 rounded-card flex flex-col items-center justify-center ${
              dragOver ? "border-brand-300 bg-brand-50/30 dark:bg-brand-50/10" : "border-slate-200 dark:border-slate-600 hover:border-brand-300"
            }`}
            aria-label={t("verify.hint")}
          >
            {preview ? (
              <img
                src={preview}
                alt=""
                className="max-h-64 mx-auto rounded-button object-contain"
                loading="lazy"
              />
            ) : (
              <div className="text-ink-muted">
                <svg className="w-12 h-12 mx-auto mb-3 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="font-medium text-ink">{t("verify.hint")}</p>
                <p className="text-sm mt-1 text-ink-muted">{t("verify.hint.sub")}</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              aria-label={t("verify.hint")}
            />
          </div>

          {file && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="mt-6 w-full btn-primary py-3 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
                  {t("verify.loading")}
                </>
              ) : (
                t("verify.button")
              )}
            </button>
          )}
        </>
      )}

      {error && (
        <div className="mt-6 card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 rounded-card animate-shake">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && st && (
        <div className="space-y-4">
          <div className={`card border ${st.bg} ${st.border} p-5 rounded-card`}>
            <h2 className={`font-bold text-lg ${st.color}`}>{t(st.labelKey)}</h2>
          </div>

          <div className="card p-5 space-y-3 text-sm">
            <Check label={t("verify.watermarkDetected")} ok={result.watermark_found} />
            <div className="flex justify-between">
              <span className="text-ink-muted">{t("verify.confidence")}</span>
              <span className="font-medium text-ink">{(result.watermark_confidence * 100).toFixed(1)}%</span>
            </div>
            <Check label={t("verify.c2paValid")} ok={result.c2pa_valid} />
            {result.author && (
              <div className="flex justify-between">
                <span className="text-ink-muted">{t("verify.author")}</span>
                <span className="font-medium text-ink">{result.author}</span>
              </div>
            )}
            {result.original_date && (
              <div className="flex justify-between">
                <span className="text-ink-muted">{t("verify.date")}</span>
                <span className="font-medium text-ink">{result.original_date}</span>
              </div>
            )}
            <Check label={t("verify.modifications")} ok={!result.modifications_detected} invertLabel />
          </div>

          {result.details && Object.keys(result.details).length > 0 && (
            <details className="card p-4 rounded-card">
              <summary className="cursor-pointer font-medium text-sm text-ink-muted">
                {t("verify.details")}
              </summary>
              <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-ink-subtle font-mono">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}

          <button type="button" onClick={reset} className="btn-secondary w-full py-2.5">
            {t("verify.again")}
          </button>
        </div>
      )}
    </div>
  );
}

function Check({
  label,
  ok,
  invertLabel,
}: {
  label: string;
  ok: boolean;
  invertLabel?: boolean;
}) {
  const show = invertLabel ? !ok : ok;
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      {show ? (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {invertLabel ? "Non" : "Oui"}
        </span>
      ) : (
        <span className="text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {invertLabel ? "Oui" : "Non"}
        </span>
      )}
    </div>
  );
}
