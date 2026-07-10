import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_COOKIE_VALUE = "lottomn_admin_ok";

export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}
