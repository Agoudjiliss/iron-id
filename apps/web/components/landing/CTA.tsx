import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-iron-slate border border-iron-gold/20 rounded-3xl p-12 text-center overflow-hidden">
          {/* Glow */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-iron-gold/6 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold text-iron-gold uppercase tracking-widest mb-4">
              Commencez dès maintenant
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-iron-white mb-4 leading-tight">
              10 certifications gratuites.
              <br />
              <span className="text-gradient-gold">Sans carte bancaire.</span>
            </h2>
            <p className="text-iron-white/40 mb-8 max-w-md mx-auto">
              Créez un compte, générez votre clé API, certifiez vos premiers fichiers en moins de 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-iron-black bg-iron-gold hover:bg-iron-gold/90 transition-all shadow-lg shadow-iron-gold/25"
              >
                Créer un compte gratuit
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/docs"
                className="text-sm text-iron-white/40 hover:text-iron-white transition-colors"
              >
                Lire la documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
