import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { APIKeysClient } from "@/components/keys/APIKeysClient";

export const metadata: Metadata = { title: "API Keys" };

export default function KeysPage() {
  return (
    <>
      <Header
        title="API Keys"
        description="Manage your access keys for the IronID API"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <APIKeysClient />
        </div>
      </main>
    </>
  );
}
