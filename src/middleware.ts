import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, pathnames } from './config';
import { isPublicRoute, isProtectedRoute, isAdminRoute } from './config/auth';

// Middleware de internacionalização
const intlMiddleware = createIntlMiddleware({
  defaultLocale: 'en',
  locales,
  pathnames,
});

// Middleware de autenticação
const authMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  
  // DEBUG: Log para verificar se está sendo executado
  console.log('🔐 MIDDLEWARE EXECUTANDO:', pathname);
  
  // Se for rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    console.log('✅ ROTA PÚBLICA:', pathname);
    return null; // Permitir que o middleware de internacionalização continue
  }
  
  // Se for rota protegida, verificar autenticação
  if (isProtectedRoute(pathname)) {
    console.log('🔒 ROTA PROTEGIDA:', pathname);
    
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    console.log('🔍 HEADERS:', { authHeader, cookieHeader });
    
    // Verificar se há token válido
    const hasValidToken = authHeader?.startsWith('Bearer ') || 
                         cookieHeader?.includes('auth-token') ||
                         cookieHeader?.includes('firebase-token');
    
    console.log('🔑 TOKEN VÁLIDO:', hasValidToken);
    
    if (!hasValidToken) {
      console.log('❌ SEM TOKEN - REDIRECIONANDO PARA LOGIN');
      // Redirecionar para login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Se for rota de admin, verificar se é admin
    if (isAdminRoute(pathname)) {
      console.log('👑 ROTA DE ADMIN:', pathname);
      // Aqui você pode implementar verificação adicional de admin
      // Por enquanto, permitimos acesso se tiver token válido
      // A verificação completa será feita no componente ProtectRoute
    }
  }
  
  console.log('✅ ACESSO PERMITIDO:', pathname);
  return null; // Permitir que o middleware de internacionalização continue
};

// Middleware principal que combina ambos
export default function middleware(request: NextRequest) {
  console.log('🚀 MIDDLEWARE PRINCIPAL EXECUTANDO');
  
  // Primeiro aplicar autenticação
  const authResponse = authMiddleware(request);
  if (authResponse) {
    console.log('🔒 RESPOSTA DE AUTENTICAÇÃO:', authResponse);
    return authResponse;
  }
  
  // Depois aplicar internacionalização (sempre)
  console.log('🌍 APLICANDO INTERNACIONALIZAÇÃO');
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
