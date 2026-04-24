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
  title: {
    default: "IronID — The Gold Standard for Digital Truth",
    template: "%s | IronID",
  },
  description:
    "Prove the origin, author and integrity of any digital file — forever. C2PA-certified provenance for developers, creators and enterprises.",
  keywords: ["C2PA", "content authenticity", "digital provenance", "deepfake detection", "file certification"],
  openGraph: {
    type: "website",
    siteName: "IronID",
    title: "IronID — The Gold Standard for Digital Truth",
    description: "Cryptographic certification for digital content.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IronID",
    description: "The Gold Standard for Digital Truth.",
  },
  robots: { index: true, follow: true },
};

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale   = await getLocale();
  const messages = await getMessages();

  const inner = (
    <html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-iron-black text-iron-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );

  return hasClerk ? <ClerkProvider>{inner}</ClerkProvider> : inner;
}
