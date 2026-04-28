"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Kept for backward compatibility only.
// The LanguageSwitcher now sets the cookie directly from the browser
// and uses window.location.href for a guaranteed fresh server render.
export async function setLocale(locale: string) {
  const supported = ["fr", "en", "ar"];
  if (!supported.includes(locale)) return;
  cookies().set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  revalidatePath("/docs");
  revalidatePath("/pricing");
  revalidatePath("/earn");
  revalidatePath("/enterprise");
}
