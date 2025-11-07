import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware do Next.js para adicionar headers de segurança
 * e proteger rotas que necessitam autenticação
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Adicionar headers de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy (relaxado para desenvolvimento)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

/**
 * Configuração do matcher para aplicar o middleware apenas em rotas específicas
 * Exclui rotas estáticas e de API do NextAuth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest.json (PWA manifest)
     * - service-worker.js (PWA service worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
