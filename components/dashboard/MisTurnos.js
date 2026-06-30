'use client';

import {
  ClipboardList,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Map,
} from 'lucide-react';

/**
 * MisTurnos.js
 * Props:
 *   turnos    {Array}     — Array de turnos con join a centros_donacion.
 *   onCancelar {Function} — (turnoId) => void
 *   loading   {boolean}   — Muestra skeletons mientras carga.
 */

const ICON_SM = 14;
const ICON_MD = 16;

const ESTADO_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    bg:    'var(--color-warning-light)',
    text:  'var(--color-warning)',
    Icon:  AlertCircle,
  },
  confirmado: {
    label: 'Confirmado',
    bg:    'var(--color-success-light)',
    text:  'var(--color-success)',
    Icon:  CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    bg:    'var(--color-error-light)',
    text:  'var(--color-error)',
    Icon:  XCircle,
  },
};

function EstadoVacio() {
  return (
    <div
      className="card text-center py-12"
      role="status"
      aria-label="Sin turnos agendados"
    >
      <div
        className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-border)' }}
        aria-hidden="true"
      >
        <ClipboardList size={26} style={{ color: 'var(--color-slate-mid)' }} />
      </div>
      <p
        className="text-sm font-semibold mb-1"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
      >
        No tenés turnos agendados
      </p>
      <p
        className="text-xs mb-6 max-w-xs mx-auto"
        style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}
      >
        Usá el mapa de abajo para encontrar un centro compatible con tu grupo
        sanguíneo y reservar tu primer turno.
      </p>
      <a
        href="#mapa-donacion"
        className="btn btn-outline btn-sm"
        style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}
      >
        <Map size={ICON_MD} aria-hidden="true" />
        Ver centros en el mapa
      </a>
    </div>
  );
}

function SkeletonTurno() {
  return (
    <div className="card-flat p-4 flex gap-4 animate-pulse" aria-hidden="true">
      <div
        className="flex-shrink-0 w-16 h-16 rounded-xl"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-2 rounded w-1/2" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-2 rounded w-1/3" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
      <div className="flex-shrink-0 w-24 h-6 rounded-full self-center" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  );
}

function TurnoItem({ turno, onCancelar }) {
  const cfg      = ESTADO_CONFIG[turno.estado] ?? ESTADO_CONFIG.pendiente;
  const { Icon } = cfg;
  const fecha    = new Date(turno.fecha_turno);
  const esPasado = fecha < new Date();

  return (
    <article
      className="card-flat p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity"
      style={{ opacity: esPasado ? 0.55 : 1 }}
      aria-label={`Turno en ${turno.centros_donacion?.nombre ?? 'centro'}`}
    >
      <div
        className="flex-shrink-0 text-center rounded-xl px-4 py-2.5 min-w-[68px]"
        style={{ backgroundColor: 'var(--color-primary-blush)' }}
        aria-label={`Fecha: ${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
      >
        <p
          className="text-2xl font-extrabold leading-none"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
        >
          {fecha.getDate().toString().padStart(2, '0')}
        </p>
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
        >
          {fecha.toLocaleDateString('es-AR', { month: 'short' })}
        </p>
        <p
          className="flex items-center justify-center gap-0.5 text-xs mt-0.5"
          style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}
        >
          <Clock size={ICON_SM} aria-hidden="true" />
          {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold truncate"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
        >
          {turno.centros_donacion?.nombre ?? 'Centro de donación'}
        </p>

        <p
          className="flex items-center gap-1 text-xs mt-0.5 truncate"
          style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}
        >
          <MapPin size={ICON_SM} style={{ flexShrink: 0 }} aria-hidden="true" />
          {turno.centros_donacion?.direccion ?? '—'}
        </p>

        {turno.notas && (
          <p
            className="text-xs mt-1 italic"
            style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}
          >
            "{turno.notas}"
          </p>
        )}
      </div>

      <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'var(--font-heading)' }}
        >
          <Icon size={ICON_MD} aria-hidden="true" />
          {cfg.label}
        </span>

        {turno.estado === 'pendiente' && !esPasado && onCancelar && (
          <button
            onClick={() => onCancelar(turno.id)}
            className="text-xs font-semibold transition-colors hover:underline"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}
            aria-label={`Cancelar turno del ${fecha.toLocaleDateString('es-AR')}`}
          >
            Cancelar
          </button>
        )}
      </div>
    </article>
  );
}

export default function MisTurnos({ turnos = [], onCancelar, loading = false }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando turnos">
        <SkeletonTurno />
        <SkeletonTurno />
      </div>
    );
  }

  if (turnos.length === 0) return <EstadoVacio />;

  const ahora      = new Date();
  const proximos   = turnos.filter((t) => new Date(t.fecha_turno) >= ahora && t.estado !== 'cancelado');
  const anteriores = turnos.filter((t) => new Date(t.fecha_turno) <  ahora || t.estado === 'cancelado');

  return (
    <div className="flex flex-col gap-6">

      {proximos.length > 0 && (
        <section aria-label="Próximos turnos">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}
          >
            Próximos ({proximos.length})
          </p>
          <div className="flex flex-col gap-3">
            {proximos.map((t) => <TurnoItem key={t.id} turno={t} onCancelar={onCancelar} />)}
          </div>
        </section>
      )}

      {anteriores.length > 0 && (
        <section aria-label="Historial de turnos">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-heading)' }}
          >
            Historial ({anteriores.length})
          </p>
          <div className="flex flex-col gap-3">
            {anteriores.map((t) => <TurnoItem key={t.id} turno={t} onCancelar={null} />)}
          </div>
        </section>
      )}

    </div>
  );
}
