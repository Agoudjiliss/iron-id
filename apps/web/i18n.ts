import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["fr", "en", "ar"] as const;
const DEFAULT_LOCALE    = "fr";

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v3.22+ — use requestLocale, fall back to default
  let locale = await requestLocale;

  if (!locale || !SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
