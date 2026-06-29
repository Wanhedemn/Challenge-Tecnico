import { NextResponse } from 'next/server';
// ⚠️  Usamos el cliente ADMIN (service_role) para bypasear RLS en el servidor.
//     NUNCA exponer supabaseAdmin en componentes 'use client'.
import { supabaseAdmin } from '@/lib/supabase-server';

// ─── Constantes de validación ─────────────────────────────────────────────────

const GRUPOS_VALIDOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── POST /api/usuarios ───────────────────────────────────────────────────────

/**
 * Registra un nuevo donante en la tabla `public.usuarios`.
 *
 * Body esperado (JSON):
 *   { nombre: string, email: string, grupo_sanguineo: string }
 *
 * Respuestas:
 *   201 → { usuario: { id, nombre, email, grupo_sanguineo, fecha_registro } }
 *   400 → { message: string }    (validación fallida)
 *   409 → { message: string }    (email duplicado)
 *   500 → { message: string }    (error interno de DB)
 */
export async function POST(request) {
  try {
    // 1. Parsear y validar el body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: 'El cuerpo de la solicitud no es un JSON válido.' },
        { status: 400 }
      );
    }

    const { nombre, email, grupo_sanguineo } = body ?? {};

    // Validación server-side (segunda línea de defensa)
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return NextResponse.json(
        { message: 'El nombre debe tener al menos 2 caracteres.' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: 'El email proporcionado no es válido.' },
        { status: 400 }
      );
    }

    if (!GRUPOS_VALIDOS.includes(grupo_sanguineo)) {
      return NextResponse.json(
        { message: 'El grupo sanguíneo no es válido.' },
        { status: 400 }
      );
    }

    // 2. Insertar en Supabase (cliente admin — bypasea RLS)
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          nombre:          nombre.trim(),
          email:           email.trim().toLowerCase(),
          grupo_sanguineo: grupo_sanguineo,
        },
      ])
      .select('id, nombre, email, grupo_sanguineo, fecha_registro')
      .single();

    // 3. Manejo de errores de Supabase / PostgreSQL
    if (error) {
      // Código 23505 = unique_violation (email duplicado)
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Este email ya está registrado.', code: error.code },
          { status: 409 }
        );
      }

      // Cualquier otro error de base de datos
      console.error('[POST /api/usuarios] Supabase error:', error);
      return NextResponse.json(
        { message: 'Error al guardar el usuario. Intentá de nuevo más tarde.' },
        { status: 500 }
      );
    }

    // 4. Respuesta exitosa
    return NextResponse.json({ usuario: data }, { status: 201 });

  } catch (unexpectedError) {
    // Error completamente inesperado — jamás debe llegar al cliente sin manejo
    console.error('[POST /api/usuarios] Unexpected error:', unexpectedError);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/usuarios ────────────────────────────────────────────────────────

/**
 * Devuelve el listado de todos los usuarios registrados.
 * (Útil para el dashboard de administración en futuras iteraciones.)
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, grupo_sanguineo, fecha_registro')
      .order('fecha_registro', { ascending: false });

    if (error) {
      console.error('[GET /api/usuarios] Supabase error:', error);
      return NextResponse.json(
        { message: 'Error al obtener los usuarios.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios: data }, { status: 200 });

  } catch (unexpectedError) {
    console.error('[GET /api/usuarios] Unexpected error:', unexpectedError);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
