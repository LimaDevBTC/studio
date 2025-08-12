import createMiddleware from 'next-intl/middleware';
import {locales, pathnames} from './config';

export default createMiddleware({
  defaultLocale: 'en',
  locales,
  pathnames,
});
 
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
