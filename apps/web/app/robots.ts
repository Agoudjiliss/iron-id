import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/earn", "/docs", "/verify", "/sign-up", "/sign-in"],
        disallow: ["/dashboard", "/certify", "/certifications", "/keys", "/billing", "/usage", "/affiliate", "/api/"],
      },
    ],
    sitemap: "https://www.iron-id.io/sitemap.xml",
  };
}
