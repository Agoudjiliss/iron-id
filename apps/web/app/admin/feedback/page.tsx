"use client";

import { useEffect, useState } from "react";
import { useAdminKey, adminFetch } from "../layout";
import { PageShell, Spinner } from "../page";
import { MessageSquare, Star, CheckCircle } from "lucide-react";

interface Feedback {
  id: number;
  email: string;
  company: string | null;
  rating: number | null;
  performance_score: number | null;
  message: string;
  use_case: string | null;
  volume_estimate: string | null;
  ready_to_sign: boolean;
  created_at: string;
}

function Stars({ n }: { n: number | null }) {
  if (!n) return <span className="text-iron-white/25 text-xs">—</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= n ? "text-iron-gold fill-iron-gold" : "text-iron-border"}
        />
      ))}
    </span>
  );
}

export default function AdminFeedback() {
  const key = useAdminKey();
  const [items, setItems]   = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    adminFetch("/v1/admin/feedback", key)
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) return <PageShell title="Enterprise Feedback"><Spinner /></PageShell>;

  return (
    <PageShell title={`Enterprise Feedback (${items.length})`}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-iron-white/30">
          <MessageSquare size={32} className="mb-3" />
          <p className="text-sm">No feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-iron-border bg-iron-slate overflow-hidden"
            >
              {/* Header row */}
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-iron-black/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-iron-white">{item.email}</span>
                    {item.company && (
                      <span className="text-xs text-iron-white/40">· {item.company}</span>
                    )}
                    {item.ready_to_sign && (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                        <CheckCircle size={11} /> Ready to sign
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-iron-white/40 mt-0.5 truncate">{item.message}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Stars n={item.rating} />
                  <span className="text-xs text-iron-white/30">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>

              {/* Expanded */}
              {expanded === item.id && (
                <div className="px-5 pb-5 border-t border-iron-border/50 pt-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-iron-white/30 mb-0.5">Use case</p>
                      <p className="text-iron-white">{item.use_case ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-iron-white/30 mb-0.5">Volume</p>
                      <p className="text-iron-white">{item.volume_estimate ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-iron-white/30 mb-0.5">Satisfaction</p>
                      <Stars n={item.rating} />
                    </div>
                    <div>
                      <p className="text-iron-white/30 mb-0.5">Perf. score</p>
                      <Stars n={item.performance_score} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-iron-white/30 mb-1">Message</p>
                    <p className="text-sm text-iron-white/70 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                  </div>
                  <a
                    href={`mailto:${item.email}?subject=IronID Enterprise — follow-up`}
                    className="inline-flex items-center gap-1.5 text-xs text-iron-gold hover:text-iron-gold/80 transition-colors"
                  >
                    Reply to {item.email} →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
