import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { CertificationsListClient } from "@/components/certifications/CertificationsListClient";

export const metadata: Metadata = { title: "My certifications" };

export default function CertificationsPage() {
  return (
    <>
      <Header
        title="My certifications"
        description="History of all your certified files"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <CertificationsListClient />
      </main>
    </>
  );
}
