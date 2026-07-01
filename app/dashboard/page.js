'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MapaDonacion from '@/components/home/MapaDonacion';
import MisTurnos from '@/components/dashboard/MisTurnos';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Droplet,
  ClipboardList,
  Map as MapIcon
} from 'lucide-react';

function TriageBanner({ triage, onIrATriage }) {
  if (!triage) {
    return (
      <div
        role="alert"
        className="rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: 'var(--color-warning-light)', border: '1px solid #FCD34D' }}
      >
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-warning)' }}>
            <AlertTriangle size={16} aria-hidden="true" /> Pre-Triage pendiente
          </p>
          <p className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-warning)' }}>
            Completá el cuestionario médico para habilitar la reserva de turnos.
          </p>
        </div>
        <button onClick={onIrATriage} className="btn btn-primary btn-sm flex-shrink-0">
          Realizar Pre-Triage →
        </button>
      </div>
    );
  }

  const isApto = triage.resultado === 'apto';
  const fecha = new Date(triage.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  if (isApto) {
    return (
      <div
        className="rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: 'var(--color-success-light)', border: '1px solid #86EFAC' }}
      >
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={16} aria-hidden="true" /> Pre-Triage aprobado
          </p>
          <p className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-success)' }}>
            Completado el {fecha}. Podés reservar turnos de donación.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--color-success)', color: '#fff', fontFamily: 'var(--font-heading)' }}>
          Apto
        </span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{ backgroundColor: 'var(--color-error-light)', border: '1px solid #FCA5A5' }}
    >
      <div>
        <p className="text-sm font-bold flex items-center gap-1.5"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-error)' }}>
          <XCircle size={16} aria-hidden="true" /> No apto en este momento
        </p>
        <p className="text-xs mt-0.5"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)' }}>
          {triage.motivo_rechazo?.split(' | ')[0] ?? 'Revisá los criterios de donación.'}{' '}
          Podés volver a realizarlo cuando cambien tus condiciones.
        </p>
      </div>
      <button onClick={onIrATriage} className="btn btn-outline btn-sm flex-shrink-0"
        style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
        Repetir Pre-Triage
      </button>
    </div>
  );
}

function PageSpinner() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"
          style={{ color: 'var(--color-primary)' }} aria-label="Cargando panel">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
          Cargando tu panel…
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [triage, setTriage] = useState(undefined);
  const [turnos, setTurnos] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function inicializar() {
      try {
        // getUser() valida el JWT contra el servidor de Supabase Auth (más seguro que getSession)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace('/login');
          return;
        }

        // Fetch en paralelo para el perfil y el triage
        const [perfilRes, triageRes] = await Promise.all([
          supabase
            .from('usuarios')
            .select('id, nombre, email, grupo_sanguineo, fecha_registro')
            .eq('id', user.id)
            .single(),

          supabase
            .from('triage_results')
            .select('id, resultado, motivo_rechazo, created_at')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        setUsuario(
          perfilRes.error
            ? { nombre: null, email: user.email, grupo_sanguineo: null }
            : perfilRes.data
        );
        setTriage(triageRes.error ? null : triageRes.data);

      } catch (err) {
        console.error('[Dashboard] Error al inicializar:', err);
        router.replace('/login');
      } finally {
        setPageLoading(false);
      }
    }

    inicializar();
  }, [router]);

  // Obtiene los turnos vía GET /api/turnos para asegurar la validación de autenticación del lado del servidor 
  // y resolver el join con centros_donacion.
  useEffect(() => {
    async function cargarTurnos() {
      setLoadingTurnos(true);
      try {
        const res = await fetch('/api/turnos');
        const data = await res.json();

        if (!res.ok) {
          console.error('[Dashboard] Error al cargar turnos:', data.message);
          return;
        }

        setTurnos(data.turnos ?? []);
      } catch (err) {
        console.error('[Dashboard] Error inesperado al cargar turnos:', err);
      } finally {
        setLoadingTurnos(false);
      }
    }

    cargarTurnos();
  }, []);

  function irATriage() {
    router.push('/triage');
  }

  async function handleCancelarTurno(turnoId) {
    if (!confirm('¿Seguro que querés cancelar este turno?')) return;
    try {
      const { error } = await supabase
        .from('turnos')
        .update({ estado: 'cancelado' })
        .eq('id', turnoId);

      if (error) {
        console.error('[Dashboard] Error al cancelar turno:', error);
        return;
      }
      setTurnos((prev) =>
        prev.map((t) => t.id === turnoId ? { ...t, estado: 'cancelado' } : t)
      );
    } catch (err) {
      console.error('[Dashboard] Error inesperado al cancelar:', err);
    }
  }

  const esApto = triage?.resultado === 'apto';
  const sinTriage = triage === null;
  const puedeReservar = esApto;
  const turnosActivos = turnos.filter((t) => t.estado !== 'cancelado').length;

  if (pageLoading) return <PageSpinner />;

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="section py-10 flex flex-col gap-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
          <div>
            <h1 className="text-3xl font-extrabold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
              Hola, {usuario?.nombre ? usuario.nombre.split(' ')[0] : 'Donante'}
            </h1>
            <p className="mt-1 text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
              Bienvenido a tu panel de donaciones DonaVida.
            </p>
          </div>
        </div>


        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <div className="card-flat p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}>
              Grupo sanguíneo
            </p>
            {usuario?.grupo_sanguineo ? (
              <p className="text-3xl font-extrabold"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                {usuario.grupo_sanguineo}
              </p>
            ) : (
              <p className="text-sm font-medium mt-2"
                style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
                No configurado
              </p>
            )}
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

          <div
            className="card-flat p-5 flex flex-col justify-between gap-3"
            style={{
              backgroundColor: sinTriage
                ? '#FEF9C3'
                : esApto
                  ? '#DCFCE7'
                  : '#FEE2E2',
              borderColor: sinTriage ? '#FCD34D' : esApto ? '#86EFAC' : '#FCA5A5',
            }}
          >
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  color: sinTriage ? '#92400E' : esApto ? '#166534' : '#991B1B',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Estado de aptitud
              </p>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  backgroundColor: sinTriage ? '#FCD34D' : esApto ? '#86EFAC' : '#FCA5A5',
                  color: sinTriage ? '#78350F' : esApto ? '#14532D' : '#7F1D1D',
                }}
              >
                {sinTriage
                  ? <><AlertTriangle size={14} /> Sin triage</>
                  : esApto
                    ? <><CheckCircle2 size={14} /> Apto</>
                    : <><XCircle size={14} /> No apto</>
                }
              </span>
            </div>

            {/* CTA integrado en la tarjeta */}
            {sinTriage && (
              <button
                onClick={irATriage}
                className="text-xs font-bold mt-1 underline underline-offset-2 text-left"
                style={{ color: '#92400E', fontFamily: 'var(--font-heading)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Completar Pre-Triage →
              </button>
            )}
            {!sinTriage && !esApto && (
              <button
                onClick={irATriage}
                className="text-xs font-bold mt-1 underline underline-offset-2 text-left"
                style={{ color: '#991B1B', fontFamily: 'var(--font-heading)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Repetir Pre-Triage →
              </button>
            )}
            {esApto && (
              <p className="text-xs mt-1" style={{ color: '#166534', fontFamily: 'var(--font-body)' }}>
                Podés reservar turnos de donación.
              </p>
            )}
          </div>
        </div>

        {/* Fin de la grilla de 3 tarjetas. Las secciones siguientes son hermanas (siblings) del grid. */}
        
        <div className="card animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                <Droplet size={20} color="var(--color-primary)" /> Reservar turno de donación
              </h2>
              <p className="text-sm"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
                {puedeReservar
                  ? 'Tu pre-triage está aprobado. Elegí un centro en el mapa y agendag tu fecha.'
                  : sinTriage
                    ? 'Completá el pre-triage para habilitar la reserva de turnos.'
                    : 'Cuando tus condiciones cambien, podrás repetir el pre-triage.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {puedeReservar ? (
                <a href="#mapa-donacion" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Ver centros en el mapa ↓
                </a>
              ) : (
                <button
                  disabled
                  title={sinTriage ? 'Primero completá el pre-triage' : 'Pre-triage no apto'}
                  className="btn btn-primary"
                  style={{ opacity: 0.4, cursor: 'not-allowed', transform: 'none' }}
                  aria-disabled="true"
                >
                  Reservar turno
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
              <ClipboardList size={20} /> Mis próximos turnos
            </h2>
            {turnosActivos > 0 && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary-blush)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {turnosActivos} activo{turnosActivos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <MisTurnos
            turnos={turnos}
            onCancelar={handleCancelarTurno}
            loading={loadingTurnos}
          />
        </div>

        <div id="mapa-donacion" className="animate-fade-up" style={{ animationDelay: '180ms' }}>
          <MapaDonacion
            grupoSanguineo={usuario?.grupo_sanguineo}
            estadoTriage={triage?.resultado}
          />
        </div>

      </div>
    </div>
  );
}

