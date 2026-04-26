"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

const COOKIE_NAME = "ironid_ref";

/**
 * ReferralTracker — mounted once in the dashboard layout.
 *
 * Flow:
 *   1. Middleware captures ?ref=XXXX → cookie `ironid_ref` (90 days, not httpOnly).
 *   2. After sign-up/sign-in, user lands on /dashboard → this component mounts.
 *   3. We read the cookie directly from document.cookie (JS-accessible).
 *   4. Push the code into Clerk unsafeMetadata via user.update().
 *   5. Clerk fires user.updated webhook → backend attributes the referral.
 *   6. Cookie is cleared so we never double-attribute.
 */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? match.split("=")[1] : null;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

export function ReferralTracker() {
  const { user, isLoaded } = useUser();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || attempted.current) return;
    attempted.current = true;

    const refCode = readCookie(COOKIE_NAME);
    if (!refCode) return;

    // Already attributed — don't overwrite
    const already = (user.unsafeMetadata as Record<string, unknown>)?.ref_code;
    if (already) {
      clearCookie(COOKIE_NAME);
      return;
    }

    user
      .update({ unsafeMetadata: { ref_code: refCode } })
      .then(() => {
        clearCookie(COOKIE_NAME);
      })
      .catch((err: unknown) => {
        console.warn("[ReferralTracker] Failed to set ref_code:", err);
      });
  }, [isLoaded, user]);

  return null;
}
