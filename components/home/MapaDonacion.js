'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Map, AlertTriangle } from 'lucide-react';

const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 };
const ZOOM_INICIAL = 12;

// ─── Fallback estandarizado por defecto ────────────────────────────────────────
const IMAGEN_FALLBACK = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600';

// ─── Diccionario Dinámico de Imágenes (Fallback por Hospital) ─────────────────
const IMAGENES_HOSPITALES = {
  'Hospital Garrahan': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
  'Fundación Favaloro': 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=600',
  'Hospital Italiano': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
  'Hospital Británico': 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600',
  'Clínica Bazterrica': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
  'Hospital Álvarez': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=600',
  'Hospital de Clinicas': 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600',
  'Clinica Santa Isabel': 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
  'Hospital Fernández': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
  'Sanatorio Güemes': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=600'
};

/**
 * MapaDonacion.js
 * 
 * Uses dynamic import with ssr: false for MapaLeaflet to prevent
 * Leaflet from executing in the Next.js server environment.
 */
const MapaLeaflet = dynamic(
  () => import('./MapaLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full rounded-[14px] flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-border)', minHeight: '400px' }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"
            style={{ color: 'var(--color-primary)' }} aria-label="Cargando mapa">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
            Cargando mapa…
          </p>
        </div>
      </div>
    ),
  }
);

export default function MapaDonacion({ grupoSanguineo, estadoTriage }) {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtrado, setFiltrado] = useState(true);

  useEffect(() => {
    async function fetchCentros() {
      setLoading(true);
      setError('');

      try {
        let query = supabase
          .from('centros_donacion')
          .select('id, nombre, descripcion, direccion, telefono, horario, latitud, longitud, grupos_compatibles')
          .eq('activo', true)
          .order('nombre', { ascending: true });

        if (grupoSanguineo && filtrado) {
          query = query.contains('grupos_compatibles', [grupoSanguineo]);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error('[MapaDonacion] Error al cargar centros:', supabaseError);
          setError('No se pudieron cargar los centros de donación. Intentá recargar la página.');
          return;
        }

        setCentros(data ?? []);

      } catch (unexpectedError) {
        console.error('[MapaDonacion] Error inesperado:', unexpectedError);
        setError('Error inesperado al cargar el mapa.');
      } finally {
        setLoading(false);
      }
    }

    fetchCentros();
  }, [grupoSanguineo, filtrado]);

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
          >
            <Map size={24} aria-hidden="true" /> Centros de donación
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
          >
            {loading
              ? 'Cargando centros…'
              : centros.length === 0
                ? 'No se encontraron centros con tu criterio de búsqueda.'
                : `${centros.length} centro${centros.length !== 1 ? 's' : ''} encontrado${centros.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {grupoSanguineo && (
          <label
            className="flex items-center gap-2 cursor-pointer select-none"
            htmlFor="filtro-grupo"
          >
            <div
              className="relative inline-flex items-center"
              onClick={() => setFiltrado((v) => !v)}
            >
              <input
                id="filtro-grupo"
                type="checkbox"
                className="sr-only"
                checked={filtrado}
                onChange={() => { }}
                aria-label="Filtrar por mi grupo sanguíneo"
              />
              <div
                className="w-10 h-5 rounded-full transition-colors duration-200"
                style={{ backgroundColor: filtrado ? 'var(--color-primary)' : 'var(--color-border)' }}
              />
              <div
                className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                style={{
                  top: '2px',
                  left: filtrado ? '22px' : '2px',
                }}
              />
            </div>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-slate)' }}
            >
              Solo compatibles con{' '}
              <span
                className="font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {grupoSanguineo}
              </span>
            </span>
          </label>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* 
        Para garantizar la sincronización exacta solicitada entre el Mapa y las Cards, 
        extraemos los 4 centros a una variable constante con sus respectivas coordenadas (latitud/longitud). 
        Ambos componentes (MapaLeaflet y la grilla de tarjetas) iterarán sobre este MISMO array. 
      */}
      {(() => {
        const centrosParaMostrar = centros;

        return (
          <>
            <div
              className="w-full rounded-[14px] overflow-hidden"
              style={{
                height: '480px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {!loading && !error && (
                <MapaLeaflet centros={centrosParaMostrar} estadoTriage={estadoTriage} />
              )}
              {loading && !error && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: '#F1F5F9' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"
                      style={{ color: 'var(--color-primary)' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
                      Buscando centros cercanos…
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjetas estáticas sincronizadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {centrosParaMostrar.map((mock) => (
          <article 
            key={mock.id} 
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
            <div className="relative h-40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mock.imagen_url || IMAGENES_HOSPITALES[mock.nombre] || IMAGEN_FALLBACK}
                alt={mock.nombre}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const fallbackHospital = IMAGENES_HOSPITALES[mock.nombre] || IMAGEN_FALLBACK;
                  if (e.target.src !== fallbackHospital) {
                    e.target.src = fallbackHospital;
                  } else if (e.target.src !== IMAGEN_FALLBACK) {
                    e.target.src = IMAGEN_FALLBACK;
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col flex-1 p-4 gap-3">
              <div>
                <p className="text-base font-bold leading-snug" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                  {mock.nombre}
                </p>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
                  {mock.direccion}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {mock.grupos_compatibles.map((grupo) => (
                  <span
                    key={grupo}
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: grupo === grupoSanguineo ? 'var(--color-primary-blush)' : 'var(--color-border)',
                      color: grupo === grupoSanguineo ? 'var(--color-primary)' : 'var(--color-slate)',
                      fontFamily: 'var(--font-heading)',
                      border: grupo === grupoSanguineo ? '1px solid var(--color-primary-light)' : '1px solid transparent',
                    }}
                  >
                    {grupo}
                  </span>
                ))}
              </div>

              <a 
                href={estadoTriage === 'apto' ? `/reservar?centro_id=${mock.id}` : '/triage'}
                className="btn btn-primary mt-auto w-full text-center"
                style={{ textDecoration: 'none' }}
              >
                {estadoTriage === 'apto' ? 'Agendar turno' : 'Hacer Pre-Triage'}
              </a>
            </div>
          </article>
        ))}
      </div>
          </>
        )
      })()}

    </div>
  );
}
