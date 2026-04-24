import { Sidebar } from "@/components/dashboard/Sidebar";
import { ReferralTracker } from "@/components/affiliate/ReferralTracker";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-iron-black">
      {/* Attribute affiliate referral after sign-up (no-op if no pending ref) */}
      <ReferralTracker />

      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
