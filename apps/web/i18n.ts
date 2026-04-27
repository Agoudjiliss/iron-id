import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED = ["fr", "en", "ar"] as const;
type Locale = typeof SUPPORTED[number];
const DEFAULT: Locale = "fr";

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = SUPPORTED.includes(raw as Locale) ? (raw as Locale) : DEFAULT;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
