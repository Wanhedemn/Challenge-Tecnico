import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => { },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * POST /api/turnos
 *
 * Validation chain (order matters — fast fails first):
 *   1. Auth session (Supabase cookie)
 *   2. Body: centro_id (UUID), fecha_turno (ISO, future)
 *   3. Centro exists and is active
 *   4. User has an 'apto' triage result
 *   5. No duplicate booking on the same day at the same centro
 *
 * Respuestas:
 *   201 → { turno: { id, usuario_id, centro_id, fecha_turno, estado, estado_triage } }
 *   400 → { message: string }
 *   401 → { message: 'No autenticado' }
 *   409 → { message: 'Ya tenés un turno reservado en ese centro ese día' }
 *   422 → { message: 'Tu pre-triage indica que no podés donar en este momento' }
 *   500 → { message: string }
 */
export async function POST(request) {
  try {
    // 1. Verificar autenticación
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'No autenticado. Iniciá sesión.' }, { status: 401 });
    }

    // 2. Parsear body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Body inválido (no es JSON).' }, { status: 400 });
    }

    const { centro_id, fecha_turno, notas } = body ?? {};

    // Validación básica de campos
    if (!centro_id || typeof centro_id !== 'string') {
      return NextResponse.json({ message: 'El campo centro_id es requerido.' }, { status: 400 });
    }
    if (!fecha_turno || isNaN(new Date(fecha_turno).getTime())) {
      return NextResponse.json({ message: 'La fecha del turno no es válida.' }, { status: 400 });
    }

    // Validar que la fecha sea futura
    if (new Date(fecha_turno) <= new Date()) {
      return NextResponse.json({ message: 'La fecha del turno debe ser futura.' }, { status: 400 });
    }

    // 3. Verificar que el centro existe y está activo
    const { data: centro, error: centroError } = await supabaseAdmin
      .from('centros_donacion')
      .select('id, nombre, activo')
      .eq('id', centro_id)
      .maybeSingle();

    if (centroError || !centro) {
      return NextResponse.json({ message: 'El centro de donación no existe.' }, { status: 400 });
    }
    if (!centro.activo) {
      return NextResponse.json({ message: 'El centro de donación no está activo actualmente.' }, { status: 400 });
    }

    // 4. Verificar triage 'apto' vigente
    const { data: triage, error: triageError } = await supabaseAdmin
      .from('triage_results')
      .select('id, resultado, created_at')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (triageError) {
      console.error('[POST /api/turnos] Error al verificar triage:', triageError);
      return NextResponse.json({ message: 'Error al verificar tu aptitud médica.' }, { status: 500 });
    }

    if (!triage || triage.resultado !== 'apto') {
      return NextResponse.json(
        {
          message: triage
            ? 'Tu pre-triage indica que no podés donar en este momento. Completá un nuevo pre-triage cuando tus condiciones cambien.'
            : 'Debés completar el pre-triage antes de reservar un turno.',
        },
        { status: 422 }
      );
    }

    // 5. Verificar turno duplicado (mismo usuario, mismo centro, mismo día)
    const fechaInicioDia = new Date(fecha_turno);
    fechaInicioDia.setHours(0, 0, 0, 0);
    const fechaFinDia = new Date(fecha_turno);
    fechaFinDia.setHours(23, 59, 59, 999);

    const { data: turnoExistente } = await supabaseAdmin
      .from('turnos')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('centro_id', centro_id)
      .in('estado', ['pendiente', 'confirmado'])
      .gte('fecha_turno', fechaInicioDia.toISOString())
      .lte('fecha_turno', fechaFinDia.toISOString())
      .maybeSingle();

    if (turnoExistente) {
      return NextResponse.json(
        { message: 'Ya tenés un turno reservado en ese centro para ese día.' },
        { status: 409 }
      );
    }

    // 6. Insertar el turno
    const { data: turno, error: insertError } = await supabaseAdmin
      .from('turnos')
      .insert({
        usuario_id: user.id,
        centro_id,
        fecha_turno: new Date(fecha_turno).toISOString(),
        estado: 'pendiente',
        estado_triage: 'aprobado',  // snapshot del triage al momento de reservar
        notas: notas?.trim() || null,
      })
      .select('id, usuario_id, centro_id, fecha_turno, estado, estado_triage, created_at')
      .single();

    if (insertError) {
      console.error('[POST /api/turnos] Error al insertar turno:', insertError);
      return NextResponse.json({ message: 'Error al guardar el turno. Intentá de nuevo.' }, { status: 500 });
    }

    return NextResponse.json({ turno }, { status: 201 });

  } catch (unexpectedError) {
    console.error('[POST /api/turnos] Error inesperado:', unexpectedError);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

/**
 * Devuelve los turnos del usuario autenticado, ordenados por fecha descendente.
 * Incluye el join con centros_donacion para mostrar nombre y dirección.
 */
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('turnos')
      .select(`
        id,
        fecha_turno,
        estado,
        estado_triage,
        notas,
        created_at,
        centros_donacion ( id, nombre, direccion, telefono )
      `)
      .eq('usuario_id', user.id)
      .order('fecha_turno', { ascending: true });

    if (error) {
      console.error('[GET /api/turnos] query failed:', error);
      return NextResponse.json({ message: 'Error al obtener los turnos.' }, { status: 500 });
    }

    return NextResponse.json({ turnos: data }, { status: 200 });

  } catch (unexpectedError) {
    console.error('[GET /api/turnos] Error inesperado:', unexpectedError);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
