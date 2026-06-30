'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';
import { AlertTriangle, PartyPopper, Building2, MapPin, Clock, Phone } from 'lucide-react';

function formatFecha(isoString) {
  return new Date(isoString).toLocaleDateString('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatHora(isoString) {
  return new Date(isoString).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });
}

// datetime-local requiere formato 'YYYY-MM-DDTHH:MM'. La fecha mínima es dentro de 1 hora.
function minFechaISO() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function ReservaForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const centroId     = searchParams.get('centro_id');

  const [centro,     setCentro]     = useState(null);
  const [triage,     setTriage]     = useState(undefined);
  const [fechaTurno, setFechaTurno] = useState('');
  const [notas,      setNotas]      = useState('');
  const [status,     setStatus]     = useState('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [pageReady,  setPageReady]  = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      if (!centroId) { router.replace('/dashboard'); return; }

      const [centroRes, triageRes] = await Promise.all([
        supabase
          .from('centros_donacion')
          .select('id, nombre, descripcion, direccion, telefono, horario, grupos_compatibles')
          .eq('id', centroId)
          .eq('activo', true)
          .single(),

        supabase
          .from('triage_results')
          .select('id, resultado, motivo_rechazo, created_at')
          .eq('usuario_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (centroRes.error || !centroRes.data) {
        setErrorMsg('Centro de donación no encontrado.');
        setPageReady(true);
        return;
      }

      setCentro(centroRes.data);
      setTriage(triageRes.data ?? null);
      setPageReady(true);
    }

    init();
  }, [centroId, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!fechaTurno) {
      setErrorMsg('Seleccioná una fecha y hora para el turno.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/turnos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          centro_id:   centroId,
          fecha_turno: new Date(fechaTurno).toISOString(),
          notas:       notas || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Error al reservar el turno.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('No se pudo conectar con el servidor. Verificá tu conexión.');
      setStatus('error');
    }
  }

  if (!pageReady) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"
          style={{ color: 'var(--color-primary)' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
          Cargando datos del centro…
        </p>
      </div>
    );
  }

  if (errorMsg && !centro) {
    return (
      <div className="card text-center py-12 flex flex-col items-center">
        <AlertTriangle size={32} color="var(--color-error)" className="mb-2" aria-hidden="true" />
        <p className="text-sm mb-4" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}>
          {errorMsg}
        </p>
        <Link href="/dashboard" className="btn btn-outline btn-sm">
          ← Volver al panel
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="card text-center py-12 animate-fade-up flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--color-success-light)' }}
        >
          <PartyPopper size={32} color="var(--color-success)" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)' }}>
          ¡Turno reservado!
        </h2>
        <p className="text-sm mb-1"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Tu turno en <strong>{centro?.nombre}</strong>
        </p>
        <p className="text-sm mb-6"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          {fechaTurno && `${formatFecha(fechaTurno)} a las ${formatHora(fechaTurno)}`}
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Ver mis turnos en el panel
        </Link>
      </div>
    );
  }

  const isApto    = triage?.resultado === 'apto';
  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">

      <div className="card animate-fade-up">
        <div className="flex items-start gap-3">
          <Building2 size={24} color="var(--color-navy)" className="flex-shrink-0 mt-1" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-extrabold leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
            >
              {centro?.nombre}
            </h2>
            <p className="text-sm mt-0.5 flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
              <MapPin size={14} aria-hidden="true" /> {centro?.direccion}
            </p>
            {centro?.horario && (
              <p className="text-xs mt-1 flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}>
                <Clock size={12} aria-hidden="true" /> {centro.horario}
              </p>
            )}
            {centro?.telefono && (
              <p className="text-xs mt-0.5 flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}>
                <Phone size={12} aria-hidden="true" /> {centro.telefono}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {centro?.grupos_compatibles?.map((g) => (
                <span key={g}
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--color-primary-blush)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {triage !== undefined && !isApto && (
        <div
          className="rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            backgroundColor: triage === null ? 'var(--color-warning-light)' : 'var(--color-error-light)',
            border: `1px solid ${triage === null ? '#FCD34D' : '#FCA5A5'}`,
          }}
        >
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5"
              style={{
                fontFamily: 'var(--font-heading)',
                color: triage === null ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
              <AlertTriangle size={16} aria-hidden="true" />
              {triage === null ? 'Pre-Triage pendiente' : 'No apto para donar'}
            </p>
            <p className="text-xs mt-0.5"
              style={{
                fontFamily: 'var(--font-body)',
                color: triage === null ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
              {triage === null
                ? 'Completá el pre-triage para habilitar la reserva de turnos.'
                : 'Tu pre-triage actual no te habilita para donar. Podés volver a realizarlo.'}
            </p>
          </div>
          <Link href="/triage" className="btn btn-primary btn-sm flex-shrink-0">
            {triage === null ? 'Hacer Pre-Triage' : 'Volver a hacer el Pre-Triage'}
          </Link>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="card animate-fade-up"
        style={{ animationDelay: '60ms' }}
        aria-label="Formulario de reserva de turno"
      >
        <h3 className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Elegí fecha y hora
        </h3>

        {errorMsg && status === 'error' && (
          <div role="alert"
            className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div className="form-group">
            <label htmlFor="fecha-turno" className="form-label">
              Fecha y hora del turno
            </label>
            <input
              id="fecha-turno"
              type="datetime-local"
              className="form-input"
              min={minFechaISO()}
              value={fechaTurno}
              onChange={(e) => setFechaTurno(e.target.value)}
              disabled={!isApto || isLoading}
              required
              aria-required="true"
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
              Respetá el horario de atención del centro: {centro?.horario || 'consultá con el centro'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="notas-turno" className="form-label">
              Notas (opcional)
            </label>
            <textarea
              id="notas-turno"
              className="form-input"
              rows={3}
              placeholder="Ej: Primera donación, necesito asistencia especial…"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={!isApto || isLoading}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={!isApto || isLoading}
            className="btn btn-primary flex-1"
            style={(!isApto || isLoading) ? { opacity: 0.5, cursor: 'not-allowed', transform: 'none' } : {}}
            title={!isApto ? 'Completá el pre-triage para habilitar esta opción' : ''}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Reservando…
              </>
            ) : (
              'Confirmar reserva'
            )}
          </button>
          <Link href="/dashboard" className="btn btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>

    </div>
  );
}

export default function ReservarPage() {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(192,21,42,0.06) 0%, transparent 60%), var(--color-bg)',
      }}
    >
      <div className="w-full max-w-xl mb-6 animate-fade-up">
        <nav aria-label="Navegación" className="flex items-center gap-2 text-xs"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Panel
          </Link>
          <span aria-hidden="true">›</span>
          <span>Reservar turno</span>
        </nav>
      </div>

      <div className="w-full max-w-xl mb-6 animate-fade-up" style={{ animationDelay: '30ms' }}>
        <h1 className="text-3xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Agendar turno
        </h1>
        <p className="mt-1 text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Seleccioná una fecha y hora disponible en el centro seleccionado.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center gap-2 py-8">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"
            style={{ color: 'var(--color-primary)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
            Cargando…
          </span>
        </div>
      }>
        <ReservaForm />
      </Suspense>
    </div>
  );
}
