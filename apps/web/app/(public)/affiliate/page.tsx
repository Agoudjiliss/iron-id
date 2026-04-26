import type { Metadata } from "next";
import { Nav }    from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
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
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programme affilié — IronID",
  description:
    "Gagnez jusqu'à 20% de commission sur chaque abonnement que vous apportez à IronID. Sans rien payer. Paiements PayPal automatiques.",
};

// ---- Tier data ----
const TIERS = [
  {
    name: "Iron",
    rate: "10%",
    referrals: "0 – 5",
    color: "text-iron-white/50",
    bg: "bg-iron-border/40",
    border: "border-iron-border",
    example: "2,90",
  },
  {
    name: "Silver",
    rate: "12%",
    referrals: "6 – 20",
    color: "text-slate-300",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    example: "3,48",
  },
  {
    name: "Gold",
    rate: "15%",
    referrals: "21 – 49",
    color: "text-iron-gold",
    bg: "bg-iron-gold/10",
    border: "border-iron-gold/30",
    example: "4,35",
    highlight: true,
  },
  {
    name: "Platinum",
    rate: "20%",
    referrals: "50+",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    example: "5,80",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Shield,
    title: "Créez un compte gratuit",
    body: "Inscrivez-vous sur IronID. C'est gratuit, aucune carte bancaire requise. Votre code affilié est généré instantanément dans le dashboard.",
  },
  {
    n: "02",
    icon: Link2,
    title: "Partagez votre lien",
    body: "Copiez votre lien unique depuis la page Affiliation. Partagez-le sur YouTube, Twitter, LinkedIn, votre blog — partout où votre audience est.",
  },
  {
    n: "03",
    icon: Users,
    title: "Vos filleuls s'inscrivent",
    body: "Quand quelqu'un clique sur votre lien et crée un compte, il est attribué à votre code. Le cookie dure 90 jours — vous êtes crédité même s'il revient plus tard.",
  },
  {
    n: "04",
    icon: DollarSign,
    title: "Encaissez vos commissions",
    body: "Dès qu'un filleul souscrit un plan payant, vous gagnez une commission. Paiement automatique via PayPal chaque mois, 30 jours après la transaction.",
  },
];

// ---- Page ----

export default function AffiliateLandingPage() {
  return (
    <>
      <Nav />

      <main className="bg-iron-black text-iron-white min-h-screen">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-iron-gold/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">

          {/* ── HERO ── */}
          <section className="pt-32 pb-24 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-iron-gold/10 border border-iron-gold/20 text-iron-gold text-xs font-semibold uppercase tracking-widest mb-6">
                <Star size={11} /> Programme affilié
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
                Gagnez de l'argent{" "}
                <br className="hidden sm:block" />
                <span className="text-gradient-gold">sans rien payer.</span>
              </h1>

              <p className="text-xl text-iron-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                Recommandez IronID à votre audience et touchez jusqu'à{" "}
                <strong className="text-iron-white">20% de commission récurrente</strong>{" "}
                sur chaque abonnement — chaque mois, tant que vos filleuls restent clients.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-iron-gold text-iron-black hover:bg-iron-gold/90 transition-all hover:scale-[1.02] shadow-gold"
                >
                  Obtenir mon lien affilié <ArrowRight size={16} />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium bg-iron-slate border border-iron-border text-iron-white/70 hover:text-iron-white hover:border-iron-gold/30 transition-colors"
                >
                  Comment ça marche
                </a>
              </div>

              {/* Trust bullets */}
              <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-iron-white/35">
                {[
                  "Inscription gratuite",
                  "Aucune carte bancaire",
                  "Paiements PayPal automatiques",
                  "Cookie 90 jours",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-iron-green" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── STATS BANNER ── */}
          <section className="px-6 pb-20">
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "10–20%", label: "Commission récurrente" },
                { value: "90j",    label: "Durée du cookie" },
                { value: "J+30",   label: "Délai de paiement" },
                { value: "∞",      label: "Filleuls possibles" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-iron-slate border border-iron-border p-5 text-center"
                >
                  <p className="text-3xl font-black text-gradient-gold mb-1">{value}</p>
                  <p className="text-xs text-iron-white/40">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="px-6 py-20 border-t border-iron-border/30">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  4 étapes, <span className="text-gradient-gold">c'est tout.</span>
                </h2>
                <p className="text-iron-white/40 max-w-lg mx-auto">
                  Pas de conditions compliquées. Pas de seuil minimum pour recevoir un lien.
                  Votre code est prêt dès votre inscription.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {STEPS.map((step) => (
                  <div
                    key={step.n}
                    className="rounded-2xl bg-iron-slate border border-iron-border p-6 flex gap-5 hover:border-iron-gold/20 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-iron-gold/10 border border-iron-gold/20 flex items-center justify-center">
                        <step.icon size={18} className="text-iron-gold" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-iron-gold/50 mb-1">{step.n}</p>
                      <h3 className="text-sm font-bold text-iron-white mb-2">{step.title}</h3>
                      <p className="text-sm text-iron-white/45 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMISSION TIERS ── */}
          <section className="px-6 py-20 border-t border-iron-border/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Plus vous apportez,{" "}
                  <span className="text-gradient-gold">plus vous gagnez.</span>
                </h2>
                <p className="text-iron-white/40 max-w-lg mx-auto">
                  Votre taux de commission augmente automatiquement avec le nombre de filleuls
                  actifs (ceux qui ont un abonnement payant).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border p-6 text-center flex flex-col gap-3 ${tier.bg} ${tier.border} ${
                      tier.highlight ? "ring-1 ring-iron-gold/30 shadow-gold" : ""
                    }`}
                  >
                    {tier.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-iron-gold text-iron-black uppercase tracking-wider">
                        Populaire
                      </span>
                    )}
                    <p className={`text-lg font-black ${tier.color}`}>{tier.name}</p>
                    <p className="text-4xl font-black text-iron-white">{tier.rate}</p>
                    <p className="text-xs text-iron-white/40">
                      {tier.referrals} filleuls actifs
                    </p>
                    <div className="mt-2 pt-3 border-t border-iron-border/50">
                      <p className="text-xs text-iron-white/30">Individual Monthly</p>
                      <p className={`text-lg font-bold mt-0.5 ${tier.color}`}>
                        ${tier.example}
                        <span className="text-xs font-normal text-iron-white/30"> / filleul / mois</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-iron-white/25 mt-6">
                Commissions calculées sur le montant HT de chaque paiement. Plans Studio et Enterprise offrent des gains encore plus élevés.
              </p>
            </div>
          </section>

          {/* ── CALCULATOR ── */}
          <section className="px-6 py-20 border-t border-iron-border/30">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Combien pouvez-vous{" "}
                  <span className="text-gradient-gold">gagner ?</span>
                </h2>
                <p className="text-iron-white/40">
                  Simulez vos revenus selon le nombre de filleuls et le plan souscrit.
                </p>
              </div>
              <AffiliateCalculator />
            </div>
          </section>

          {/* ── WHY IRONID ── */}
          <section className="px-6 py-20 border-t border-iron-border/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-3">
                  Pourquoi promouvoir <span className="text-gradient-gold">IronID</span> ?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: TrendingUp,
                    title: "Commission récurrente",
                    body: "Vous êtes payé chaque mois tant que votre filleul reste abonné. Pas une seule fois — tous les mois.",
                  },
                  {
                    icon: Zap,
                    title: "Marché en pleine explosion",
                    body: "La certification C2PA devient obligatoire dans la presse, les médias et les entreprises post-IA. La demande augmente chaque jour.",
                  },
                  {
                    icon: Shield,
                    title: "Produit crédible à vendre",
                    body: "IronID résout un vrai problème — prouver l'authenticité d'un fichier. Facile à expliquer, facile à recommander.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-iron-slate border border-iron-border p-6"
                  >
                    <div className="w-9 h-9 rounded-xl bg-iron-gold/10 flex items-center justify-center mb-4">
                      <Icon size={17} className="text-iron-gold" />
                    </div>
                    <h3 className="font-bold text-iron-white mb-2">{title}</h3>
                    <p className="text-sm text-iron-white/45 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="px-6 py-20 border-t border-iron-border/30">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-center mb-8">Questions fréquentes</h2>
              <div className="space-y-3">
                {[
                  {
                    q: "Dois-je payer pour devenir affilié ?",
                    a: "Non. L'inscription est gratuite et votre code affilié est généré dès que vous créez un compte. Vous pouvez rester sur le plan gratuit indéfiniment et quand même toucher vos commissions.",
                  },
                  {
                    q: "Quand est-ce que je suis payé ?",
                    a: "Les commissions sont versées via PayPal, 30 jours après la transaction du filleul (délai anti-fraude). Une fois ce délai passé, le paiement est automatique.",
                  },
                  {
                    q: "Combien de temps dure le cookie ?",
                    a: "90 jours. Si quelqu'un clique sur votre lien aujourd'hui et s'inscrit dans les 3 mois, vous êtes crédité.",
                  },
                  {
                    q: "Est-ce que je gagne une commission sur les renouvellements ?",
                    a: "Oui. La commission est récurrente — vous touchez votre pourcentage chaque mois que votre filleul reste abonné, pas seulement lors du premier paiement.",
                  },
                  {
                    q: "Y a-t-il un nombre maximum de filleuls ?",
                    a: "Aucune limite. Plus vous apportez de filleuls actifs, plus votre taux augmente — jusqu'à 20% pour 50+ filleuls (palier Platinum).",
                  },
                  {
                    q: "Que se passe-t-il si mon filleul annule son abonnement ?",
                    a: "La commission s'arrête. Il n'est plus considéré comme un filleul actif pour le calcul de votre palier. Si il se réabonne, les commissions reprennent.",
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden group"
                  >
                    <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-iron-white/80 hover:text-iron-white list-none flex items-center justify-between select-none">
                      {q}
                      <span className="text-iron-white/30 group-open:rotate-180 transition-transform text-lg leading-none flex-shrink-0 ml-3">
                        ⌄
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-iron-white/50 leading-relaxed">{a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="px-6 py-24 border-t border-iron-border/30">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-iron-gold/10 border border-iron-gold/20 text-iron-gold text-xs font-semibold uppercase tracking-widest mb-6">
                <CheckCircle size={11} /> Gratuit pour toujours
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Commencez à gagner{" "}
                <span className="text-gradient-gold">dès aujourd'hui.</span>
              </h2>
              <p className="text-iron-white/40 mb-8 text-lg">
                Créez votre compte, copiez votre lien, partagez.
                Vos premières commissions peuvent arriver dans les prochaines 24h.
              </p>
              <a
                href="/sign-up"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold bg-iron-gold text-iron-black hover:bg-iron-gold/90 transition-all hover:scale-[1.02] shadow-gold"
              >
                Créer mon compte gratuit <ArrowRight size={16} />
              </a>
              <p className="mt-4 text-xs text-iron-white/25">
                Déjà affilié ?{" "}
                <a href="/sign-in" className="text-iron-gold/60 hover:text-iron-gold underline-offset-2 underline">
                  Connectez-vous
                </a>{" "}
                pour accéder à votre dashboard.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
