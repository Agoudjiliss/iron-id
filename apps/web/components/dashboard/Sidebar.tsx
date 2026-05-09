"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Upload,
  CheckCircle,
  Key,
  BarChart2,
  CreditCard,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",           labelKey: "overview",       icon: BarChart2   },
  { href: "/certify",             labelKey: "certify",        icon: Upload      },
  { href: "/certifications",      labelKey: "certifications", icon: CheckCircle },
  { href: "/keys",                labelKey: "keys",           icon: Key         },
  { href: "/usage",               labelKey: "usage",          icon: BarChart2   },
  { href: "/billing",             labelKey: "billing",        icon: CreditCard  },
  { href: "/affiliate",           labelKey: "affiliate",      icon: Users       },
];

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-iron-border text-iron-white/50",
  payg:       "bg-iron-blue/20 text-iron-blue",
  individual: "bg-iron-gold/20 text-iron-gold",
  studio:     "bg-purple-500/20 text-purple-400",
  enterprise: "bg-iron-green/20 text-iron-green",
};

const PLAN_LABELS: Record<string, string> = {
  free:       "Free",
  payg:       "Pay-as-you-go",
  individual: "Individual",
  studio:     "Studio",
  enterprise: "Enterprise",
};

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const t = useTranslations("nav");
  const locale = useLocale();

  // Read plan from public metadata (set by Stripe webhook)
  const plan = (user?.publicMetadata?.plan as string) ?? "free";

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-iron-slate border-r border-iron-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-iron-border flex-shrink-0">
        <Shield size={22} className="text-iron-gold" />
        <span className="text-lg font-bold text-iron-white tracking-tight">
          Iron<span className="text-gradient-gold">ID</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Navigation">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150 group",
                active
                  ? "bg-iron-gold/10 text-iron-gold"
                  : "text-iron-white/50 hover:text-iron-white hover:bg-iron-border/50",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={16}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-iron-gold" : "text-iron-white/30 group-hover:text-iron-white/60",
                )}
              />
              {t(labelKey as Parameters<typeof t>[0])}
              {active && (
                <ChevronRight size={12} className="ml-auto text-iron-gold/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-iron-border pt-4 space-y-2">
        {/* Plan badge */}
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-iron-white/40">{t("currentPlan")}</span>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PLAN_COLORS[plan] ?? PLAN_COLORS.free)}>
            {PLAN_LABELS[plan] ?? "Free"}
          </span>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-iron-border/30">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "Avatar"}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-iron-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-iron-gold text-xs font-bold">
                  {(user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress[0] ?? "?").toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-iron-white truncate">
                {user.fullName ?? user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-iron-white/40 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        )}

        {/* Language switcher */}
        <div className="px-3 py-2">
          <LanguageSwitcher current={locale} compact />
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-iron-white/40 hover:text-iron-red hover:bg-iron-red/5 transition-colors"
        >
          <LogOut size={14} />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
