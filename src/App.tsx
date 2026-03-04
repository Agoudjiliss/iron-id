import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProtectPage from "./pages/ProtectPage";
import VerifyPage from "./pages/VerifyPage";
import { useI18n } from "./i18n";

function NavLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`rounded-button text-sm font-medium transition-colors duration-150 min-h-touch inline-flex items-center justify-center ${
        active
          ? "bg-brand-500/12 text-brand-700"
          : "text-ink-muted hover:text-ink hover:bg-slate-100"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header: compact sur mobile */}
      <header
        className="sticky top-0 z-50 bg-surface-elevated/95 backdrop-blur-sm border-b border-slate-200/80 shadow-header"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)" }}
      >
        <div className="max-w-content mx-auto px-page py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink font-bold text-lg tracking-tight hover:text-brand-600 transition-colors min-h-touch items-center"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-button bg-brand-500 text-white shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span className="hidden sm:inline">iron-id</span>
          </Link>
          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-0.5" aria-label="Navigation principale">
              <NavLink to="/" className="px-3 py-2">{t("nav.home")}</NavLink>
              <NavLink to="/protect" className="px-3 py-2">{t("nav.protect")}</NavLink>
              <NavLink to="/verify" className="px-3 py-2">{t("nav.verify")}</NavLink>
            </nav>
            <div className="w-px h-6 bg-slate-200" aria-hidden />
            <div className="flex gap-0.5 rounded-full bg-slate-100 p-0.5" role="group" aria-label="Langue">
              {(["fr", "en", "ar"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`min-w-[2.25rem] min-h-touch px-2 rounded-full text-xs font-medium transition-colors ${
                    lang === code ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t(`lang.${code}`)}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile: uniquement sélecteur de langue */}
          <div className="flex md:hidden gap-0.5 rounded-full bg-slate-100 p-0.5" role="group" aria-label="Langue">
            {(["fr", "en", "ar"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`min-w-[2.25rem] min-h-touch px-2 rounded-full text-xs font-medium transition-colors ${
                  lang === code ? "bg-white text-ink shadow-sm" : "text-ink-muted"
                }`}
              >
                {t(`lang.${code}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/protect" element={<ProtectPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </main>

      {/* Bottom navigation (mobile / PWA) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-elevated border-t border-slate-200 safe-bottom"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
          paddingLeft: "env(safe-area-inset-left, 0)",
          paddingRight: "env(safe-area-inset-right, 0)",
        }}
        aria-label="Navigation mobile"
      >
        <div className="flex items-center justify-around h-14 max-w-content mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${
              pathname === "/" ? "text-brand-600" : "text-ink-muted"
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs font-medium">{t("nav.home")}</span>
          </Link>
          <Link
            to="/protect"
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${
              pathname === "/protect" ? "text-brand-600" : "text-ink-muted"
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/protect" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-medium">{t("nav.protect")}</span>
          </Link>
          <Link
            to="/verify"
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${
              pathname === "/verify" ? "text-brand-600" : "text-ink-muted"
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/verify" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs font-medium">{t("nav.verify")}</span>
          </Link>
        </div>
      </nav>

      <footer className="hidden md:block border-t border-slate-200 bg-surface-elevated py-6">
        <div className="max-w-content mx-auto px-page text-center">
          <p className="text-sm text-ink-muted">{t("footer.text")} · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
