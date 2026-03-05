import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import HomePage from "./pages/HomePage";
import ProtectPage from "./pages/ProtectPage";
import VerifyPage from "./pages/VerifyPage";
import FeedbackPage from "./pages/FeedbackPage";
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
      className={`rounded-lg text-sm font-medium transition-all duration-200 min-h-touch inline-flex items-center justify-center px-3 py-2 ${
        active
          ? "bg-iron-primary/20 text-iron-primary"
          : "text-iron-muted hover:text-white hover:bg-white/5"
      } ${className}`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="touch-target rounded-lg text-iron-muted hover:text-white transition-colors"
      aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {dark ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useLocation();
  const [dark, setDarkState] = useState(true);

  const setDarkMode = (value: boolean) => {
    setDarkState(value);
    const root = document.documentElement;
    if (value) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#05070A");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#f8fafc");
    }
  };

  const toggleDark = () => setDarkMode(!dark);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkState(isDark);
  }, []);

  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-iron-bg">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isHome ? "bg-iron-bg/80 backdrop-blur-xl border-b border-white/5" : "bg-iron-surface/95 backdrop-blur-xl border-b border-white/10"
        }`}
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)" }}
      >
        <div className="max-w-content mx-auto px-page py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-display font-bold text-lg tracking-tight hover:text-iron-primary transition-colors min-h-touch items-center"
            aria-label="Iron-ID - Accueil"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-iron-primary text-white shrink-0 shadow-lg shadow-iron-primary/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span className="hidden sm:inline">Iron-ID</span>
          </Link>

          <div className="flex items-center gap-2">
            <DarkToggle dark={dark} onToggle={toggleDark} />

            <div className="hidden md:flex items-center gap-2">
              <nav className="flex items-center gap-0.5" aria-label="Navigation principale">
                <NavLink to="/">{t("nav.home")}</NavLink>
                <NavLink to="/protect">{t("nav.protect")}</NavLink>
                <NavLink to="/verify">{t("nav.verify")}</NavLink>
                <NavLink to="/feedback">{t("nav.feedback")}</NavLink>
              </nav>
              <div className="w-px h-6 bg-white/10" aria-hidden />
              <div className="flex gap-0.5 rounded-lg bg-white/5 p-0.5" role="group" aria-label="Langue">
                {(["fr", "en", "ar"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`min-w-[2.25rem] min-h-touch px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                      lang === code ? "bg-white/10 text-white" : "text-iron-muted hover:text-white"
                    }`}
                  >
                    {t(`lang.${code}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <label className="sr-only" htmlFor="lang-select">
                Langue
              </label>
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as "fr" | "en" | "ar")}
                className="input-base py-2 px-3 text-sm min-h-[40px] w-auto bg-white/5 border-white/10"
                aria-label="Sélectionner la langue"
              >
                <option value="fr">{t("lang.fr")}</option>
                <option value="en">{t("lang.en")}</option>
                <option value="ar">{t("lang.ar")}</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/protect" element={<ProtectPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-iron-surface/95 backdrop-blur-xl border-t border-white/10 safe-bottom"
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
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${pathname === "/" ? "text-iron-primary" : "text-iron-muted"}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/" ? 2.5 : 1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs font-medium">{t("nav.home")}</span>
          </Link>
          <Link
            to="/protect"
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${pathname === "/protect" ? "text-iron-primary" : "text-iron-muted"}`}
            aria-current={pathname === "/protect" ? "page" : undefined}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/protect" ? 2.5 : 1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-medium">{t("nav.protect")}</span>
          </Link>
          <Link
            to="/verify"
            className={`flex flex-col items-center justify-center flex-1 min-h-touch py-2 gap-0.5 ${pathname === "/verify" ? "text-iron-primary" : "text-iron-muted"}`}
            aria-current={pathname === "/verify" ? "page" : undefined}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/verify" ? 2.5 : 1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs font-medium">{t("nav.verify")}</span>
          </Link>
        </div>
      </nav>

      <footer className="hidden md:block border-t border-white/5 py-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-content mx-auto px-page flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <p className="text-sm text-iron-muted">{t("footer.text")} · © {new Date().getFullYear()}</p>
          <Link to="/feedback" className="text-sm text-iron-primary hover:text-iron-secondary font-medium transition-colors">
            {t("nav.feedback")}
          </Link>
        </div>
      </footer>

      <Analytics />
    </div>
  );
}
