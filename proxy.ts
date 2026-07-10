import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedPrefixes = [
  "/dashboard",
  "/lo-trinh",
  "/bai-hoc",
  "/thu-thach",
  "/tinh-huong",
  "/tai-nguyen",
  "/cong-dong",
  "/tien-do",
];
const authRoutes = ["/dang-nhap", "/dang-ky"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedPrefixes.some((prefix) => path.startsWith(prefix));
  const isAuthRoute = authRoutes.some((prefix) => path.startsWith(prefix));

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL("/dang-nhap", req.nextUrl);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
