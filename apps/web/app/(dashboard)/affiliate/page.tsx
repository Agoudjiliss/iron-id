import { Shield } from "lucide-react";
import { AffiliateWidget } from "@/components/affiliate/AffiliateWidget";
import { CommissionsTable } from "@/components/affiliate/CommissionsTable";

export const metadata = {
  title: "Affiliation — IronID",
  description: "Gérez votre programme de parrainage et suivez vos commissions.",
};

export default function AffiliatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-iron-gold/10 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-iron-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-iron-white">Programme d'affiliation</h1>
          <p className="mt-1 text-sm text-iron-white/40">
            Parrainez des utilisateurs, gagnez des commissions récurrentes. Plus vous parrainer, plus votre taux augmente.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            step: "01",
            title: "Partagez votre lien",
            desc: "Chaque visite via votre lien pose un cookie de 90 jours (dernier-clic).",
          },
          {
            step: "02",
            title: "Le visiteur souscrit",
            desc: "Lorsqu'il crée un compte payant, la vente vous est automatiquement attribuée.",
          },
          {
            step: "03",
            title: "Recevez vos commissions",
            desc: "Paiement PayPal automatique 30 jours après chaque vente (min. 1,00 $).",
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-iron-slate border border-iron-border rounded-2xl p-4">
            <span className="text-xs font-bold text-iron-gold/40 mono">{step}</span>
            <h3 className="mt-1.5 text-sm font-semibold text-iron-white">{title}</h3>
            <p className="mt-1 text-xs text-iron-white/40 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Tier table */}
      <div className="bg-iron-slate border border-iron-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-iron-border">
          <h2 className="text-sm font-semibold text-iron-white">Paliers & commissions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-iron-white/30 border-b border-iron-border/50">
              <th className="text-left px-5 py-3 font-medium">Niveau</th>
              <th className="text-right px-5 py-3 font-medium">Filleuls actifs requis</th>
              <th className="text-right px-5 py-3 font-medium">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-border/30">
            {[
              { name: "Iron",     required: 0,   rate: "10%",  color: "text-iron-white/50" },
              { name: "Bronze",   required: 5,   rate: "12%",  color: "text-amber-400"     },
              { name: "Silver",   required: 15,  rate: "15%",  color: "text-slate-300"     },
              { name: "Gold",     required: 30,  rate: "17%",  color: "text-iron-gold"     },
              { name: "Platinum", required: 50,  rate: "20%",  color: "text-purple-400"    },
            ].map((tier) => (
              <tr key={tier.name} className="hover:bg-iron-border/10 transition-colors">
                <td className={`px-5 py-3 font-semibold ${tier.color}`}>{tier.name}</td>
                <td className="px-5 py-3 text-right text-iron-white/50">
                  {tier.required === 0 ? "Dès l'inscription" : `${tier.required}+`}
                </td>
                <td className="px-5 py-3 text-right font-bold text-iron-gold">{tier.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live widget */}
      <AffiliateWidget />

      {/* Commissions history */}
      <CommissionsTable />
    </div>
  );
}
