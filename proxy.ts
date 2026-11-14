import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "bg"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  // Bulgarian browsers land on /bg, everyone else on /en.
  const accept = request.headers.get("accept-language") ?? "";
  const locale = /^\s*bg\b/i.test(accept) ? "bg" : "en";
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
