import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/auth/session-options";

const CONSULTANT_ALLOWED_PREFIXES = ["/calendar", "/reports"];

async function getRoleFromRequest(request: NextRequest) {
  const cookie = request.cookies.get(sessionOptions.cookieName)?.value;
  if (!cookie) return undefined;
  try {
    const data = await unsealData<SessionData>(cookie, {
      password: sessionOptions.password,
    });
    return data.role;
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await getRoleFromRequest(request);

  if (pathname === "/login") {
    if (role) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/calendar", request.url));
  }

  if (
    role === "consultant" &&
    !CONSULTANT_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.redirect(new URL("/calendar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
