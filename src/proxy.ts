import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  readSessionFromToken,
  SESSION_COOKIE_PARENT,
  SESSION_COOKIE_STAFF,
} from "@/lib/session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const staffSession = readSessionFromToken(
    request.cookies.get(SESSION_COOKIE_STAFF)?.value,
  );
  const parentSession = readSessionFromToken(
    request.cookies.get(SESSION_COOKIE_PARENT)?.value,
  );

  const isStaffLogin = pathname === "/login";
  const isParentLogin =
    pathname === "/login/parent" || pathname.startsWith("/login/parent/");
  const isDashboard = pathname.startsWith("/dashboard");
  const isParents = pathname.startsWith("/parents");

  if (isStaffLogin) {
    if (staffSession?.portal === "staff") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isParentLogin) {
    if (parentSession?.portal === "parent") {
      return NextResponse.redirect(new URL("/parents", request.url));
    }
    return NextResponse.next();
  }

  if (isDashboard) {
    if (!staffSession || staffSession.portal !== "staff") {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isParents) {
    if (!parentSession || parentSession.portal !== "parent") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/login/:path*", "/dashboard/:path*", "/parents/:path*"],
};
