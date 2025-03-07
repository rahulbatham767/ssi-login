import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("userToken")?.value;
    const url = request.nextUrl;

    const requestedPath = url.pathname;

  console.log("Token:", token);

  // Define protected routes (accessible only if authenticated)
  const protectedRoutes = [
    "/connection",
    "/dashboard",
    "/credentials",
    "/settings",
    "/issuing",
  ];

  // Redirect logged-in users trying to access login or signup
  if (token && ["/login", "/signup"].includes(requestedPath)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Restrict access to protected routes if the user is not authenticated
  if (!token && protectedRoutes.includes(requestedPath)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    "/connection",
    "/dashboard",
    "/credentials",
    "/settings",
    "/issuing",
    "/login",
    "/signup",
  ],
};
