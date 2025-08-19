// Configuração de rotas e autenticação
export const AUTH_CONFIG = {
  // Rotas públicas que não precisam de autenticação
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/signup',
    '/iniciar-sesion',
    '/registro',
    '/cadastro',
    '/contact',
    '/contacto',
    '/contato',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/images',
    '/public'
  ],
  
  // Rotas que precisam de autenticação
  PROTECTED_ROUTES: [
    '/dashboard',
    '/admin'
  ],
  
  // Rotas que precisam de admin
  ADMIN_ROUTES: [
    '/admin'
  ],
  
  // Rotas de API que precisam de autenticação
  PROTECTED_API_ROUTES: [
    '/api/courses',
    '/api/users',
    '/api/admin',
    '/api/transactions'
  ],
  
  // Tempo de expiração da sessão (em minutos)
  SESSION_TIMEOUT: 30,
  
  // Número máximo de tentativas de login
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Tempo de bloqueio após muitas tentativas (em minutos)
  LOGIN_BLOCK_TIME: 15
};

// Funções de validação
export const isPublicRoute = (pathname: string): boolean => {
  return AUTH_CONFIG.PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

export const isProtectedRoute = (pathname: string): boolean => {
  return AUTH_CONFIG.PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
};

export const isAdminRoute = (pathname: string): boolean => {
  return AUTH_CONFIG.ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
};

export const isProtectedApiRoute = (pathname: string): boolean => {
  return AUTH_CONFIG.PROTECTED_API_ROUTES.some(route => 
    pathname.startsWith(route)
  );
};
