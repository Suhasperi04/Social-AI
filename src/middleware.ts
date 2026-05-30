import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/account-health", "/profile-analysis", "/growth-blockers", "/winning-content", "/competitor-insights", "/content-ideas", "/best-time", "/growth-plan", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("sp_session")?.value;

  // Check if path is protected
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !session) {
    const connectUrl = new URL("/connect", request.url);
    connectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(connectUrl);
  }

  // If logged in and trying to access connect page, redirect to dashboard
  if (pathname === "/connect" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account-health/:path*",
    "/profile-analysis/:path*",
    "/growth-blockers/:path*",
    "/winning-content/:path*",
    "/competitor-insights/:path*",
    "/content-ideas/:path*",
    "/best-time/:path*",
    "/growth-plan/:path*",
    "/settings/:path*",
    "/connect",
  ],
};
