'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Droplet, AlertTriangle } from 'lucide-react';

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
  
  // Lógica de fallback de imagen
  const imgSrc  = urgencia.imagen_url || IMAGEN_FALLBACK;

  return (
    <article
      className="flex flex-col w-full rounded-[14px] bg-white overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
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
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`Imagen de ${urgencia.hospital_nombre}`}
          className="w-full h-full object-cover"
          loading="lazy"
          // Opcional: Si falla la carga de la URL, cambiamos al fallback
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
            className="text-base font-bold leading-snug line-clamp-2"
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
          className="btn btn-primary mt-auto w-full"
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
      className="w-full rounded-[14px] overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <div className="h-40 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-8 w-24 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-10 w-full rounded-[10px] animate-pulse mt-auto" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GridUrgencias() {
  const router = useRouter();

  const [urgencias,  setUrgencias]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // ── Fetch de urgencias desde Supabase ─────────────────────────────────────
  useEffect(() => {
    async function fetchUrgencias() {
      try {
        const { data, error: sbError } = await supabase
          .from('urgencias')
          .select('id, centro_id, hospital_nombre, grupo_requerido, nivel_urgencia, imagen_url')
          .eq('activo', true)
          .order('nivel_urgencia', { ascending: true }) // Alta primero (orden alfabético: Alta < Baja < Media)
          .limit(12); // Ahora podemos cargar más para llenar la grilla

        if (sbError) {
          console.error('[GridUrgencias] Error al cargar urgencias:', sbError);
          setError('No se pudieron cargar las urgencias activas.');
          return;
        }

        setUrgencias(data ?? []);
      } catch (e) {
        console.error('[GridUrgencias] Error inesperado:', e);
        setError('Error inesperado al cargar la grilla de urgencias.');
      } finally {
        setLoading(false);
      }
    }

    fetchUrgencias();
  }, []);

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
      className="py-16 lg:py-24"
      aria-labelledby="urgencias-titulo"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="section">
        {/* Encabezado */}
        <div className="mb-10 text-center sm:text-left">
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
            className="mt-2 text-sm max-w-2xl mx-auto sm:mx-0"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
          >
            Hospitales que necesitan donantes ahora mismo en tu ciudad.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm mb-8 max-w-xl"
            style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}
          >
            <AlertTriangle size={18} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : urgencias.length === 0
              ? (
                <div className="col-span-full">
                  <p
                    className="text-sm py-8 text-center sm:text-left"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
                  >
                    No hay urgencias activas en este momento.
                  </p>
                </div>
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
