import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(192,21,42,0.10) 0%, transparent 70%), #F8FAFC',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{ background: 'var(--color-primary)' }}
      />

      <div className="section flex flex-col items-center text-center py-20 lg:py-28 gap-8">

        <div className="badge-active animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse-soft"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          Urgencias activas en tu ciudad
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-3xl animate-fade-up"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-navy)',
            animationDelay: '60ms',
          }}
        >
          Tu donación es{' '}
          <span style={{ color: 'var(--color-primary)' }}>
            el regalo&nbsp;de la vida
          </span>
        </h1>

        <p
          className="text-base sm:text-lg max-w-xl leading-relaxed animate-fade-up"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-slate)',
            animationDelay: '120ms',
          }}
        >
          Conectamos donantes con hospitales en tiempo real. Completá tu
          pre-triage, reservá un turno y ayudá a salvar vidas con un par de
          clics — sin filas, sin burocracia.
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          <Link href="/registro" className="btn btn-primary btn-lg">
            Registrarse
          </Link>
          <Link href="#requisitos" className="btn btn-outline btn-lg">
            Conocer requisitos
          </Link>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-8 mt-4 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          {[
            { value: '12+', label: 'Hospitales en red' },
            { value: '3.400', label: 'Donantes registrados' },
            { value: '< 5 min', label: 'Tiempo de reserva' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span
                className="text-2xl font-extrabold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-primary)',
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-slate-mid)',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
