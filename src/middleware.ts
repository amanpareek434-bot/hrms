import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "hrms_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employees",
  "/attendance",
  "/leaves",
  "/departments",
  "/payroll",
  "/recruitment",
  "/performance",
  "/assets",
  "/announcements",
  "/holidays",
  "/calendar",
  "/reports",
  "/documents",
  "/settings",
  "/integrations",
  "/me",
];

// Routes only admin/manager can access
const ADMIN_ONLY_PREFIXES = [
  "/dashboard",
  "/employees",
  "/attendance",
  "/leaves",
  "/departments",
  "/payroll",
  "/recruitment",
  "/performance",
  "/assets",
  "/reports",
  "/documents",
  "/settings",
  "/integrations",
];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function decodeToken(token: string | undefined): Promise<{ role?: string; employeeId?: string } | null> {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as { role?: string; employeeId?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decodeToken(token);
  const valid = !!session;

  if (startsWithAny(pathname, PROTECTED_PREFIXES) && !valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && valid) {
    const url = req.nextUrl.clone();
    const role = session?.role;
    url.pathname = role === "user" || role === "employee" ? "/me" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Role-based gating: employee role cannot access admin-only routes
  if (valid && startsWithAny(pathname, ADMIN_ONLY_PREFIXES)) {
    const role = session?.role;
    if (role === "user" || role === "employee") {
      // Employees can still open their own payslip view
      if (pathname.startsWith("/payroll/payslip/")) {
        return NextResponse.next();
      }
      const url = req.nextUrl.clone();
      url.pathname = "/me";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
