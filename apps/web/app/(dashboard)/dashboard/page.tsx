import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Upload, Key, Zap, Clock, TrendingUp } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const metadata: Metadata = { title: "Vue d'ensemble" };

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.iron-id.io";

interface DashboardStats {
  totalCertifications: number;
  signaturesUsed: number;
  signaturesLimit: number;
  activeKeys: number;
}

async function getDashboardStats(token: string): Promise<DashboardStats> {
  try {
    const [certRes, subRes, keysRes] = await Promise.all([
      fetch(`${API_URL}/v1/certifications?page_size=1`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 30 },
      }),
      fetch(`${API_URL}/v1/billing/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 30 },
      }),
      fetch(`${API_URL}/v1/keys`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 30 },
      }),
    ]);

    const certs = certRes.ok ? await certRes.json() : { total: 0 };
    const sub = subRes.ok
      ? await subRes.json()
      : { monthly_signatures_used: 0, monthly_signatures_limit: 10 };
    const keys = keysRes.ok ? await keysRes.json() : [];

    return {
      totalCertifications: certs.total ?? 0,
      signaturesUsed: sub.monthly_signatures_used ?? 0,
      signaturesLimit: sub.monthly_signatures_limit ?? 10,
      activeKeys: Array.isArray(keys)
        ? keys.filter((k: { is_active: boolean }) => k.is_active).length
        : 0,
    };
  } catch {
    return { totalCertifications: 0, signaturesUsed: 0, signaturesLimit: 10, activeKeys: 0 };
  }
}

export default async function DashboardPage() {
  const { getToken } = await auth();
  const token = await getToken();

  const data = token
    ? await getDashboardStats(token)
    : { totalCertifications: 0, signaturesUsed: 0, signaturesLimit: 10, activeKeys: 0 };

  const usagePct =
    data.signaturesLimit > 0
      ? Math.round((data.signaturesUsed / data.signaturesLimit) * 100)
      : 0;

  return (
    <>
      <Header
        title="Vue d'ensemble"
        description="Bienvenue sur IronID — The Gold Standard for Digital Truth"
      />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Certifications totales"
            value={data.totalCertifications}
            icon={CheckCircle}
            accent="green"
            subtitle="Depuis la création du compte"
          />
          <StatsCard
            title="Signatures ce mois"
            value={data.signaturesUsed}
            icon={TrendingUp}
            accent="gold"
            subtitle="Utilisées ce mois-ci"
          />
          <StatsCard
            title="Quota mensuel"
            value={`${data.signaturesUsed} / ${data.signaturesLimit === -1 ? "∞" : data.signaturesLimit}`}
            icon={Zap}
            accent={usagePct > 80 ? "red" : usagePct > 60 ? "gold" : "blue"}
            subtitle={`${usagePct}% utilisé`}
          />
          <StatsCard
            title="Clés API actives"
            value={data.activeKeys}
            icon={Key}
            accent="blue"
            subtitle="Clés de production actives"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            href="/certify"
            icon={<Upload size={20} className="text-iron-gold" />}
            title="Certifier un fichier"
            description="Signer cryptographiquement un fichier avec C2PA"
            cta="Commencer →"
            accent="gold"
          />
          <QuickAction
            href="/keys"
            icon={<Key size={20} className="text-iron-blue" />}
            title="Gérer les clés API"
            description="Créer ou révoquer des clés pour vos intégrations"
            cta="Gérer →"
            accent="blue"
          />
        </div>

        {/* Recent certifications placeholder */}
        <div className="rounded-2xl bg-iron-slate border border-iron-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-iron-border">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-iron-white/40" />
              <h2 className="text-sm font-semibold text-iron-white">Certifications récentes</h2>
            </div>
            <a href="/certifications" className="text-xs text-iron-gold hover:text-iron-gold-dim transition-colors">
              Voir tout →
            </a>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle size={32} className="text-iron-border mb-3" />
            {data.totalCertifications === 0 ? (
              <>
                <p className="text-sm text-iron-white/40">Aucune certification pour le moment.</p>
                <a
                  href="/certify"
                  className="mt-3 text-sm text-iron-gold hover:text-iron-gold-dim underline underline-offset-2 transition-colors"
                >
                  Certifier votre premier fichier
                </a>
              </>
            ) : (
              <a
                href="/certifications"
                className="text-sm text-iron-gold hover:text-iron-gold-dim underline underline-offset-2 transition-colors"
              >
                Voir les {data.totalCertifications} certification{data.totalCertifications > 1 ? "s" : ""} →
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  cta,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  accent: "gold" | "blue";
}) {
  const borderHover = accent === "gold" ? "hover:border-iron-gold/30" : "hover:border-iron-blue/30";
  const ctaColor = accent === "gold" ? "text-iron-gold" : "text-iron-blue";

  return (
    <a
      href={href}
      className={`block rounded-2xl bg-iron-slate border border-iron-border p-5 group transition-colors ${borderHover}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-iron-border/50 group-hover:bg-iron-border transition-colors flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-iron-white mb-1">{title}</h3>
          <p className="text-xs text-iron-white/50">{description}</p>
          <span className={`text-xs font-medium mt-2 inline-block ${ctaColor}`}>{cta}</span>
        </div>
      </div>
    </a>
  );
}
