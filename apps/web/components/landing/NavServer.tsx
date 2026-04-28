import { getLocale, getTranslations } from "next-intl/server";
import { Nav } from "./Nav";

export async function NavServer() {
  const locale = await getLocale();
  const t = await getTranslations("landingNav");

  const links = [
    { href: "/#features",  label: t("features") },
    { href: "/#how",       label: t("howItWorks") },
    { href: "/pricing",    label: t("pricing") },
    { href: "/enterprise", label: t("enterprise") },
    { href: "/earn",       label: t("affiliate") },
    { href: "/docs",       label: t("docs") },
  ];

  return (
    <Nav
      locale={locale}
      links={links}
      cta={{ signIn: t("signIn"), signUp: t("signUp") }}
    />
  );
}
