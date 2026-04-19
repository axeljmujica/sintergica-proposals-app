import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === '/login';
  const isAuthRoute = pathname.startsWith('/api/auth');

  if (isAuthRoute) return NextResponse.next();
  if (isLoginPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }
  if (!isLoggedIn) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)$).*)'],
};
