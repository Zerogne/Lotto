import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

function isProtectedApiRequest(pathname: string, method: string): boolean {
  return (
    (pathname === "/api/lotteries" && method === "POST") ||
    (/^\/api\/lotteries\/[^/]+$/.test(pathname) && (method === "PUT" || method === "DELETE")) ||
    (/^\/api\/draw\/[^/]+$/.test(pathname) && method === "POST") ||
    (pathname === "/api/tickets/approve" && method === "POST") ||
    (pathname === "/api/tickets/refund" && method === "POST") ||
    (pathname === "/api/pending" && method === "GET") ||
    (pathname === "/api/tickets" && method === "GET") ||
    (pathname === "/api/tickets/export" && method === "GET") ||
    (pathname === "/api/sms/failed" && method === "GET") ||
    (pathname === "/api/sms/resend" && method === "POST") ||
    (pathname === "/api/upload/sign" && method === "POST") ||
    (pathname === "/api/setup" && method === "POST") ||
    (pathname === "/api/winners" && method === "GET")
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAdminRequest(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtectedApiRequest(pathname, req.method) && !isAdminRequest(req)) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
