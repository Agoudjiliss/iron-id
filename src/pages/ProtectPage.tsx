import { useCallback, useRef, useState } from "react";
import {
  protectFile,
  connectProgress,
  getJobResult,
  getDownloadUrl,
  type JobResult,
} from "../api";
import { useI18n } from "../i18n";

type Step = "idle" | "uploading" | "processing" | "done" | "error";

export default function ProtectPage() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [author, setAuthor] = useState("");
  const [level, setLevel] = useState("standard");
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview("");
    }
    setStep("idle");
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

  const handleSubmit = async () => {
    if (!file) return;
    setStep("uploading");
    setProgress(0);
    setError("");
    try {
      const resp = await protectFile(file, { author }, level);
      setStep("processing");

      const ws = connectProgress(
        resp.job_id,
        (data) => {
          setProgress((data.progress as number) ?? 0);
          setProgressMsg((data.message as string) ?? "");
        },
        async (wsResult) => {
          if (wsResult.error) {
            setError(wsResult.error);
            setStep("error");
            return;
          }
          try {
            const full = await getJobResult(resp.job_id);
            setResult(full);
          } catch {
            setResult(wsResult);
          }
          setStep("done");
        },
        (err) => {
          setError(err);
          setStep("error");
        }
      );

      return () => ws.close();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle");
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("protect.title")}</h1>

      {/* File drop zone */}
      {step === "idle" && (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-500 transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-64 mx-auto rounded-lg shadow"
              />
            ) : file ? (
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="font-medium">{t("protect.upload.hint")}</p>
                <p className="text-sm mt-1">{t("protect.upload.sub")}</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/tiff,audio/mpeg,audio/wav,audio/flac,audio/ogg,audio/aac,video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("protect.author")}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder={t("protect.author.placeholder")}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("protect.level")}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="standard">
                    Standard (Watermark + C2PA)
                  </option>
                  <option value="full">
                    Full (Adversarial + Watermark + C2PA)
                  </option>
                  <option value="watermark_only">Watermark only</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow transition"
              >
                {t("protect.button")}
              </button>
            </div>
          )}
        </>
      )}

      {/* Progress */}
      {(step === "uploading" || step === "processing") && (
        <div className="mt-8 text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-medium">
            {step === "uploading"
              ? t("protect.uploading")
              : t("protect.processing")}
          </p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progressMsg && (
            <p className="text-sm text-gray-500 mt-2">{progressMsg}</p>
          )}
        </div>
      )}

      {/* Result */}
      {step === "done" && result && (
        <div className="mt-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="font-bold text-green-800 text-lg flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("protect.success")}
            </h2>
            <p className="text-sm text-green-700 mt-1">
              {t("protect.layers")} :{" "}
              {result.layers_applied?.join(", ") || "—"}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5 space-y-2 text-sm">
            <Row label="Hash original" value={result.original_hash} />
            <Row label="Hash protege" value={result.protected_hash} />
            <Row label="Token watermark" value={result.watermark_token} />
            <Row label="Manifest ID" value={result.manifest_id} />
            {result.psnr != null && <Row label="PSNR" value={`${result.psnr.toFixed(1)} dB`} />}
            {result.delta_e != null && <Row label="Delta-E" value={result.delta_e.toFixed(2)} />}
            {result.processing_time != null && (
              <Row label="Temps" value={`${result.processing_time.toFixed(1)}s`} />
            )}
          </div>

          {result.qr_code_base64 && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${result.qr_code_base64}`}
                alt="QR verification"
                className="w-32 h-32"
              />
            </div>
          )}

          {result.output_path && (
            <a
              href={getDownloadUrl(result.output_path)}
              download
              className="block text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow transition"
            >
              {t("protect.download")}
            </a>
          )}

          <button
            onClick={reset}
            className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
          >
            {t("protect.again")}
          </button>
        </div>
      )}

      {/* Error */}
      {step === "error" && (
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="font-bold text-red-800">{t("protect.error")}</h2>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={reset}
            className="mt-4 w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
          >
            {t("protect.retry")}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-mono text-xs truncate text-right">{value}</span>
    </div>
  );
}
