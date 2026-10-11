import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  checkAdminPassword,
  createAdminSessionToken,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD) {
    console.error("[auth] ADMIN_PASSWORD env var is not set");
    return NextResponse.json({ error: "Серверийн тохиргоо дутуу байна" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!(await checkAdminPassword(password))) {
    return NextResponse.json({ error: "Нууц үг буруу байна" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
