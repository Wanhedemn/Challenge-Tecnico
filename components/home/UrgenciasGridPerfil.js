'use client';

// Fallback estandarizado para imágenes de hospitales
const IMAGEN_FALLBACK = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80';

export default function UrgenciasGridPerfil({ centros, grupoSanguineo, estadoTriage }) {
  if (!centros || centros.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {centros.map((centro) => {
        const imgSrc = centro.imagen_url || IMAGEN_FALLBACK;

        return (
          <article 
            key={centro.id} 
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
            {/* Imagen con Fallback */}
            <div className="relative h-40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={`Imagen de ${centro.nombre}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  if (e.target.src !== IMAGEN_FALLBACK) {
                    e.target.src = IMAGEN_FALLBACK;
                  }
                }}
              />
            </div>

            {/* Contenido */}
            <div className="flex flex-col flex-1 p-4 gap-3">
              <div>
                <p
                  className="text-base font-bold leading-snug line-clamp-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
                >
                  {centro.nombre}
                </p>
                <p
                  className="text-xs mt-0.5 line-clamp-1"
                  style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}
                >
                  {centro.direccion}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {centro.grupos_compatibles.map((grupo) => (
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
                href={estadoTriage === 'apto' ? `/reservar?centro_id=${centro.id}` : '/triage'}
                className="btn btn-primary mt-auto w-full"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                {estadoTriage === 'apto' ? 'Agendar turno' : 'Hacer Pre-Triage'}
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
