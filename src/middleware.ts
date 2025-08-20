import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, pathnames } from './config';

// Middleware de internacionalização
const intlMiddleware = createIntlMiddleware({
  defaultLocale: 'en',
  locales,
  pathnames,
});

// Middleware simplificado - apenas internacionalização
// A autenticação será controlada pelos componentes React
export default function middleware(request: NextRequest) {
  // Aplicar apenas internacionalização
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(pt|es|en)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
