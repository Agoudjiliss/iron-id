import { useCallback, useRef, useState } from "react";
import { verifyFile, type VerifyResponse } from "../api";
import { useI18n } from "../i18n";

const STATUS_MAP: Record<string, { labelKey: string; color: string; bg: string }> = {
  authentic: { labelKey: "status.authentic", color: "text-green-800", bg: "bg-green-50 border-green-200" },
  modified: { labelKey: "status.modified", color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-200" },
  suspect: { labelKey: "status.suspect", color: "text-orange-800", bg: "bg-orange-50 border-orange-200" },
  unverified: { labelKey: "status.unverified", color: "text-gray-800", bg: "bg-gray-50 border-gray-200" },
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");
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
      onFile(e.dataTransfer.files?.[0] ?? null);
    },
    [onFile]
  );

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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("verify.title")}</h1>

      {/* Drop zone */}
      {!result && (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-500 transition"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-lg shadow" />
            ) : (
              <div className="text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="font-medium">{t("verify.hint")}</p>
                <p className="text-sm mt-1">{t("verify.hint.sub")}</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <button
              onClick={handleVerify}
              disabled={loading}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("verify.loading")}
                </>
              ) : (
                t("verify.button")
              )}
            </button>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && st && (
        <div className="mt-6 space-y-4">
          <div className={`border rounded-xl p-5 ${st.bg}`}>
            <h2 className={`font-bold text-lg ${st.color}`}>{t(st.labelKey)}</h2>
          </div>

          <div className="bg-white border rounded-xl p-5 space-y-3 text-sm">
            <Check label={t("verify.watermarkDetected")} ok={result.watermark_found} />
            <div className="flex justify-between">
              <span className="text-gray-500">{t("verify.confidence")}</span>
              <span className="font-medium">{(result.watermark_confidence * 100).toFixed(1)}%</span>
            </div>
            <Check label={t("verify.c2paValid")} ok={result.c2pa_valid} />
            {result.author && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t("verify.author")}</span>
                <span className="font-medium">{result.author}</span>
              </div>
            )}
            {result.original_date && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t("verify.date")}</span>
                <span className="font-medium">{result.original_date}</span>
              </div>
            )}
            <Check
              label={t("verify.modifications")}
              ok={!result.modifications_detected}
              invertLabel
            />
          </div>

          {result.details && Object.keys(result.details).length > 0 && (
            <details className="bg-gray-50 border rounded-xl p-4">
              <summary className="cursor-pointer font-medium text-sm text-gray-600">
                {t("verify.details")}
              </summary>
              <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-gray-500">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}

          <button
            onClick={reset}
            className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
          >
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
      <span className="text-gray-500">{label}</span>
      {show ? (
        <span className="text-green-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {invertLabel ? "Non" : "Oui"}
        </span>
      ) : (
        <span className="text-red-500 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {invertLabel ? "Oui" : "Non"}
        </span>
      )}
    </div>
  );
}
