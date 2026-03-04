import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        {t("home.title")}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
        {t("home.subtitle")}
      </p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        <Link
          to="/protect"
          className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-brand-500 transition"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
            <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">{t("home.protect.cta")}</span>
          <span className="text-sm text-gray-500">{t("home.protect.desc")}</span>
        </Link>

        <Link
          to="/verify"
          className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-brand-500 transition"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">{t("home.verify.cta")}</span>
          <span className="text-sm text-gray-500">{t("home.verify.desc")}</span>
        </Link>
      </div>

      <div className="mt-16 grid sm:grid-cols-3 gap-6 text-left">
        {[
          {
            title: "C2PA / Content Credentials",
            desc: "Signature cryptographique embarquee dans l'image, verifiable sur contentcredentials.org.",
            icon: "🔐",
          },
          {
            title: "Watermark frequentiel",
            desc: "DCT invisible et robuste a la recompression JPEG et aux reseaux sociaux.",
            icon: "💧",
          },
          {
            title: "Protection anti-IA",
            desc: "Perturbations adversariales qui empechent l'inpainting et la modification par IA.",
            icon: "🛡️",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
