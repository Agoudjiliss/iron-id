import type { Metadata } from "next";
import { Nav }         from "@/components/landing/Nav";
import { Hero }        from "@/components/landing/Hero";
import { HowItWorks }  from "@/components/landing/HowItWorks";
import { Features }    from "@/components/landing/Features";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTA }         from "@/components/landing/CTA";
import { Footer }      from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "IronID — The Gold Standard for Digital Truth",
  description:
    "Certifiez n'importe quel fichier avec une signature C2PA cryptographique et inscrivez-le dans un ledger immuable. Vérifiable publiquement, pour toujours.",
  openGraph: {
    title:       "IronID — The Gold Standard for Digital Truth",
    description: "C2PA-certified provenance for developers, creators and enterprises.",
    type:        "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
