"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Zap,
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { PricingClient } from "./PricingClient";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SubscriptionStatus {
  plan: string;
  paypal_subscription_id: string | null;
  subscription_status: string | null;
  monthly_signatures_used: number;
  monthly_signatures_limit: number;
  paypal_status?: string;
  next_billing?: string;
  last_payment?: { amount?: { value?: string }; time?: string };
}

const PLAN_LABELS: Record<string, string> = {
  free:       "Free",
  payg:       "Pay-as-you-go",
  individual: "Individual — $29/mois",
  studio:     "Studio — $199/mois",
  enterprise: "Enterprise — $1 200/mois",
};

const PAYPAL_STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "text-iron-green",
  SUSPENDED: "text-iron-gold",
  CANCELLED: "text-iron-red",
  EXPIRED:   "text-iron-red",
};

export function BillingClient() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check URL for PayPal return params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "1") {
        setSuccessMsg("Abonnement activé ! Votre plan sera mis à jour sous quelques instants.");
      }
      if (params.get("cancelled") === "1") {
        setError("Le paiement PayPal a été annulé.");
      }
      if (params.get("payg") === "success") {
        setSuccessMsg("Paiement PAYG confirmé ! Vos signatures seront créditées sous peu.");
      }
    }
  }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/billing/subscription");
      if (!res.ok) throw new Error("Impossible de charger le statut.");
      setSub(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleCancel() {
    if (!confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) return;

    setCancelling(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erreur lors de l'annulation.");
      }
      setSuccessMsg("Abonnement annulé. Votre plan restera actif jusqu'à la fin de la période payée.");
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'annulation.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-iron-white/40 text-sm">
        <Loader2 size={16} className="animate-spin" />
        Chargement du statut de facturation…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-iron-green/10 border border-iron-green/20 text-iron-green text-sm">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-iron-red/10 border border-iron-red/20 text-iron-red text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-iron-gold" />
            <h2 className="text-sm font-semibold text-iron-white">Plan actuel</h2>
          </div>
          <button
            onClick={loadStatus}
            className="p-1.5 rounded-lg text-iron-white/30 hover:text-iron-white hover:bg-iron-border transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-iron-white">
              {PLAN_LABELS[sub?.plan ?? "free"] ?? "Free"}
            </p>
            {sub?.paypal_status && (
              <p className={cn("text-xs mt-0.5", PAYPAL_STATUS_COLORS[sub.paypal_status] ?? "text-iron-white/40")}>
                PayPal : {sub.paypal_status}
              </p>
            )}
          </div>
          {sub?.plan !== "free" && sub?.plan !== "payg" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-iron-gold/15 text-iron-gold ring-1 ring-iron-gold/20">
              Actif
            </span>
          )}
        </div>

        {/* Usage bar */}
        {sub && sub.monthly_signatures_limit > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-iron-white/50">
              <span className="flex items-center gap-1"><Zap size={10} /> Signatures ce mois-ci</span>
              <span className="font-mono">
                {sub.monthly_signatures_used} / {sub.monthly_signatures_limit.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="h-1.5 bg-iron-border rounded-full overflow-hidden">
              <div
                className="h-full bg-iron-gold rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (sub.monthly_signatures_used / sub.monthly_signatures_limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Next billing */}
        {sub?.next_billing && (
          <div className="flex items-center gap-2 text-xs text-iron-white/40">
            <Calendar size={12} />
            Prochain paiement : {formatDate(sub.next_billing)}
          </div>
        )}

        {/* Last payment */}
        {sub?.last_payment?.amount?.value && (
          <div className="text-xs text-iron-white/40">
            Dernier paiement : ${sub.last_payment.amount.value}
            {sub.last_payment.time && ` — ${formatDate(sub.last_payment.time)}`}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
        >
          {showPlans ? "Masquer les plans" : "Changer de plan"}
        </button>

        {sub?.paypal_subscription_id && sub?.plan !== "free" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-iron-border text-iron-red hover:bg-iron-red/10 transition-colors disabled:opacity-40"
          >
            {cancelling ? <Loader2 size={13} className="animate-spin" /> : null}
            {cancelling ? "Annulation…" : "Annuler l'abonnement"}
          </button>
        )}

        {sub?.paypal_subscription_id && (
          <a
            href="https://www.paypal.com/myaccount/autopay/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-iron-white/50 hover:text-iron-white border border-iron-border hover:border-iron-gold/30 transition-colors"
          >
            Gérer sur PayPal
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Plan selector */}
      {showPlans && (
        <div className="rounded-2xl border border-iron-border bg-iron-black/50 p-6">
          <h3 className="text-sm font-semibold text-iron-white mb-5">Choisir un nouveau plan</h3>
          <PricingClient currentPlan={sub?.plan ?? "free"} />
        </div>
      )}
    </div>
  );
}
