import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NavServer } from "@/components/landing/NavServer";
import { Footer }    from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Documentation — IronID",
  description:
    "Complete IronID API reference: C2PA certification, JavaScript & Python SDK, webhooks, public verification. Integrate digital provenance in minutes.",
  alternates: { canonical: "https://www.iron-id.io/docs" },
  openGraph: {
    title:       "IronID API Documentation — Integrate C2PA Certification",
    description: "JavaScript & Python SDK, REST API, webhooks. Certify your files in a few lines of code.",
    url:         "https://www.iron-id.io/docs",
    type:        "website",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Code({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-iron-border">
      <div className="flex items-center gap-2 px-4 py-2 bg-iron-black/60 border-b border-iron-border">
        <span className="text-xs text-iron-white/30 font-mono">{lang}</span>
      </div>
      <pre className="overflow-x-auto p-4 bg-iron-black/40 text-sm font-mono text-iron-white/75 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  const colors: Record<string, string> = {
    GET:    "bg-iron-green/10 text-iron-green",
    POST:   "bg-iron-blue/10 text-iron-blue",
    DELETE: "bg-iron-red/10 text-iron-red",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold ${colors[children] ?? "bg-iron-border text-iron-white/50"}`}>
      {children}
    </span>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-xl font-bold text-iron-white mb-6 pb-3 border-b border-iron-border">{title}</h2>
      {children}
    </section>
  );
}

function Endpoint({
  method, path, desc, children,
}: { method: string; path: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 bg-iron-slate border border-iron-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-iron-border bg-iron-black/30">
        <Badge>{method}</Badge>
        <span className="font-mono text-sm text-iron-white">{path}</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-iron-white/50 mb-3">{desc}</p>
        {children}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function DocsPage() {
  const t = await getTranslations("docs");

  const navItems = [
    { href: "#authentication", label: t("nav.authentication") },
    { href: "#certify",        label: t("nav.certify")        },
    { href: "#verify",         label: t("nav.verify")         },
    { href: "#keys",           label: t("nav.keys")           },
    { href: "#webhooks",       label: t("nav.webhooks")       },
    { href: "#sdk-js",         label: t("nav.sdkJs")          },
    { href: "#sdk-py",         label: t("nav.sdkPy")          },
    { href: "#errors",         label: t("nav.errors")         },
  ];

  const errors = [
    { status: "400", code: "INVALID_BODY"    },
    { status: "401", code: "UNAUTHORIZED"    },
    { status: "403", code: "FORBIDDEN"       },
    { status: "404", code: "NOT_FOUND"       },
    { status: "413", code: "FILE_TOO_LARGE"  },
    { status: "415", code: "UNSUPPORTED_MIME"},
    { status: "422", code: "QUOTA_EXCEEDED"  },
    { status: "429", code: "RATE_LIMITED"    },
    { status: "500", code: "INTERNAL_ERROR"  },
  ] as const;

  return (
    <>
      <NavServer />
      <div className="min-h-screen bg-iron-black">
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-12 flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <nav className="sticky top-24 space-y-1 text-sm">
              {navItems.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="block px-3 py-2 rounded-lg text-iron-white/40 hover:text-iron-white hover:bg-iron-border/30 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-3xl min-w-0">
            {/* Intro */}
            <div className="mb-12">
              <h1 className="text-3xl font-extrabold text-iron-white mb-3">{t("title")}</h1>
              <p className="text-iron-white/50 leading-relaxed">
                {t("subtitle")}{" "}
                <code className="mono text-iron-gold text-sm">https://api.iron-id.io</code>
              </p>
            </div>

            {/* Authentication */}
            <Section id="authentication" title={t("authentication.title")}>
              <p className="text-sm text-iron-white/50 mb-4">
                {t("authentication.desc")}
              </p>
              <Code lang="bash">{`curl https://api.iron-id.io/v1/keys \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</Code>
            </Section>

            {/* Certifications */}
            <Section id="certify" title={t("certify.title")}>
              <Endpoint method="POST" path="/v1/certify" desc={t("certify.submit")}>
                <Code lang="bash">{`curl -X POST https://api.iron-id.io/v1/certify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg" \\
  -F 'metadata={"author":"Jane Doe","location":"Paris"}' \\
  -F "webhook_url=https://myapp.com/webhooks/ironid"`}</Code>
                <Code lang="json">{`{
  "id": "cert_01j8x9abc",
  "status": "pending",
  "certified_url": null,
  "created_at": "2026-04-28T10:00:00Z"
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/certify/{id}" desc={t("certify.status")}>
                <Code lang="bash">{`curl https://api.iron-id.io/v1/certify/cert_01j8x9abc \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</Code>
                <Code lang="json">{`{
  "id": "cert_01j8x9abc",
  "status": "certified",
  "certified_url": "https://cdn.iron-id.io/certified/...",
  "verification_url": "https://www.iron-id.io/verify/...",
  "c2pa_manifest": { ... },
  "metadata": { "author": "Jane Doe", "location": "Paris" },
  "created_at": "2026-04-28T10:00:00Z"
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/certifications" desc={t("certify.list")}>
                <Code lang="bash">{`curl "https://api.iron-id.io/v1/certifications?page=1&page_size=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</Code>
              </Endpoint>
            </Section>

            {/* Verification */}
            <Section id="verify" title={t("verify.title")}>
              <p className="text-sm text-iron-white/50 mb-4">{t("verify.publicNote")}</p>
              <Endpoint method="POST" path="/v1/verify" desc={t("verify.upload")}>
                <Code lang="bash">{`curl -X POST https://api.iron-id.io/v1/verify \\
  -F "file=@photo.jpg"`}</Code>
              </Endpoint>
              <Endpoint method="GET" path="/v1/verify/{fingerprint}" desc={t("verify.hash")}>
                <Code lang="bash">{`curl https://api.iron-id.io/v1/verify/<file-fingerprint>`}</Code>
                <Code lang="json">{`{
  "is_certified": true,
  "certification_id": "cert_01j8x9abc",
  "certified_url": "https://cdn.iron-id.io/certified/...",
  "certified_at": "2026-04-28T10:05:00Z",
  "c2pa_manifest": { ... }
}`}</Code>
              </Endpoint>
            </Section>

            {/* API Keys */}
            <Section id="keys" title={t("keys.title")}>
              <Endpoint method="POST"   path="/v1/keys"      desc={t("keys.create")}>
                <Code lang="bash">{`curl -X POST https://api.iron-id.io/v1/keys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Production key","environment":"production"}'`}</Code>
                <Code lang="json">{`{
  "id": "key_abc123",
  "name": "Production key",
  "key_prefix": "sk_prod_Ab1c",
  "raw_key": "sk_prod_Ab1cDe2f...",
  "is_active": true,
  "created_at": "2026-04-28T10:00:00Z"
}`}</Code>
              </Endpoint>
              <Endpoint method="GET"    path="/v1/keys"      desc={t("keys.list")} />
              <Endpoint method="DELETE" path="/v1/keys/{id}" desc={t("keys.delete")} />
            </Section>

            {/* Webhooks */}
            <Section id="webhooks" title={t("webhooks.title")}>
              <p className="text-sm text-iron-white/50 mb-4">{t("webhooks.desc")}</p>
              <Code lang="json">{`{
  "event": "certification.completed",
  "certification_id": "cert_01j8x9abc",
  "status": "certified",
  "certified_url": "https://cdn.iron-id.io/certified/...",
  "verification_url": "https://www.iron-id.io/verify/...",
  "timestamp": "2026-04-28T10:05:00Z"
}`}</Code>
            </Section>

            {/* SDK JS */}
            <Section id="sdk-js" title={t("sdkJs")}>
              <Code lang="bash">{`npm install ironid`}</Code>
              <Code lang="typescript">{`import { IronID } from 'ironid';

const client = new IronID({ apiKey: process.env.IRONID_API_KEY });

// Certify a file
const cert = await client.certify({
  file: fs.readFileSync('photo.jpg'),
  filename: 'photo.jpg',
  metadata: { author: 'Jane Doe', location: 'Paris' },
  webhookUrl: 'https://myapp.com/webhooks/ironid',
});

console.log(cert.certified_url);    // share & verify
console.log(cert.verification_url); // public proof link

// Verify a file
const result = await client.verify('photo.jpg');
console.log(result.is_certified); // true

// Manage API keys
const key = await client.keys.create({ name: 'Production' });
console.log(key.raw_key); // shown once — store securely`}</Code>
            </Section>

            {/* SDK Python */}
            <Section id="sdk-py" title={t("sdkPy")}>
              <Code lang="bash">{`pip install ironid`}</Code>
              <Code lang="python">{`from ironid import IronID
import os

client = IronID(api_key=os.environ["IRONID_API_KEY"])

# Certify a file
with open("photo.jpg", "rb") as f:
    cert = client.certify(
        f,
        filename="photo.jpg",
        metadata={"author": "Jane Doe", "location": "Paris"},
    )

print(cert.certified_url)    # share & verify
print(cert.verification_url) # public proof link

# Verify a file
result = client.verify("photo.jpg")
print(result.is_certified)   # True

# Manage API keys
with IronID(api_key=os.environ["IRONID_API_KEY"]) as client:
    keys = client.keys.list()
    print(keys[0].name)`}</Code>
            </Section>

            {/* Error codes */}
            <Section id="errors" title={t("errors.title")}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-iron-white/30 border-b border-iron-border">
                      <th className="text-left py-3 font-medium">{t("errors.colStatus")}</th>
                      <th className="text-left py-3 font-medium">{t("errors.colCode")}</th>
                      <th className="text-left py-3 font-medium">{t("errors.colDesc")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-iron-border/30">
                    {errors.map(({ status, code }) => (
                      <tr key={code}>
                        <td className="py-3 font-mono text-iron-white/60">{status}</td>
                        <td className="py-3 font-mono text-iron-gold text-xs">{code}</td>
                        <td className="py-3 text-iron-white/40">{t(`errors.${code}`)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
