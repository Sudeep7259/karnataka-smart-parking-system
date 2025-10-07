import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	const { pathname } = request.nextUrl;
	
	// Admin route protection
	if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
		if (!session) {
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}
		
		// Check admin role
		if (session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}
		
		return NextResponse.next();
	}
	
	// Customer and owner route protection
	if (pathname.startsWith("/customer") || pathname.startsWith("/owner")) {
		if (!session) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
		
		return NextResponse.next();
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/customer", "/owner", "/admin", "/admin/:path*"], // Apply middleware to specific routes
};