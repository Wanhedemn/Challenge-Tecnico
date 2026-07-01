'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Droplet, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// ─── Paleta de urgencia ───────────────────────────────────────────────────────
const CONFIG_URGENCIA = {
  Alta:  { clase: 'badge-error',   pulso: true  },
  Media: { clase: 'badge-warning', pulso: false },
  Baja:  { clase: 'badge-success', pulso: false },
};

// ─── Colores de grupo sanguíneo ───────────────────────────────────────────────
const COLORES_GRUPO = {
  'O-': '#7C3AED', 'O+': '#2563EB',
  'A-': '#C0152A', 'A+': '#DB2777',
  'B-': '#059669', 'B+': '#0891B2',
  'AB-': '#D97706', 'AB+': '#9333EA',
};

// ─── Fallback de imagen por hospital ─────────────────────────────────────────
const IMAGEN_FALLBACK = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80';

// ─── Tarjeta de urgencia ──────────────────────────────────────────────────────
function UrgenciaCard({ urgencia, onDonar }) {
  const cfg     = CONFIG_URGENCIA[urgencia.nivel_urgencia] ?? CONFIG_URGENCIA['Media'];
  const color   = COLORES_GRUPO[urgencia.grupo_requerido] ?? 'var(--color-primary)';
  const imgSrc  = urgencia.imagen_url || IMAGEN_FALLBACK;

  return (
    <article
      className="flex-shrink-0 w-72 sm:w-64 flex flex-col rounded-[14px] bg-white overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        scrollSnapAlign: 'start',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Imagen */}
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`Imagen de ${urgencia.hospital_nombre}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== IMAGEN_FALLBACK) {
              e.target.src = IMAGEN_FALLBACK;
            }
          }}
        />
        {/* Badge de urgencia sobre la imagen */}
        <div className="absolute top-3 left-3">
          <span className={`${cfg.clase} flex items-center gap-1`}>
            {cfg.pulso && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'currentColor' }}
              />
            )}
            {urgencia.nivel_urgencia}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p
            className="text-sm font-bold leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
          >
            {urgencia.hospital_nombre}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
          >
            Solicitud activa
          </p>
        </div>

        {/* Badge de grupo sanguíneo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${color}18` }}
          >
            <Droplet size={13} style={{ color }} aria-hidden="true" />
            <span
              className="text-sm font-extrabold"
              style={{ fontFamily: 'var(--font-heading)', color }}
            >
              {urgencia.grupo_requerido}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
          >
            requerido
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onDonar(urgencia)}
          className="btn btn-primary btn-sm mt-auto w-full"
        >
          Donar ahora
        </button>
      </div>
    </article>
  );
}

// ─── Esqueleto de carga ───────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 w-72 sm:w-64 rounded-[14px] overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <div className="h-36 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-7 w-24 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-8 w-full rounded-[10px] animate-pulse mt-auto" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function UrgenciasHome() {
  const router            = useRouter();
  const scrollRef         = useRef(null);

  const [urgencias,  setUrgencias]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [puedeScroll, setPuedeScroll] = useState({ left: false, right: true });

  // ── Fetch de urgencias desde Supabase ─────────────────────────────────────
  useEffect(() => {
    async function fetchUrgencias() {
      try {
        const { data, error: sbError } = await supabase
          .from('urgencias')
          .select('id, centro_id, hospital_nombre, grupo_requerido, nivel_urgencia, imagen_url')
          .eq('activo', true)
          .order('nivel_urgencia', { ascending: true }) // Alta primero (orden alfabético: Alta < Baja < Media)
          .limit(8);

        if (sbError) {
          console.error('[UrgenciasCarousel] Error al cargar urgencias:', sbError);
          setError('No se pudieron cargar las urgencias activas.');
          return;
        }

        setUrgencias(data ?? []);
      } catch (e) {
        console.error('[UrgenciasCarousel] Error inesperado:', e);
        setError('Error inesperado al cargar el carrusel.');
      } finally {
        setLoading(false);
      }
    }

    fetchUrgencias();
  }, []);

  // ── Actualiza los botones de navegación al hacer scroll ───────────────────
  function actualizarEstadoScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setPuedeScroll({
      left:  el.scrollLeft > 10,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
    });
  }

  // ── Scroll programático (un "slide" = ancho del contenedor) ──────────────
  function scrollear(direccion) {
    const el = scrollRef.current;
    if (!el) return;
    const ancho = el.clientWidth;
    el.scrollBy({ left: direccion === 'right' ? ancho : -ancho, behavior: 'smooth' });
  }

  // ── Lógica del botón "Donar ahora" ────────────────────────────────────────
  async function handleDonar(urgencia) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar si tiene triage aprobado
    const { data: triage } = await supabase
      .from('triage_results')
      .select('resultado')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!triage || triage.resultado !== 'apto') {
      router.push('/triage');
      return;
    }

    router.push(`/reservar?centro_id=${urgencia.centro_id}`);
  }

  return (
    <section
      id="urgencias"
      className="py-10 lg:py-16"
      aria-labelledby="urgencias-titulo"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="section">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{
                backgroundColor: 'var(--color-error-light)',
                color: 'var(--color-error)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              En este momento
            </span>
            <h2
              id="urgencias-titulo"
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
            >
              Urgencias activas
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
            >
              Hospitales que necesitan donantes ahora mismo en tu ciudad.
            </p>
          </div>

          {/* Controles de navegación */}
          {!loading && urgencias.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => scrollear('left')}
                disabled={!puedeScroll.left}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
                style={{
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: puedeScroll.left ? 'white' : 'var(--color-bg)',
                  color: puedeScroll.left ? 'var(--color-navy)' : 'var(--color-slate-mid)',
                  cursor: puedeScroll.left ? 'pointer' : 'not-allowed',
                }}
                aria-label="Anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollear('right')}
                disabled={!puedeScroll.right}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
                style={{
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: puedeScroll.right ? 'white' : 'var(--color-bg)',
                  color: puedeScroll.right ? 'var(--color-navy)' : 'var(--color-slate-mid)',
                  cursor: puedeScroll.right ? 'pointer' : 'not-allowed',
                }}
                aria-label="Siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm mb-6"
            style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}
          >
            <AlertTriangle size={18} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Carrusel con scroll snap */}
        <div
          ref={scrollRef}
          onScroll={actualizarEstadoScroll}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch', // scroll fluido en iOS
            msOverflowStyle: 'none',          // oculta scrollbar en IE/Edge
            scrollbarWidth: 'none',           // oculta scrollbar en Firefox
          }}
          aria-label="Carrusel de urgencias"
        >
          {/* Oculta scrollbar en WebKit */}
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : urgencias.length === 0
              ? (
                <p
                  className="text-sm py-8"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
                >
                  No hay urgencias activas en este momento.
                </p>
              )
              : urgencias.map((u) => (
                <UrgenciaCard
                  key={u.id}
                  urgencia={u}
                  onDonar={handleDonar}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
