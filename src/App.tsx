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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-blue-100 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-brand-700 to-brand-600 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            TrueStamp
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              <NavLink to="/">{t("nav.home")}</NavLink>
              <NavLink to="/protect">{t("nav.protect")}</NavLink>
              <NavLink to="/verify">{t("nav.verify")}</NavLink>
            </nav>
            <div className="flex gap-1 bg-white/10 rounded-full px-1 py-0.5 text-xs">
              {(["fr", "en", "ar"] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === code ? "bg-white text-brand-700 font-semibold" : "text-blue-100"
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

      <footer className="bg-gray-100 border-t text-center text-sm text-gray-500 py-4">
        {t("footer.text")} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
