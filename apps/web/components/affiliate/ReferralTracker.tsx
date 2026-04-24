"use client";

import { useEffect, useRef } from "react";

// Lazy-import Clerk hook — gracefully degrades when ClerkProvider is absent
function useSafeUser() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useUser } = require("@clerk/nextjs");
    return useUser();
  } catch {
    return { user: null, isLoaded: true };
  }
}

/**
 * ReferralTracker — mounted once in the dashboard layout.
 *
 * Flow:
 *   1. Middleware captures ?ref=XXXX → cookie `ironid_ref` (90 days).
 *   2. Sign-up page moves cookie value into sessionStorage as `ironid_pending_ref`.
 *   3. After sign-up Clerk redirects to /dashboard → this component mounts.
 *   4. We read the pending ref, push it into Clerk unsafeMetadata via user.update().
 *   5. Clerk fires a `user.updated` webhook → backend attributes the referral.
 *   6. sessionStorage key is cleared so we never double-attribute.
 */
export function ReferralTracker() {
  const { user, isLoaded } = useSafeUser();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || attempted.current) return;
    attempted.current = true;

    const pending = sessionStorage.getItem("ironid_pending_ref");
    if (!pending) return;

    // Only set if not already attributed (check unsafeMetadata)
    const already = (user.unsafeMetadata as Record<string, unknown>)?.ref_code;
    if (already) {
      sessionStorage.removeItem("ironid_pending_ref");
      return;
    }

    user
      .update({ unsafeMetadata: { ref_code: pending } })
      .then(() => {
        sessionStorage.removeItem("ironid_pending_ref");
      })
      .catch((err) => {
        // Non-fatal — don't block the dashboard
        console.warn("[ReferralTracker] Failed to set ref_code:", err);
      });
  }, [isLoaded, user]);

  return null; // renders nothing
}
