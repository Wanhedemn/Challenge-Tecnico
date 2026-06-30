import FormularioRegistro from '@/components/formularios/FormularioRegistro';
import Link from 'next/link';

export const metadata = {
  title: 'Registrarse | DonaVida',
  description: 'Creá tu cuenta de donante y empezá a salvar vidas hoy.',
};


export default function RegistroPage() {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,21,42,0.07) 0%, transparent 70%), var(--color-bg)',
      }}
    >
      {/* Encabezado de contexto */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="badge-active inline-flex mb-4">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          Registro gratuito
        </div>
        <h1
          className="text-3xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
        >
          Convertite en donante
        </h1>
        <p
          className="mt-2 text-sm max-w-sm mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
        >
          Completá tus datos para acceder a las urgencias activas y reservar
          un turno de donación.
        </p>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '60ms' }}>
        <FormularioRegistro />
      </div>

      {/* Footer de la página */}
      <p
        className="mt-6 text-xs animate-fade-up"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-slate-mid)',
          animationDelay: '120ms',
        }}
      >
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
