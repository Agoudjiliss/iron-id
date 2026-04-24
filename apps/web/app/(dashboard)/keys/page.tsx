import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { APIKeysClient } from "@/components/keys/APIKeysClient";

export const metadata: Metadata = { title: "Clés API" };

export default function KeysPage() {
  return (
    <>
      <Header
        title="Clés API"
        description="Gérez vos clés d'accès pour l'API IronID"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <APIKeysClient />
        </div>
      </main>
    </>
  );
}
