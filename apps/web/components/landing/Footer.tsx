import Link from "next/link";
import { Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  const sections = [
    {
      heading: t("product"),
      links: [
        { href: "/#features", label: t("features") },
        { href: "/verify", label: t("verify") },
        { href: "/docs", label: t("docs") },
      ],
    },
    {
      heading: t("developers"),
      links: [
        { href: "/docs#api", label: t("apiRef") },
        { href: "/docs#sdk-js", label: t("sdkJs") },
        { href: "/docs#sdk-py", label: t("sdkPy") },
        { href: "/docs#webhooks", label: t("webhooks") },
      ],
    },
    {
      heading: t("enterprise"),
      links: [
        { href: "/enterprise", label: t("enterpriseLink") },
        { href: "/earn",       label: t("affiliate") },
        { href: "mailto:enterprise@iron-id.io", label: t("contact") },
      ],
    },
  ];

  return (
    <footer className="border-t border-iron-border bg-iron-slate/10 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-iron-gold" />
              <span className="font-bold text-iron-white">
                Iron<span className="text-gradient-gold">ID</span>
              </span>
            </div>
            <p className="text-xs text-iron-white/35 leading-relaxed max-w-[200px]">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {sections.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-iron-white/50 uppercase tracking-wider mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-iron-white/35 hover:text-iron-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-iron-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-iron-white/25">
            © {new Date().getFullYear()} IronID. {t("copyright")}
          </p>
          <div className="flex items-center gap-5 text-xs text-iron-white/25">
            <Link href="/privacy" className="hover:text-iron-white/50 transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-iron-white/50 transition-colors">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
