'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/**
 * DashboardPage — /dashboard
 *
 * Protección en dos capas:
 *   1. middleware.js  → redirección a nivel de Edge (sin cookie = fuera)
 *   2. useEffect aquí → guard client-side como segunda verificación
 *
 * Muestra el nombre, grupo sanguíneo y botón de cierre de sesión.
 */
export default function DashboardPage() {
  const router  = useRouter();
  const [usuario,   setUsuario]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      try {
        // Verificar sesión activa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.replace('/login');
          return;
        }

        // Cargar perfil del usuario desde public.usuarios
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre, email, grupo_sanguineo, fecha_registro')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('[Dashboard] Error al cargar perfil:', error);
          // Si no hay perfil, igual mostramos datos básicos de auth
          setUsuario({ nombre: session.user.email, email: session.user.email, grupo_sanguineo: '—' });
        } else {
          setUsuario(data);
        }
      } catch (err) {
        console.error('[Dashboard] Error inesperado:', err);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    cargarUsuario();
  }, [router]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('[Dashboard] Error al cerrar sesión:', err);
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"
            style={{ color: 'var(--color-primary)' }} aria-label="Cargando">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
            Cargando tu panel…
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard content ────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="section py-10">

        {/* Bienvenida */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-up">
          <div>
            <h1 className="text-3xl font-extrabold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
              Hola, {usuario?.nombre?.split(' ')[0] || 'Donante'} 👋
            </h1>
            <p className="mt-1 text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
              Bienvenido a tu panel de donaciones.
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm self-start sm:self-auto">
            Cerrar sesión
          </button>
        </div>

        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="card-flat p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}>
              Grupo sanguíneo
            </p>
            <p className="text-3xl font-extrabold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              {usuario?.grupo_sanguineo || '—'}
            </p>
          </div>

          <div className="card-flat p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}>
              Email
            </p>
            <p className="text-sm font-medium truncate"
              style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-body)' }}>
              {usuario?.email}
            </p>
          </div>

          <div className="card-flat p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}>
              Registrado el
            </p>
            <p className="text-sm font-medium"
              style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-body)' }}>
              {usuario?.fecha_registro
                ? new Date(usuario.fecha_registro).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* Placeholder próximas secciones */}
        <div className="card text-center py-12 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="text-2xl mb-2" aria-hidden="true">🩸</p>
          <h2 className="text-lg font-bold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
            Urgencias y Turnos
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
            Acá vas a ver las urgencias activas y tus turnos reservados.
          </p>
          <Link href="/#urgencias" className="btn btn-primary btn-sm">
            Ver urgencias activas
          </Link>
        </div>

      </div>
    </div>
  );
}
