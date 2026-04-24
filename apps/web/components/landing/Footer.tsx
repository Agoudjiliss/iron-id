import Link from "next/link";
import { Shield } from "lucide-react";

const LINKS = {
  Produit: [
    { href: "/#features",   label: "Fonctionnalités" },
    { href: "/pricing",     label: "Tarifs"           },
    { href: "/verify",      label: "Vérifier un fichier" },
    { href: "/docs",        label: "Documentation"    },
  ],
  Développeurs: [
    { href: "/docs#api",    label: "Référence API"    },
    { href: "/docs#sdk-js", label: "SDK JavaScript"   },
    { href: "/docs#sdk-py", label: "SDK Python"       },
    { href: "/docs#webhooks", label: "Webhooks"       },
  ],
  Entreprise: [
    { href: "/affiliate",   label: "Programme affilié" },
    { href: "/pricing#enterprise", label: "Enterprise" },
    { href: "mailto:hello@ironid.io", label: "Contact" },
  ],
};

export function Footer() {
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
              Le standard de référence pour l'authenticité numérique. C2PA-signé, immuable, vérifiable.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-iron-white/50 uppercase tracking-wider mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ href, label }) => (
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
            © {new Date().getFullYear()} IronID. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5 text-xs text-iron-white/25">
            <Link href="/privacy" className="hover:text-iron-white/50 transition-colors">Confidentialité</Link>
            <Link href="/terms"   className="hover:text-iron-white/50 transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
