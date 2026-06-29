import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * GET /api/usuarios/verificar?email=xxx
 *
 * Verifica si existe un usuario con ese email en public.usuarios.
 * Usado por la página /recuperar para el flujo mock de reset de contraseña.
 * Usa supabaseAdmin para bypasear RLS (solo el servidor puede hacer esta consulta).
 *
 * Respuestas:
 *   200 → { existe: true | false }
 *   400 → { message: string }
 *   500 → { message: string }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Email inválido.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // devuelve null si no existe, sin lanzar error

    if (error) {
      console.error('[GET /api/usuarios/verificar] Supabase error:', error);
      return NextResponse.json(
        { message: 'Error al verificar el email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ existe: data !== null }, { status: 200 });

  } catch (unexpectedError) {
    console.error('[GET /api/usuarios/verificar] Unexpected error:', unexpectedError);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
