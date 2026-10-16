import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, pathnames } from './config';

const LASTLINK_URL = 'https://lastlink.com/p/C9020FF58/checkout-payment/';

const PLATFORM_PATH_REGEX =
  /^\/(?:[a-z]{2}\/)?(login|iniciar-sesion|signup|cadastro|registro|dashboard|admin|create-admin|test-payment|whatsapp|contact)(?:\/|$)/i;

const intlMiddleware = createIntlMiddleware({
  defaultLocale: 'pt',
  locales,
  pathnames,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PLATFORM_PATH_REGEX.test(pathname)) {
    return NextResponse.redirect(LASTLINK_URL);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(pt|es|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
};
