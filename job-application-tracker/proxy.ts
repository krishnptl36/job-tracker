import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("better-auth.session_token")?.value;

    const isProtected = pathname.startsWith("/dashboard");
    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};