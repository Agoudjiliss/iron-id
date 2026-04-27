import {
  Shield,
  Lock,
  Zap,
  Globe,
  Code2,
  BarChart2,
  RefreshCw,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const ICONS = [Shield, Lock, Zap, Code2, Globe, BarChart2, RefreshCw, Users];

export async function Features() {
  const t = await getTranslations("features");

  const items = (["0", "1", "2", "3", "4", "5", "6", "7"] as const).map(
    (i, idx) => ({
      icon: ICONS[idx],
      title: t(`items.${i}.title`),
      desc: t(`items.${i}.desc`),
    }),
  );

  return (
    <section id="features" className="py-24 px-6 bg-iron-slate/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-iron-gold uppercase tracking-widest mb-3">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-iron-white">
            {t("headline1")}
            <br />
            {t("headline2")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-iron-slate border border-iron-border rounded-2xl p-5 hover:border-iron-gold/20 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-iron-gold/10 flex items-center justify-center mb-4 group-hover:bg-iron-gold/15 transition-colors">
                <Icon size={16} className="text-iron-gold" />
              </div>
              <h3 className="text-sm font-semibold text-iron-white mb-2">{title}</h3>
              <p className="text-xs text-iron-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
