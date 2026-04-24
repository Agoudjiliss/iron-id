import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shield, ShieldCheck, ShieldX, Clock, FileText, Hash, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HashBadge } from "@/components/ui/HashBadge";
import { formatDate } from "@/lib/utils";

interface Props {
  params: { hash: string };
}

// Server-side fetch from FastAPI (bypasses Next.js proxy for SSR)
async function fetchVerification(hash: string) {
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const res = await fetch(`${apiUrl}/v1/verify/${hash}`, {
    next: { revalidate: 60 }, // cache for 60s, revalidate on request
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hash = params.hash.toLowerCase();

  if (hash.length !== 64 || !/^[0-9a-f]+$/.test(hash)) {
    return { title: "Hash invalide" };
  }

  const data = await fetchVerification(hash);

  if (!data) {
    return { title: "Vérification impossible" };
  }

  const status = data.is_certified ? "Certifié ✓" : "Non certifié";
  const title = data.file_name
    ? `${data.file_name} — ${status}`
    : `${hash.slice(0, 16)}... — ${status}`;

  return {
    title,
    description: data.is_certified
      ? `Ce fichier a été certifié par IronID le ${new Date(data.certified_at).toLocaleDateString("fr-FR")}.`
      : "Ce fichier n'est pas associé à une certification IronID.",
  };
}

export default async function VerifyHashPage({ params }: Props) {
  const hash = params.hash.toLowerCase();

  // Validate hash format
  if (hash.length !== 64 || !/^[0-9a-f]+$/.test(hash)) {
    notFound();
  }

  const data = await fetchVerification(hash);

  if (!data) {
    return <ErrorView message="Impossible de contacter le serveur de vérification." />;
  }

  const certified = data.is_certified;

  return (
    <main className="min-h-screen bg-iron-black flex flex-col items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] ${
          certified ? "bg-iron-green/5" : "bg-iron-red/5"
        }`} />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group" aria-label="IronID">
            <Shield size={24} className="text-iron-gold group-hover:text-iron-gold-dim transition-colors" />
            <span className="text-lg font-bold text-iron-white">
              Iron<span className="text-gradient-gold">ID</span>
            </span>
          </a>
        </div>

        {/* Status card */}
        <div className={`rounded-2xl p-6 mb-6 border ${
          certified
            ? "bg-iron-green/5 border-iron-green/20"
            : "bg-iron-red/5 border-iron-red/20"
        }`}>
          <div className="flex items-start gap-4">
            {certified ? (
              <ShieldCheck size={44} className="text-iron-green flex-shrink-0 mt-1" />
            ) : (
              <ShieldX size={44} className="text-iron-red flex-shrink-0 mt-1" />
            )}
            <div>
              <h1 className={`text-2xl font-bold mb-1 ${certified ? "text-iron-green" : "text-iron-red"}`}>
                {certified ? "Fichier certifié" : "Non certifié"}
              </h1>
              <p className="text-iron-white/60 text-sm">
                {certified
                  ? "Ce fichier a été certifié par IronID. Son intégrité et son origine sont garanties."
                  : "Ce hash n'est associé à aucune certification dans le ledger IronID."}
              </p>
              <div className="mt-3">
                <StatusBadge status={certified ? "certified" : "not_certified"} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Details table */}
        <div className="rounded-2xl bg-iron-slate border border-iron-border divide-y divide-iron-border">
          <Row icon={<Hash size={14} />} label="Empreinte SHA-256">
            <HashBadge hash={hash} chars={12} />
          </Row>

          {data.file_name && (
            <Row icon={<FileText size={14} />} label="Nom du fichier">
              <span className="text-iron-white text-sm">{data.file_name}</span>
            </Row>
          )}

          {data.certified_at && (
            <Row icon={<Clock size={14} />} label="Certifié le">
              <span className="text-iron-white text-sm">{formatDate(data.certified_at)}</span>
            </Row>
          )}

          {data.certification_id && (
            <Row icon={<ShieldCheck size={14} />} label="ID de certification">
              <HashBadge hash={data.certification_id} chars={8} />
            </Row>
          )}

          {data.file_mime_type && (
            <Row icon={<FileText size={14} />} label="Type">
              <span className="text-iron-white/70 text-sm font-mono">{data.file_mime_type}</span>
            </Row>
          )}
        </div>

        {/* C2PA Manifest */}
        {data.c2pa_manifest && (
          <details className="mt-4 rounded-2xl bg-iron-slate border border-iron-border overflow-hidden">
            <summary className="px-5 py-3 cursor-pointer text-sm font-medium text-iron-white/70 hover:text-iron-white flex items-center gap-2 select-none list-none">
              <FileText size={14} />
              Manifest C2PA
            </summary>
            <pre className="px-5 pb-5 text-xs font-mono text-iron-white/50 overflow-x-auto leading-relaxed">
              {JSON.stringify(data.c2pa_manifest, null, 2)}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href="/verify"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-iron-border text-iron-white/80 hover:bg-iron-border/80 transition-colors"
          >
            ← Vérifier un autre fichier
          </a>

          {data.certified_url && (
            <a
              href={data.certified_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
            >
              Télécharger le fichier certifié
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-2 text-iron-white/50 text-sm flex-shrink-0">
        <span className="text-iron-white/30">{icon}</span>
        {label}
      </div>
      <div className="text-right">{children}</div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-iron-black flex items-center justify-center px-4">
      <div className="text-center">
        <ShieldX size={48} className="text-iron-red mx-auto mb-4" />
        <h1 className="text-xl font-bold text-iron-white mb-2">Erreur</h1>
        <p className="text-iron-white/50">{message}</p>
        <a href="/verify" className="mt-6 inline-block text-iron-gold underline">
          Retour à la vérification
        </a>
      </div>
    </main>
  );
}
