import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { BillingClient } from "@/components/billing/BillingClient";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <Header
        title="Billing"
        description="Manage your PayPal subscription and signatures"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <BillingClient />
        </div>
      </main>
    </>
  );
}
