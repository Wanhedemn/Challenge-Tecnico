import FormularioLogin from '@/components/formularios/FormularioLogin';
import Link from 'next/link';

export const metadata = {
  title: 'Iniciar sesión | DonaVida',
  description: 'Accedé a tu cuenta de donante.',
};

export default function LoginPage() {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,21,42,0.07) 0%, transparent 70%), var(--color-bg)',
      }}
    >
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-3xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Bienvenido de vuelta
        </h1>
        <p className="mt-2 text-sm max-w-sm mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Ingresá para ver las urgencias activas y gestionar tus turnos.
        </p>
      </div>

      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '60ms' }}>
        <FormularioLogin />
      </div>

      <p className="mt-6 text-xs animate-fade-up" style={{ animationDelay: '120ms',
        fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/registro" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Registrarte gratis
        </Link>
      </p>
    </div>
  );
}
