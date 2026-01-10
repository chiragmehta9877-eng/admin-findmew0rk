import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Yahan hum role-based logic bhi laga sakte hain agar future me chahiye
    // Abhi ke liye ye bas check karega ki user logged in hai ya nahi
    const token = req.nextauth.token;
    
    // Agar user logged in hai par role 'user' hai (Admin nahi hai), 
    // toh use wapas bhej do ya error dikha do.
    if (req.nextUrl.pathname.startsWith("/dashboard") && 
        token?.role !== "admin" && 
        token?.role !== "super_admin") {
        
        // Option A: Unhe Login page par wapas bhej do
        // return NextResponse.rewrite(new URL("/login?error=AccessDenied", req.url));
        
        // Option B (Better): Unhe Login page par redirect karo
        return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
  },
  {
    callbacks: {
      // ✅ Gatekeeper Logic:
      // Agar 'authorized' true return karega, tabhi banda andar jayega.
      // Agar false return karega, toh wo automatic '/login' pe jayega.
      authorized: ({ token }) => !!token,
    },
  }
);

// 🔥 Config: Kis kis page ko protect karna hai?
export const config = {
  matcher: [
    "/dashboard/:path*", // Dashboard ke andar ke saare pages
    "/api/users/:path*"  // Users API ko bhi protect kar lo
  ],
};