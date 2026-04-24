import type { Metadata } from "next";
import { Shield, Info } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { CertificationUploader } from "@/components/certify/CertificationUploader";

export const metadata: Metadata = { title: "Certifier un fichier" };

export default function CertifyPage() {
  return (
    <>
      <Header
        title="Certifier un fichier"
        description="Signer cryptographiquement un fichier avec C2PA et l'inscrire dans le ledger IronID"
      />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-xl bg-iron-blue/5 border border-iron-blue/20 px-4 py-3">
            <Info size={15} className="text-iron-blue flex-shrink-0 mt-0.5" />
            <p className="text-xs text-iron-white/60">
              Chaque certification calcule l'empreinte SHA-256 du fichier côté serveur,
              génère un manifest C2PA signé avec ECDSA P-256, et inscrit un enregistrement
              immuable dans le ledger PostgreSQL. Le fichier certifié est stocké sur Cloudflare R2.
            </p>
          </div>

          {/* Uploader — needs API key from user session */}
          {/* In production: fetch the active API key from /v1/keys server-side */}
          <CertificationUploaderWrapper />
        </div>
      </main>
    </>
  );
}

// Client-side wrapper to get API key from Clerk session
function CertificationUploaderWrapper() {
  // The API key is loaded client-side via the KeySelector component (Module 4 companion)
  // For now we render the uploader with a placeholder; the key selector is below
  return <CertificationUploaderClient />;
}

// Force client component for API key loading
import { CertifyPageClient } from "@/components/certify/CertifyPageClient";

function CertificationUploaderClient() {
  return <CertifyPageClient />;
}
