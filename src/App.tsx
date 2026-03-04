import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProtectPage from "./pages/ProtectPage";
import VerifyPage from "./pages/VerifyPage";
import { useI18n } from "./i18n";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-button text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-brand-500/12 text-brand-700"
          : "text-ink-muted hover:text-ink hover:bg-slate-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-surface-elevated/95 backdrop-blur-sm border-b border-slate-200/80 shadow-header">
        <div className="max-w-content mx-auto px-page py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink font-bold text-lg tracking-tight hover:text-brand-600 transition-colors"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-button bg-brand-500 text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            iron-id
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-0.5" aria-label="Navigation principale">
              <NavLink to="/">{t("nav.home")}</NavLink>
              <NavLink to="/protect">{t("nav.protect")}</NavLink>
              <NavLink to="/verify">{t("nav.verify")}</NavLink>
            </nav>
            <div className="w-px h-6 bg-slate-200" aria-hidden />
            <div className="flex gap-0.5 rounded-full bg-slate-100 p-0.5" role="group" aria-label="Langue">
              {(["fr", "en", "ar"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`min-w-[2.25rem] px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    lang === code
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t(`lang.${code}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/protect" element={<ProtectPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-surface-elevated py-6">
        <div className="max-w-content mx-auto px-page text-center">
          <p className="text-sm text-ink-muted">
            {t("footer.text")} · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
