import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  readSessionFromToken,
  SESSION_COOKIE,
} from "@/lib/session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = readSessionFromToken(token);

  const isLogin =
    pathname === "/login" || pathname.startsWith("/login/");
  const isDashboard = pathname.startsWith("/dashboard");
  const isParents = pathname.startsWith("/parents");

  if (isLogin) {
    if (session?.portal === "staff") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session?.portal === "parent") {
      return NextResponse.redirect(new URL("/parents", request.url));
    }
    return NextResponse.next();
  }

  if (isDashboard) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.portal !== "staff") {
      return NextResponse.redirect(new URL("/parents", request.url));
    }
    return NextResponse.next();
  }

  if (isParents) {
    if (!session) {
      const url = new URL("/app", request.url);
      return NextResponse.redirect(url);
    }
    if (session.portal !== "parent") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/login/:path*", "/dashboard/:path*", "/parents/:path*"],
};
