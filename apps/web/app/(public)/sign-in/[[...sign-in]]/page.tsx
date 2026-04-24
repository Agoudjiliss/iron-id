"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

const hasClerk =
  typeof process !== "undefined" &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder";

export default function SignInPage() {
  if (hasClerk) {
    const { SignIn } = require("@clerk/nextjs");
    return (
      <div className="min-h-screen bg-iron-black flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2.5 mb-8">
          <Shield size={28} className="text-iron-gold" />
          <span className="text-2xl font-bold text-iron-white tracking-tight">
            Iron<span className="text-gradient-gold">ID</span>
          </span>
        </div>
        <SignIn path="/sign-in" afterSignInUrl="/dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-iron-black flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2.5 mb-8">
        <Shield size={28} className="text-iron-gold" />
        <span className="text-2xl font-bold text-iron-white tracking-tight">
          Iron<span className="text-gradient-gold">ID</span>
        </span>
      </div>
      <div className="bg-iron-slate border border-iron-border rounded-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-lg font-bold text-iron-white mb-2">Connexion</h1>
        <p className="text-sm text-iron-white/40 mb-6">
          Configurez <code className="text-iron-gold text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> pour activer l'authentification.
        </p>
        <Link href="/" className="text-sm text-iron-gold hover:underline">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
