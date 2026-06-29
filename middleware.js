import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * middleware.js — Protección de rutas con @supabase/ssr
 *
 * Por qué era necesario cambiar de la implementación anterior:
 *   ❌ ANTES: verificaba una cookie hardcodeada ('sb-[ref]-auth-token')
 *             que el cliente estándar (@supabase/supabase-js) NUNCA setea
 *             porque usa localStorage, inaccesible desde el Edge Runtime.
 *
 *   ✅ AHORA: usa createServerClient de @supabase/ssr, que lee y propaga
 *             las cookies de sesión correctamente en el Edge Runtime.
 *             Llama a supabase.auth.getUser() para verificar la sesión.
 *
 * IMPORTANTE: siempre retornar `supabaseResponse` (no NextResponse.next() crudo)
 * para que @supabase/ssr pueda refrescar los tokens de sesión en los headers.
 */

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES      = ['/login', '/registro', '/recuperar', '/reset-password'];

export async function middleware(request) {
  // Respuesta base que el middleware devolverá
  let supabaseResponse = NextResponse.next({ request });

  // Crear el cliente de Supabase para el servidor/edge con acceso a cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Lee todas las cookies del request entrante
        getAll() {
          return request.cookies.getAll();
        },
        // Escribe las cookies tanto en el request como en la response
        // Esto es necesario para que el token de sesión se propague correctamente
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: usar getUser() (no getSession()) en el middleware.
  // getUser() valida el token contra el servidor de Supabase Auth, más seguro.
  // getSession() solo lee la cookie local y puede ser manipulada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Rutas protegidas → redirigir a /login si no hay usuario autenticado
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Rutas de auth → redirigir a /dashboard si el usuario ya tiene sesión
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // CRÍTICO: retornar supabaseResponse (no NextResponse.next() directo)
  // para que @supabase/ssr propague los headers de refresco de token.
  return supabaseResponse;
}

// El middleware solo se ejecuta en estas rutas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/registro',
    '/recuperar',
    '/reset-password',
  ],
};
