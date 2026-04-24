import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { CertificationsListClient } from "@/components/certifications/CertificationsListClient";

export const metadata: Metadata = { title: "Mes certifications" };

export default function CertificationsPage() {
  return (
    <>
      <Header
        title="Mes certifications"
        description="Historique de tous vos fichiers certifiés"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <CertificationsListClient />
      </main>
    </>
  );
}
