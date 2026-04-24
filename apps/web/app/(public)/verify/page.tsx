import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { FileVerifier } from "@/components/verify/FileVerifier";

export const metadata: Metadata = {
  title: "Vérifier un fichier",
  description:
    "Vérifiez l'authenticité et la provenance d'un fichier numérique sur le ledger IronID. Aucun compte requis.",
};

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-iron-black flex flex-col items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-iron-gold/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 mb-8 group"
            aria-label="Retour à l'accueil IronID"
          >
            <Shield
              size={28}
              className="text-iron-gold group-hover:text-iron-gold-dim transition-colors"
            />
            <span className="text-xl font-bold tracking-tight text-iron-white">
              Iron<span className="text-gradient-gold">ID</span>
            </span>
          </a>

          <h1 className="text-3xl sm:text-4xl font-bold text-iron-white mb-3">
            Vérifier un fichier
          </h1>
          <p className="text-iron-white/50 text-base max-w-md mx-auto">
            Glissez un fichier ou entrez son empreinte SHA-256 pour vérifier son
            authenticité sur le ledger IronID.
          </p>
        </div>

        {/* Verifier widget */}
        <FileVerifier />

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-iron-white/25">
          Vérification publique — aucun compte requis.{" "}
          <a
            href="/pricing"
            className="text-iron-gold/60 hover:text-iron-gold underline underline-offset-2"
          >
            Certifier vos propres fichiers →
          </a>
        </p>
      </div>
    </main>
  );
}
