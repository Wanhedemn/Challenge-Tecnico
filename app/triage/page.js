import FormularioTriage from '@/components/formularios/FormularioTriage';

export const metadata = {
  title: 'Pre-Triage | DonaVida',
  description: 'Completá el cuestionario de pre-triage para validar tu aptitud como donante.',
};

export default function TriagePage() {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,21,42,0.07) 0%, transparent 70%), var(--color-bg)',
      }}
    >
      {/* Encabezado */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="badge-active inline-flex mb-4">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse-soft"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          Paso previo a la donación
        </div>
        <h1
          className="text-3xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
        >
          Cuestionario de Pre-Triage
        </h1>
        <p
          className="mt-2 text-sm max-w-sm mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
        >
          Respondé honestamente las siguientes preguntas para verificar si podés
          donar sangre el día de hoy. Solo toma 2 minutos.
        </p>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-lg animate-fade-up" style={{ animationDelay: '60ms' }}>
        <FormularioTriage />
      </div>
    </div>
  );
}
