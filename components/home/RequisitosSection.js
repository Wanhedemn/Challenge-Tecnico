import { Scale, User, HeartPulse, Coffee } from 'lucide-react';

const REQUISITOS = [
  {
    id: 'peso',
    icono: Scale,
    titulo: 'Peso mínimo',
    descripcion:
      'Necesitás pesar al menos 50 kg. Este requisito garantiza que la extracción no comprometa tu bienestar físico durante ni después de la donación.',
  },
  {
    id: 'edad',
    icono: User,
    titulo: 'Rango de edad',
    descripcion:
      'Podés donar si tenés entre 18 y 65 años. Fuera de ese rango, los riesgos asociados a la extracción aumentan considerablemente.',
  },
  {
    id: 'salud',
    icono: HeartPulse,
    titulo: 'Buen estado de salud',
    descripcion:
      'Debés sentirte bien el día de la donación. Cualquier síntoma activo como fiebre, gripe o infección es motivo de postergación temporal.',
  },
  {
    id: 'ayuno',
    icono: Coffee,
    titulo: 'Sin ayuno obligatorio',
    descripcion:
      'No es necesario estar en ayunas. Recomendamos llegar hidratado y haber comido algo liviano para que el proceso sea más cómodo.',
  },
];

export default function RequisitosSection() {
  return (
    <section
      id="requisitos"
      className="section py-10 lg:py-16"
      aria-labelledby="requisitos-titulo"
    >
      {/* Encabezado */}
      <div className="text-center mb-12">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{
            backgroundColor: 'var(--color-primary-blush)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Antes de donar
        </span>
        <h2
          id="requisitos-titulo"
          className="text-3xl sm:text-4xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
        >
          Requisitos para donar sangre
        </h2>
        <p
          className="mt-3 text-base max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
        >
          Cumplir con estas condiciones asegura tu seguridad y la calidad de cada donación.
        </p>
      </div>

      {/* Timeline zig-zag con línea conectora */}
      <div className="relative max-w-3xl mx-auto">

        {/* Línea vertical central — visible solo en sm+ */}
        <div
          className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{ backgroundColor: 'var(--color-primary-blush)', borderLeft: '2px dashed #f0b0b8' }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-10">
          {REQUISITOS.map((req, index) => {
            const Icono = req.icono;
            const esInverso = index % 2 !== 0;

            return (
              <div
                key={req.id}
                className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-0 ${
                  esInverso ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Bloque de texto — ocupa la mitad */}
                <div
                  className={`w-full sm:w-[calc(50%-3rem)] text-left ${
                    esInverso ? 'sm:pl-10 sm:text-left' : 'sm:pr-10 sm:text-right'
                  }`}
                >
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
                  >
                    {req.titulo}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
                  >
                    {req.descripcion}
                  </p>
                </div>

                {/* Icono central — círculo con borde */}
                <div className="flex-shrink-0 z-10 flex items-center justify-center w-24 sm:w-24">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white"
                    style={{
                      borderColor: 'var(--color-primary)',
                      boxShadow: '0 0 0 6px var(--color-primary-blush)',
                    }}
                  >
                    <Icono
                      size={26}
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Espacio vacío en el lado opuesto (mantiene el centrado del icono) */}
                <div className="hidden sm:block w-[calc(50%-3rem)]" />
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA final */}
      <div className="mt-20 text-center">
        <p
          className="text-sm mb-4"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
        >
          ¿Cumplís con los requisitos?
        </p>
        <a href="/registro" className="btn btn-primary btn-lg">
          Registrarme como donante
        </a>
      </div>
    </section>
  );
}
