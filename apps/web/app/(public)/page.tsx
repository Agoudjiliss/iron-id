import type { Metadata } from "next";
import { NavServer }   from "@/components/landing/NavServer";
import { Hero }        from "@/components/landing/Hero";
import { HowItWorks }  from "@/components/landing/HowItWorks";
import { Industries }    from "@/components/landing/Industries";
import { C2PACoalition } from "@/components/landing/C2PACoalition";
import { Features }      from "@/components/landing/Features";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTA }         from "@/components/landing/CTA";
import { Footer }      from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "IronID — Certify the authenticity of your files",
  description:
    "Certify any file with a cryptographic C2PA signature. Prove the origin, author and integrity of your content — publicly verifiable, forever.",
  alternates: { canonical: "https://www.iron-id.io" },
  openGraph: {
    title:       "IronID — Certify the authenticity of your files",
    description: "Cryptographic C2PA signature for developers, creators and businesses. Publicly verifiable, forever.",
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
        "IronID is a cryptographic certification platform based on the C2PA standard. It certifies the authenticity, origin and integrity of any digital file.",
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
        "C2PA certification platform: cryptographically sign your files, record them in an immutable ledger and make them publicly verifiable.",
      url: "https://www.iron-id.io",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is C2PA certification?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "C2PA (Coalition for Content Provenance and Authenticity) is an open standard co-founded by Adobe, Microsoft, BBC and Intel to cryptographically certify the origin and integrity of digital files.",
          },
        },
        {
          "@type": "Question",
          name: "How does IronID certify a file?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "IronID computes a SHA-256 hash of the file, generates a cryptographic C2PA signature and records everything in an immutable ledger. The certification can then be publicly verified at any time.",
          },
        },
        {
          "@type": "Question",
          name: "What types of files can I certify?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "IronID supports all file types: images (JPEG, PNG, WebP), videos (MP4, MOV), audio (MP3, WAV), PDF documents, and any other digital file.",
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
      <NavServer />
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
