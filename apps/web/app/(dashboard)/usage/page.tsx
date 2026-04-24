import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { UsageClient } from "@/components/usage/UsageClient";

export const metadata: Metadata = { title: "Utilisation" };

export default function UsagePage() {
  return (
    <>
      <Header
        title="Utilisation"
        description="Suivi de votre consommation mensuelle de signatures"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <UsageClient />
      </main>
    </>
  );
}
