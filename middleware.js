import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isAdmin = token?.role === 'admin';

    if (isAdminRoute) {
      // If no token or not admin, force sign-in with callback back to the admin path
      if (!token || !isAdmin) {
        const url = new URL('/auth/admin-signin', req.url);
        url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(url);
      }
    }
  },
  {
    callbacks: {
      // Always run middleware; we handle redirects above
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*']
};