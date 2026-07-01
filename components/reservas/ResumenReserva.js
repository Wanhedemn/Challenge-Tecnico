import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return '';
  // Convertimos 'YYYY-MM-DD' a una fecha local usando formato utc para no tener desfase horario
  const [year, month, day] = fechaStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function ResumenReserva({ centro, fecha, hora, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-up">
      <div 
        className="card w-full max-w-md animate-fade-up flex flex-col gap-5"
        style={{ animationDuration: '200ms' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resumen-titulo"
      >
        <div className="text-center">
          <h2 id="resumen-titulo" className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
            Confirmá tu turno
          </h2>
          <p className="text-sm mt-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
            Revisá los datos antes de agendar.
          </p>
        </div>

        <div className="rounded-[10px] p-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <MapPin size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                {centro.nombre}
              </p>
              <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}>
                {centro.direccion}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <div className="mt-0.5">
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold capitalize" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                {formatFechaLarga(fecha)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <div className="mt-0.5">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                {hora} hs
              </p>
            </div>
          </div>
        </div>

        {/* Recordatorio Obligatorio */}
        <div className="rounded-lg px-4 py-3 text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div style={{ fontFamily: 'var(--font-body)' }}>
            <p className="font-bold">Recordatorio importante:</p>
            <p>Es obligatorio presentarse con tu DNI físico o digital para poder donar.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button 
            onClick={onCancel} 
            disabled={loading}
            className="btn btn-ghost flex-1"
          >
            Modificar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="btn btn-primary flex-1"
            style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>Confirmando…</>
            ) : (
              'Confirmar turno'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
