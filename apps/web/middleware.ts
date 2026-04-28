import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const AFFILIATE_COOKIE = "ironid_ref";
const COOKIE_MAX_AGE   = 60 * 60 * 24 * 90;

const isPublicRoute = createRouteMatcher([
  "/",
  "/verify(.*)",
  "/pricing(.*)",
  "/docs(.*)",
  "/earn(.*)",
  "/enterprise(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/v1/verify(.*)",
  "/api/enterprise-contact(.*)",
]);

function applyAffiliateCookie(req: NextRequest, res: NextResponse): NextResponse {
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Z0-9]{4,12}$/.test(ref)) {
    res.cookies.set(AFFILIATE_COOKIE, ref.toUpperCase(), {
      maxAge:   COOKIE_MAX_AGE,
      path:     "/",
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }
  return res;
}

const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const clerkActive = pubKey.startsWith("pk_test_") && pubKey !== "pk_test_placeholder"
  || pubKey.startsWith("pk_live_");

// --- Dev passthrough (no real Clerk keys) ---
function devMiddleware(req: NextRequest) {
  return applyAffiliateCookie(req, NextResponse.next());
}

// --- Production Clerk middleware ---
const clerkHandler = clerkMiddleware((auth, req: NextRequest) => {
  const response = isPublicRoute(req)
    ? NextResponse.next()
    : (() => { auth().protect(); return NextResponse.next(); })();
  return applyAffiliateCookie(req, response);
});

export default function middleware(req: NextRequest) {
  if (!clerkActive) return devMiddleware(req);
  return (clerkHandler as unknown as (req: NextRequest) => Response)(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
