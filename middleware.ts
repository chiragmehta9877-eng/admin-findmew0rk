import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ MATCHER: Ye define karta hai ki Middleware kahan-kahan chalega
export const config = {
  // Sab jagah chalo, SIVAYE:
  // 1. /api routes (taaki settings check fail na ho)
  // 2. /admin routes (taaki Admin kabhi lock na ho)
  // 3. Static files (images, favicon)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // 1. Status Check karo (Cache Disabled)
    const checkUrl = new URL(`/api/settings/check?t=${Date.now()}`, request.url);
    const response = await fetch(checkUrl, { cache: 'no-store' });
    
    // Agar API fail ho jaye, toh site chalne do (Block mat karo)
    if (!response.ok) return NextResponse.next();

    const data = await response.json();
    const isMaintenance = data.isMaintenance === true;

    // 🔴 CASE: Maintenance ON hai
    if (isMaintenance) {
      // Agar user pehle se '/maintenance' par hai, toh rehne do
      if (pathname === '/maintenance') {
        return NextResponse.next();
      }
      // Baki sabko Maintenance page par bhejo
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // 🟢 CASE: Maintenance OFF (Live)
    if (!isMaintenance) {
      // Agar user galti se '/maintenance' par hai, toh Home bhejo
      if (pathname === '/maintenance') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.next();
  }
}