import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.iron-id.io"),
  title: {
    default: "IronID — Certifiez l'authenticité de vos fichiers",
    template: "%s | IronID",
  },
  description:
    "Certifiez n'importe quel fichier avec une signature C2PA cryptographique. Prouvez l'origine, l'auteur et l'intégrité de vos contenus — vérifiable publiquement, pour toujours.",
  keywords: [
    "certification C2PA", "authenticité numérique", "provenance contenu",
    "signature cryptographique", "détection deepfake", "preuve numérique",
    "certifier fichier", "content authenticity", "digital provenance",
    "C2PA standard", "IronID",
  ],
  authors: [{ name: "IronID", url: "https://www.iron-id.io" }],
  creator: "IronID",
  publisher: "IronID",
  openGraph: {
    type: "website",
    siteName: "IronID",
    locale: "fr_FR",
    url: "https://www.iron-id.io",
    title: "IronID — Certifiez l'authenticité de vos fichiers",
    description:
      "Certifiez n'importe quel fichier avec une signature C2PA cryptographique. Prouvez l'origine et l'intégrité de vos contenus — vérifiable publiquement, pour toujours.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "IronID — The Gold Standard for Digital Truth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ironid_io",
    creator: "@ironid_io",
    title: "IronID — Certifiez l'authenticité de vos fichiers",
    description:
      "Signature C2PA cryptographique pour prouver l'origine de vos contenus. Vérifiable publiquement, pour toujours.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://www.iron-id.io",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale   = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-screen bg-iron-black text-iron-white antialiased">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <PostHogProvider>
              {children}
            </PostHogProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
