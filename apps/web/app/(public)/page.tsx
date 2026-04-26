import type { Metadata } from "next";
import { Nav }         from "@/components/landing/Nav";
import { Hero }        from "@/components/landing/Hero";
import { HowItWorks }  from "@/components/landing/HowItWorks";
import { Industries }    from "@/components/landing/Industries";
import { C2PACoalition } from "@/components/landing/C2PACoalition";
import { Features }      from "@/components/landing/Features";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTA }         from "@/components/landing/CTA";
import { Footer }      from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "IronID — Certifiez l'authenticité de vos fichiers",
  description:
    "Certifiez n'importe quel fichier avec une signature C2PA cryptographique. Prouvez l'origine, l'auteur et l'intégrité de vos contenus — vérifiable publiquement, pour toujours.",
  alternates: { canonical: "https://www.iron-id.io" },
  openGraph: {
    title:       "IronID — Certifiez l'authenticité de vos fichiers",
    description: "Signature C2PA cryptographique pour développeurs, créateurs et entreprises. Vérifiable publiquement, pour toujours.",
    url:         "https://www.iron-id.io",
    type:        "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.iron-id.io/#organization",
      name: "IronID",
      url: "https://www.iron-id.io",
      logo: {
        "@type": "ImageObject",
        url: "https://www.iron-id.io/opengraph-image",
      },
      sameAs: [],
      description:
        "IronID est une plateforme de certification cryptographique basée sur le standard C2PA. Elle permet de certifier l'authenticité, l'origine et l'intégrité de tout fichier numérique.",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.iron-id.io/#website",
      url: "https://www.iron-id.io",
      name: "IronID",
      publisher: { "@id": "https://www.iron-id.io/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.iron-id.io/verify?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "IronID",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Individual", price: "29", priceCurrency: "USD", billingIncrement: "P1M" },
        { "@type": "Offer", name: "Studio",     price: "199", priceCurrency: "USD", billingIncrement: "P1M" },
      ],
      description:
        "Plateforme de certification C2PA : signez cryptographiquement vos fichiers, inscrivez-les dans un ledger immuable et rendez-les vérifiables publiquement.",
      url: "https://www.iron-id.io",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qu'est-ce que la certification C2PA ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "C2PA (Coalition for Content Provenance and Authenticity) est un standard ouvert co-fondé par Adobe, Microsoft, BBC et Intel pour certifier cryptographiquement l'origine et l'intégrité des fichiers numériques.",
          },
        },
        {
          "@type": "Question",
          name: "Comment IronID certifie-t-il un fichier ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "IronID calcule un hash SHA-256 du fichier, génère une signature C2PA cryptographique et inscrit le tout dans un ledger immuable. La certification est ensuite vérifiable publiquement à tout moment.",
          },
        },
        {
          "@type": "Question",
          name: "Quels types de fichiers puis-je certifier ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "IronID supporte tous types de fichiers : images (JPEG, PNG, WebP), vidéos (MP4, MOV), audio (MP3, WAV), documents PDF, et tout autre fichier numérique.",
          },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Industries />
        <C2PACoalition />
        <Features />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
