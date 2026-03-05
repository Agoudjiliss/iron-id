import { useState } from "react";
import { submitFeedback } from "../api";
import { useI18n } from "../i18n";

export default function FeedbackPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitFeedback({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("feedback.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-form mx-auto px-page py-6 sm:py-10">
      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
        {t("feedback.title")}
      </h1>
      <p className="text-base md:text-lg text-iron-muted mb-6">
        {t("feedback.subtitle")}
      </p>

      {sent && (
        <div className="card border-emerald-500/30 bg-emerald-500/10 p-5 rounded-2xl mb-6">
          <p className="text-emerald-400 font-medium">{t("feedback.success")}</p>
        </div>
      )}

      {error && (
        <div className="card border-red-500/30 bg-red-500/10 p-5 rounded-2xl mb-6">
          <p className="text-red-300/90 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 sm:p-6 space-y-4 rounded-2xl">
        <div>
          <label htmlFor="feedback-name" className="block text-sm font-medium text-white mb-1">
            {t("feedback.name")}
          </label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("feedback.name.placeholder")}
            className="input-base"
            required
            maxLength={200}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="feedback-email" className="block text-sm font-medium text-white mb-1">
            {t("feedback.email")}
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("feedback.email.placeholder")}
            className="input-base"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="feedback-message" className="block text-sm font-medium text-white mb-1">
            {t("feedback.message")}
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedback.message.placeholder")}
            className="input-base min-h-[120px] resize-y"
            required
            maxLength={2000}
            rows={5}
            disabled={loading}
          />
          <p className="text-xs text-iron-muted mt-1">{message.length}/2000</p>
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? t("feedback.sending") : t("feedback.submit")}
        </button>
      </form>
    </div>
  );
}
