import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation API — IronID",
  description:
    "Référence complète de l'API IronID : certification C2PA, SDK JavaScript & Python, webhooks, vérification publique. Intégrez la provenance numérique en quelques minutes.",
  alternates: { canonical: "https://www.iron-id.io/docs" },
  openGraph: {
    title:       "Documentation API IronID — Intégrez la certification C2PA",
    description: "SDK JavaScript & Python, API REST, webhooks. Certifiez vos fichiers en quelques lignes de code.",
    url:         "https://www.iron-id.io/docs",
    type:        "website",
  },
};

// ---- Code block helper ----

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

// ---- Main page ----

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-iron-black">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-iron-black/90 backdrop-blur border-b border-iron-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={18} className="text-iron-gold" />
            <span className="font-bold text-iron-white">Iron<span className="text-gradient-gold">ID</span></span>
            <span className="text-iron-white/30 text-sm ml-1">/ Docs</span>
          </Link>
          <Link href="/sign-up" className="text-sm px-4 py-1.5 rounded-lg bg-iron-gold text-iron-black font-semibold">
            Commencer
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <nav className="sticky top-24 space-y-1 text-sm">
            {[
              { href: "#authentication", label: "Authentification" },
              { href: "#certify",        label: "Certifications"   },
              { href: "#verify",         label: "Vérification"     },
              { href: "#keys",           label: "Clés API"         },
              { href: "#webhooks",       label: "Webhooks"         },
              { href: "#sdk-js",         label: "SDK JavaScript"   },
              { href: "#sdk-py",         label: "SDK Python"       },
              { href: "#errors",         label: "Erreurs"          },
            ].map(({ href, label }) => (
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
            <h1 className="text-3xl font-extrabold text-iron-white mb-3">Documentation IronID</h1>
            <p className="text-iron-white/50 leading-relaxed">
              L'API IronID est une API REST JSON. Base URL :{" "}
              <code className="mono text-iron-gold text-sm">https://api.ironid.io</code>
            </p>
          </div>

          {/* Authentication */}
          <Section id="authentication" title="Authentification">
            <p className="text-sm text-iron-white/50 mb-4">
              Toutes les requêtes authentifiées nécessitent un en-tête{" "}
              <code className="mono text-sm text-iron-white">Authorization: Bearer iid_live_...</code>.
              Générez vos clés dans le dashboard sous <strong>Clés API</strong>.
            </p>
            <Code lang="bash">{`curl https://api.ironid.io/v1/keys \\
  -H "Authorization: Bearer iid_live_YOUR_KEY"`}</Code>
          </Section>

          {/* Certifications */}
          <Section id="certify" title="Certifications">
            <Endpoint
              method="POST"
              path="/v1/certify"
              desc="Soumettre un fichier pour certification C2PA. Retourne 202 Accepted immédiatement."
            >
              <Code lang="bash">{`curl -X POST https://api.ironid.io/v1/certify \\
  -H "Authorization: Bearer iid_live_..." \\
  -F "file=@photo.jpg" \\
  -F 'metadata={"author":"Jane Doe","location":"Paris"}' \\
  -F "webhook_url=https://myapp.com/webhooks/ironid"`}</Code>
              <Code lang="json">{`{
  "id": "cert_01j8x9abc",
  "status": "pending",
  "file_hash_sha256": null,
  "created_at": "2026-04-24T10:00:00Z"
}`}</Code>
            </Endpoint>

            <Endpoint
              method="GET"
              path="/v1/certify/{id}"
              desc="Récupérer le statut d'une certification. Statuts : pending → processing → certified | failed."
            >
              <Code lang="bash">{`curl https://api.ironid.io/v1/certify/cert_01j8x9abc \\
  -H "Authorization: Bearer iid_live_..."`}</Code>
              <Code lang="json">{`{
  "id": "cert_01j8x9abc",
  "status": "certified",
  "file_hash_sha256": "a3f5b9c1d2e3...",
  "certified_url": "https://r2.ironid.io/certified/...",
  "verification_url": "https://ironid.io/verify/a3f5b9c1...",
  "c2pa_manifest": { "claim": { "dc:title": "photo.jpg" } },
  "metadata": { "author": "Jane Doe", "location": "Paris" },
  "created_at": "2026-04-24T10:00:00Z"
}`}</Code>
            </Endpoint>

            <Endpoint
              method="GET"
              path="/v1/certifications"
              desc="Lister les certifications (paginé). Paramètres : page, page_size, status_filter."
            >
              <Code lang="bash">{`curl "https://api.ironid.io/v1/certifications?page=1&page_size=20" \\
  -H "Authorization: Bearer iid_live_..."`}</Code>
            </Endpoint>
          </Section>

          {/* Verify */}
          <Section id="verify" title="Vérification">
            <p className="text-sm text-iron-white/50 mb-4">
              Les endpoints de vérification sont publics — aucune clé API requise.
            </p>
            <Endpoint
              method="POST"
              path="/v1/verify"
              desc="Vérifier un fichier par upload. Le SHA-256 est calculé côté serveur."
            >
              <Code lang="bash">{`curl -X POST https://api.ironid.io/v1/verify \\
  -F "file=@photo.jpg"`}</Code>
            </Endpoint>
            <Endpoint
              method="GET"
              path="/v1/verify/{hash}"
              desc="Rechercher une certification par son hash SHA-256."
            >
              <Code lang="bash">{`curl https://api.ironid.io/v1/verify/a3f5b9c1d2e3...`}</Code>
              <Code lang="json">{`{
  "is_certified": true,
  "file_hash_sha256": "a3f5b9c1d2e3...",
  "certification_id": "cert_01j8x9abc",
  "certified_at": "2026-04-24T10:05:00Z",
  "c2pa_manifest": { ... },
  "ledger_history_count": 1
}`}</Code>
            </Endpoint>
          </Section>

          {/* Keys */}
          <Section id="keys" title="Clés API">
            <Endpoint method="POST" path="/v1/keys" desc="Créer une nouvelle clé API. La clé brute n'est retournée qu'une seule fois.">
              <Code lang="bash">{`curl -X POST https://api.ironid.io/v1/keys \\
  -H "Authorization: Bearer iid_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Production key","environment":"production"}'`}</Code>
              <Code lang="json">{`{
  "id": "key_abc123",
  "name": "Production key",
  "key_prefix": "iid_live_Ab1c",
  "raw_key": "iid_live_Ab1cDe2fGh3iJk4l...",
  "is_active": true,
  "created_at": "2026-04-24T10:00:00Z"
}`}</Code>
            </Endpoint>
            <Endpoint method="GET"    path="/v1/keys"       desc="Lister toutes les clés de l'utilisateur." />
            <Endpoint method="DELETE" path="/v1/keys/{id}"  desc="Révoquer une clé API." />
          </Section>

          {/* Webhooks */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-sm text-iron-white/50 mb-4">
              IronID envoie des POST HTTP à votre URL lorsqu'une certification change de statut.
            </p>
            <Code lang="json">{`// Payload envoyé à votre webhook_url
{
  "event": "certification.completed",
  "certification_id": "cert_01j8x9abc",
  "status": "certified",
  "file_hash_sha256": "a3f5b9c1d2e3...",
  "certified_url": "https://r2.ironid.io/certified/...",
  "timestamp": "2026-04-24T10:05:00Z"
}`}</Code>
          </Section>

          {/* SDK JS */}
          <Section id="sdk-js" title="SDK JavaScript / TypeScript">
            <Code lang="bash">{`npm install @ironid/sdk`}</Code>
            <Code lang="typescript">{`import { IronID } from '@ironid/sdk';

const client = new IronID({ apiKey: 'iid_live_...' });

// Certifier et attendre la complétion
const cert = await client.certifications.certifyAndWait({
  file: fs.readFileSync('photo.jpg'),
  filename: 'photo.jpg',
  metadata: { author: 'Jane Doe', location: 'Paris' },
  webhookUrl: 'https://myapp.com/webhooks/ironid',
});

console.log(cert.file_hash_sha256); // a3f5b9c1...
console.log(cert.certified_url);    // https://r2.ironid.io/...

// Vérifier par hash
const result = await client.verify.byHash('a3f5b9c1...');
console.log(result.is_certified); // true

// Gérer les clés
const key = await client.keys.create({ name: 'Prod' });
console.log(key.raw_key); // iid_live_... (affiché une seule fois)`}</Code>
          </Section>

          {/* SDK Python */}
          <Section id="sdk-py" title="SDK Python">
            <Code lang="bash">{`pip install ironid`}</Code>
            <Code lang="python">{`from ironid import IronID

client = IronID(api_key="iid_live_...")

# Certifier et attendre la complétion
with open("photo.jpg", "rb") as f:
    cert = client.certifications.certify_and_wait(
        f,
        filename="photo.jpg",
        metadata={"author": "Jane Doe", "location": "Paris"},
    )

print(cert.file_hash_sha256)  # a3f5b9c1...
print(cert.certified_url)     # https://r2.ironid.io/...

# Vérifier par hash
result = client.verify.by_hash("a3f5b9c1...")
print(result.is_certified)    # True

# Utilisation comme context manager (ferme les connexions proprement)
with IronID(api_key="iid_live_...") as client:
    keys = client.keys.list()
    print(keys[0].key_prefix)`}</Code>
          </Section>

          {/* Errors */}
          <Section id="errors" title="Codes d'erreur">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-iron-white/30 border-b border-iron-border">
                    <th className="text-left py-3 font-medium">Code HTTP</th>
                    <th className="text-left py-3 font-medium">Code</th>
                    <th className="text-left py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iron-border/30">
                  {[
                    { status: "400", code: "INVALID_BODY",       desc: "Requête malformée ou paramètre invalide."              },
                    { status: "401", code: "UNAUTHORIZED",        desc: "Clé API manquante, invalide ou révoquée."              },
                    { status: "403", code: "FORBIDDEN",           desc: "Action non autorisée pour ce plan ou ce rôle."         },
                    { status: "404", code: "NOT_FOUND",           desc: "Ressource introuvable."                                },
                    { status: "413", code: "FILE_TOO_LARGE",      desc: "Fichier dépasse la limite (100 Mo)."                   },
                    { status: "415", code: "UNSUPPORTED_MIME",    desc: "Type de fichier non supporté."                         },
                    { status: "422", code: "QUOTA_EXCEEDED",      desc: "Quota mensuel de certifications épuisé."               },
                    { status: "429", code: "RATE_LIMITED",        desc: "Trop de requêtes. Attendez avant de réessayer."        },
                    { status: "500", code: "INTERNAL_ERROR",      desc: "Erreur serveur interne."                               },
                  ].map(({ status, code, desc }) => (
                    <tr key={code}>
                      <td className="py-3 font-mono text-iron-white/60">{status}</td>
                      <td className="py-3 font-mono text-iron-gold text-xs">{code}</td>
                      <td className="py-3 text-iron-white/40">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
