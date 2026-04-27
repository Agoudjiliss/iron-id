import type { Metadata } from "next";
import { NavServer } from "@/components/landing/NavServer";
import { Footer }    from "@/components/landing/Footer";
import { AffiliateCalculator } from "@/components/landing/AffiliateCalculator";
import {
  Shield,
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Wallet,
  BarChart3,
  Clock,
  Infinity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programme affilié — Gagnez jusqu'à 20% avec IronID",
  description:
    "Recommandez IronID et gagnez jusqu'à 20% de commission récurrente sur chaque abonnement. Inscription 100% gratuite, paiements PayPal automatiques, cookie 90 jours.",
  alternates: { canonical: "https://www.iron-id.io/earn" },
  openGraph: {
    title:       "Programme affilié IronID — 10 à 20% de commission récurrente",
    description: "Partagez votre lien, touchez jusqu'à 20% chaque mois tant que vos filleuls restent abonnés. Gratuit, sans carte bancaire.",
    url:         "https://www.iron-id.io/earn",
    type:        "website",
  },
};

// ─── Tier data ───────────────────────────────────────────────────────────────
const TIERS = [
  {
    name: "Iron",
    rate: "10%",
    referrals: "0 – 5",
    textColor: "text-zinc-300",
    glowColor: "shadow-[0_0_30px_rgba(113,113,122,0.15)]",
    borderColor: "border-zinc-700/40",
    bgColor: "bg-zinc-900/60",
    barColor: "bg-zinc-500",
    example: "$2.90",
  },
  {
    name: "Silver",
    rate: "12%",
    referrals: "6 – 20",
    textColor: "text-slate-200",
    glowColor: "shadow-[0_0_30px_rgba(148,163,184,0.1)]",
    borderColor: "border-slate-500/30",
    bgColor: "bg-slate-800/40",
    barColor: "bg-slate-400",
    example: "$3.48",
  },
  {
    name: "Gold",
    rate: "15%",
    referrals: "21 – 49",
    textColor: "text-amber-300",
    glowColor: "shadow-[0_0_40px_rgba(217,119,6,0.2)]",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-950/30",
    barColor: "bg-amber-400",
    highlight: true,
    example: "$4.35",
  },
  {
    name: "Platinum",
    rate: "20%",
    referrals: "50+",
    textColor: "text-emerald-300",
    glowColor: "shadow-[0_0_50px_rgba(16,185,129,0.25)]",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-950/30",
    barColor: "bg-emerald-400",
    example: "$5.80",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Shield,
    title: "Créez un compte gratuit",
    body: "Zéro carte bancaire. Votre code affilié est généré instantanément dans le dashboard.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    n: "02",
    icon: Link2,
    title: "Partagez votre lien",
    body: "YouTube, Twitter, LinkedIn, blog — collez votre lien unique partout où votre audience est.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    n: "03",
    icon: Users,
    title: "Vos filleuls s'inscrivent",
    body: "Le cookie dure 90 jours. Vous êtes crédité même s'ils reviennent plus tard.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    n: "04",
    icon: Wallet,
    title: "Encaissez chaque mois",
    body: "PayPal automatique J+30. Récurrent — vous êtes payé tant que vos filleuls restent abonnés.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function EarnPage() {
  return (
    <>
      <NavServer />

      <main className="bg-[#050510] text-iron-white min-h-screen overflow-hidden">

        {/* ── Ambient orbs ── */}
        <div aria-hidden className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[130px]" />
          <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/6 blur-[100px]" />
        </div>

        {/* ── Dot grid overlay ── */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10">

          {/* ── Ticker bar ── */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 overflow-hidden py-2">
            <div className="flex gap-10 animate-marquee w-max text-xs font-mono text-emerald-400/70 uppercase tracking-widest">
              {Array(6).fill([
                "Commission récurrente · 10% → 20%",
                "Cookie 90 jours",
                "Paiement PayPal J+30",
                "Filleuls illimités",
                "Inscription 100% gratuite",
                "Aucune carte bancaire",
              ]).flat().map((t, i) => (
                <span key={i} className="flex-shrink-0">◆ {t}</span>
              ))}
            </div>
          </div>

          {/* ── HERO ── */}
          <section className="pt-28 pb-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                  bg-emerald-500/10 border border-emerald-500/25
                  text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Programme affilié — Actif
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.02] mb-6 tracking-tight">
                Gagnez de l'argent
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #34d399 0%, #10b981 40%, #6ee7b7 100%)",
                  }}
                >
                  sans rien payer.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
                Recommandez IronID. Touchez{" "}
                <span className="text-emerald-400 font-semibold">jusqu'à 20% de commission récurrente</span>{" "}
                chaque mois — tant que vos filleuls restent clients.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/sign-up"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold
                    bg-emerald-500 text-white hover:bg-emerald-400 transition-all
                    shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]
                    hover:scale-[1.02]"
                >
                  Obtenir mon lien affilié
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium
                    bg-white/5 border border-white/10 text-white/60 hover:text-white
                    hover:border-emerald-500/30 hover:bg-white/8 transition-colors"
                >
                  Comment ça marche
                </a>
              </div>

              {/* Trust pills */}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {[
                  { icon: CheckCircle, label: "Gratuit pour toujours" },
                  { icon: Clock,       label: "Cookie 90 jours" },
                  { icon: Wallet,      label: "PayPal automatique" },
                  { icon: Infinity,    label: "Filleuls illimités" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-white/4 border border-white/8 text-xs text-white/40"
                  >
                    <Icon size={11} className="text-emerald-400" /> {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── LIVE STATS BAND ── */}
          <section className="px-6 pb-20">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-1">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
                  {[
                    { icon: BarChart3,  value: "20%",  label: "Commission max",    sub: "palier Platinum" },
                    { icon: Clock,      value: "90j",   label: "Durée du cookie",  sub: "attribution garantie" },
                    { icon: DollarSign, value: "J+30",  label: "Délai paiement",   sub: "anti-fraude" },
                    { icon: TrendingUp, value: "∞",     label: "Filleuls",         sub: "aucune limite" },
                  ].map(({ icon: Icon, value, label, sub }) => (
                    <div key={label} className="flex flex-col items-center justify-center py-7 px-4 text-center">
                      <Icon size={15} className="text-emerald-400/60 mb-3" />
                      <p className="text-3xl font-black text-white tabular-nums mb-0.5">{value}</p>
                      <p className="text-[11px] text-white/50 font-medium">{label}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="px-6 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">Fonctionnement</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  4 étapes,{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#34d399,#10b981)" }}
                  >
                    c'est tout.
                  </span>
                </h2>
                <p className="text-white/35 max-w-lg mx-auto text-sm">
                  Pas de seuil minimum, pas de conditions absurdes. Votre lien est prêt dès votre inscription.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STEPS.map((step) => (
                  <div
                    key={step.n}
                    className="group relative rounded-2xl bg-white/3 border border-white/8
                      hover:border-white/15 p-6 flex gap-5 transition-all duration-300
                      hover:bg-white/5"
                  >
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${step.bg}`}
                    >
                      <step.icon size={18} className={step.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-white/20 mb-1">{step.n}</p>
                      <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{step.body}</p>
                    </div>
                    <span className="absolute top-4 right-4 text-[10px] font-mono text-white/10">
                      {step.n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMISSION TIERS ── */}
          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">Paliers de commission</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Plus vous apportez,{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#34d399,#10b981)" }}
                  >
                    plus vous gagnez.
                  </span>
                </h2>
                <p className="text-white/35 max-w-lg mx-auto text-sm">
                  Votre taux monte automatiquement avec le nombre de filleuls actifs.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {TIERS.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border p-6 flex flex-col items-center text-center gap-2
                      backdrop-blur-sm transition-all duration-300
                      ${tier.bgColor} ${tier.borderColor} ${tier.glowColor}
                      ${tier.highlight ? "scale-[1.04] z-10" : "hover:scale-[1.02]"}`}
                  >
                    {tier.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full
                          text-[9px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                        Populaire
                      </span>
                    )}

                    {/* Tier name */}
                    <p className={`text-xs font-bold uppercase tracking-widest ${tier.textColor}`}>
                      {tier.name}
                    </p>

                    {/* Rate */}
                    <p className={`text-5xl font-black ${tier.textColor} leading-none`}>
                      {tier.rate}
                    </p>

                    {/* Referral range */}
                    <p className="text-[11px] text-white/35">{tier.referrals} filleuls actifs</p>

                    {/* Progress bar visual */}
                    <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tier.barColor}`}
                        style={{ width: `${25 * (i + 1)}%` }}
                      />
                    </div>

                    <div className="mt-2 pt-3 border-t border-white/8 w-full">
                      <p className="text-[10px] text-white/25 mb-0.5">Individual / filleul / mois</p>
                      <p className={`text-base font-bold ${tier.textColor}`}>{tier.example}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-white/20 mt-6">
                Commissions calculées sur le montant HT. Plans Studio ($199) et Enterprise offrent des gains jusqu'à 3× plus élevés.
              </p>
            </div>
          </section>

          {/* ── CALCULATOR ── */}
          <section className="px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">Simulateur</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Combien pouvez-vous{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#34d399,#10b981)" }}
                  >
                    gagner ?
                  </span>
                </h2>
                <p className="text-white/35 text-sm">
                  Simulez vos revenus selon le nombre de filleuls et le plan souscrit.
                </p>
              </div>
              <AffiliateCalculator />
            </div>
          </section>

          {/* ── WHY IRONID ── */}
          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">Pourquoi nous ?</p>
                <h2 className="text-3xl font-black">
                  Promouvoir{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#34d399,#10b981)" }}
                  >
                    IronID
                  </span>
                  , c'est miser juste.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: TrendingUp,
                    title: "Commission récurrente",
                    body: "Vous êtes payé chaque mois tant que votre filleul reste abonné — pas une seule fois, tous les mois.",
                    color: "text-emerald-400",
                    glow: "bg-emerald-500/10 border-emerald-500/20",
                  },
                  {
                    icon: Zap,
                    title: "Marché en explosion",
                    body: "La certification C2PA devient incontournable post-IA. La demande augmente chaque jour dans la presse, le juridique, les médias.",
                    color: "text-violet-400",
                    glow: "bg-violet-500/10 border-violet-500/20",
                  },
                  {
                    icon: Shield,
                    title: "Produit crédible",
                    body: "IronID résout un vrai problème. Facile à expliquer à n'importe quelle audience — tech ou non.",
                    color: "text-sky-400",
                    glow: "bg-sky-500/10 border-sky-500/20",
                  },
                ].map(({ icon: Icon, title, body, color, glow }) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-white/3 border border-white/8 p-6 hover:bg-white/5 hover:border-white/15 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${glow}`}>
                      <Icon size={18} className={color} />
                    </div>
                    <h3 className="font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="px-6 py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-center mb-8">Questions fréquentes</h2>
              <div className="space-y-2">
                {[
                  {
                    q: "Dois-je payer pour devenir affilié ?",
                    a: "Non. L'inscription est gratuite et votre code affilié est généré dès que vous créez un compte. Vous pouvez rester sur le plan gratuit et toucher vos commissions.",
                  },
                  {
                    q: "Quand est-ce que je suis payé ?",
                    a: "Les commissions sont versées via PayPal, 30 jours après la transaction (délai anti-fraude). Le paiement est entièrement automatique.",
                  },
                  {
                    q: "Combien de temps dure le cookie ?",
                    a: "90 jours. Si quelqu'un clique sur votre lien aujourd'hui et s'inscrit dans les 3 mois, vous êtes crédité.",
                  },
                  {
                    q: "Est-ce que je gagne sur les renouvellements ?",
                    a: "Oui. La commission est récurrente — vous touchez votre pourcentage chaque mois que votre filleul reste abonné.",
                  },
                  {
                    q: "Y a-t-il un nombre maximum de filleuls ?",
                    a: "Aucune limite. Plus vous en apportez, plus votre taux monte — jusqu'à 20% pour 50+ filleuls actifs.",
                  },
                  {
                    q: "Que se passe-t-il si mon filleul annule ?",
                    a: "La commission s'arrête. Si il se réabonne, elle reprend automatiquement.",
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group rounded-2xl bg-white/3 border border-white/8
                      hover:border-emerald-500/20 overflow-hidden transition-colors"
                  >
                    <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-white/70
                        hover:text-white list-none flex items-center justify-between select-none">
                      {q}
                      <span className="text-white/25 group-open:rotate-180 transition-transform
                          text-lg leading-none flex-shrink-0 ml-3">⌄</span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-white/40 leading-relaxed border-t border-white/6 pt-3">{a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="px-6 py-28">
            <div className="max-w-2xl mx-auto">
              <div
                className="rounded-3xl border border-emerald-500/20 p-10 text-center relative overflow-hidden"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, rgba(5,5,16,0) 70%)",
                }}
              >
                {/* Corner accents */}
                <div aria-hidden className="absolute top-0 left-0 w-20 h-20 border-t border-l border-emerald-500/20 rounded-tl-3xl" />
                <div aria-hidden className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-emerald-500/20 rounded-br-3xl" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                    bg-emerald-500/10 border border-emerald-500/25
                    text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
                  <CheckCircle size={11} /> Gratuit pour toujours
                </div>

                <h2 className="text-4xl sm:text-5xl font-black mb-4">
                  Commencez à gagner{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#34d399,#10b981)" }}
                  >
                    dès aujourd'hui.
                  </span>
                </h2>

                <p className="text-white/35 mb-8 text-base max-w-md mx-auto">
                  Créez votre compte, copiez votre lien, partagez.
                  Vos premières commissions peuvent arriver sous 24h.
                </p>

                <a
                  href="/sign-up"
                  className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold
                    bg-emerald-500 text-white hover:bg-emerald-400 transition-all
                    shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)]
                    hover:scale-[1.02]"
                >
                  Créer mon compte gratuit <ArrowRight size={16} />
                </a>

                <p className="mt-5 text-xs text-white/20">
                  Déjà affilié ?{" "}
                  <a href="/sign-in" className="text-emerald-400/60 hover:text-emerald-400 underline underline-offset-2">
                    Connectez-vous
                  </a>{" "}
                  pour accéder à votre dashboard.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
