import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-iron-black flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2.5 mb-8">
        <Shield size={28} className="text-iron-gold" />
        <span className="text-2xl font-bold text-iron-white tracking-tight">
          Iron<span className="text-gradient-gold">ID</span>
        </span>
      </div>
      <SignIn path="/sign-in" afterSignInUrl="/dashboard" />
    </div>
  );
}
