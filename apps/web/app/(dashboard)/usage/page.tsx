import type { Metadata } from "next";
import { Header } from "@/components/dashboard/Header";
import { UsageClient } from "@/components/usage/UsageClient";

export const metadata: Metadata = { title: "Usage" };

export default function UsagePage() {
  return (
    <>
      <Header
        title="Usage"
        description="Track your monthly signature consumption"
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <UsageClient />
      </main>
    </>
  );
}
