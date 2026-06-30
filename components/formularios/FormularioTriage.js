'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const PREGUNTAS = [
  {
    id: 'edad',
    texto: '¿Tenés entre 18 y 65 años?',
    detalle: 'La donación de sangre está habilitada para personas dentro de ese rango etario.',
    aptaRespuesta: 'si',
    motivoRechazo: 'Edad fuera del rango habilitado (18-65 años).',
  },
  {
    id: 'peso',
    texto: '¿Pesás 50 kg o más?',
    detalle: 'El peso mínimo asegura que la extracción no comprometa tu salud.',
    aptaRespuesta: 'si',
    motivoRechazo: 'Peso inferior al mínimo requerido (50 kg).',
  },
  {
    id: 'tatuajes',
    texto: '¿Te realizaste tatuajes o piercings en los últimos 12 meses?',
    detalle: 'Los procedimientos de este tipo requieren un período de espera por riesgo de infección.',
    aptaRespuesta: 'no',
    motivoRechazo: 'Tatuajes o piercings realizados en los últimos 12 meses.',
  },
  {
    id: 'fiebre',
    texto: '¿Tuviste fiebre, gripe o resfriado en los últimos 7 días?',
    detalle: 'Una infección activa o reciente puede comprometer la calidad de la sangre donada.',
    aptaRespuesta: 'no',
    motivoRechazo: 'Cuadro infeccioso (fiebre/gripe) en los últimos 7 días.',
  },
  {
    id: 'alcohol',
    texto: '¿Consumiste bebidas alcohólicas en las últimas 24 horas?',
    detalle: 'El alcohol en sangre afecta la calidad de la donación y puede afectar tu bienestar.',
    aptaRespuesta: 'no',
    motivoRechazo: 'Consumo de alcohol en las últimas 24 horas.',
  },
];

function evaluarTriage(respuestas) {
  const motivosRechazo = [];

  for (const pregunta of PREGUNTAS) {
    const respuesta = respuestas[pregunta.id];
    if (respuesta !== pregunta.aptaRespuesta) {
      motivosRechazo.push(pregunta.motivoRechazo);
    }
  }

  return {
    resultado: motivosRechazo.length === 0 ? 'apto' : 'no_apto',
    motivosRechazo,
  };
}

function PantallaResultado({ resultado, motivosRechazo, onReintentar }) {
  const isApto = resultado === 'apto';
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: isApto ? 'var(--color-success-light)' : 'var(--color-error-light)',
        }}
        aria-hidden="true"
      >
        {isApto ? (
          <CheckCircle2 size={36} color="var(--color-success)" />
        ) : (
          <XCircle size={36} color="var(--color-error)" />
        )}
      </div>

      <div>
        <h3
          className="text-2xl font-extrabold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: isApto ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {isApto ? '¡Sos apto para donar!' : 'No podés donar en este momento'}
        </h3>
        <p
          className="mt-2 text-sm max-w-xs mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}
        >
          {isApto
            ? 'Tu pre-triage fue aprobado. Ya podés reservar un turno de donación.'
            : 'Tu pre-triage indicó algunas condiciones que impiden la donación por ahora.'}
        </p>
      </div>

      {!isApto && motivosRechazo.length > 0 && (
        <div
          className="w-full text-left rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--color-error-light)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-heading)' }}
          >
            Motivos de exclusión temporaria:
          </p>
          <ul className="flex flex-col gap-1">
            {motivosRechazo.map((motivo, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)' }}
              >
                <span className="flex-shrink-0 mt-0.5" aria-hidden="true">•</span>
                {motivo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {isApto ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary w-full"
          >
            Ir a reservar turno →
          </button>
        ) : (
          <>
            <button onClick={onReintentar} className="btn btn-outline flex-1">
               Volver a intentar
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-ghost flex-1"
            >
              Volver al panel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function FormularioTriage() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [resultadoFinal, setResultadoFinal] = useState(null);

  const totalPasos = PREGUNTAS.length;
  const preguntaActual = PREGUNTAS[paso];
  const respuestaActual = respuestas[preguntaActual?.id];
  const progresoPct = Math.round((paso / totalPasos) * 100);

  function seleccionarRespuesta(valor) {
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function irAnterior() {
    if (paso > 0) setPaso((p) => p - 1);
  }

  async function irSiguiente() {
    if (paso < totalPasos - 1) {
      setPaso((p) => p + 1);
      return;
    }

    setGuardando(true);
    setErrorGuardado('');

    const todasLasRespuestas = {
      ...respuestas,
      [preguntaActual.id]: respuestaActual,
    };

    const { resultado, motivosRechazo } = evaluarTriage(todasLasRespuestas);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setErrorGuardado('Tu sesión expiró. Por favor, iniciá sesión de nuevo.');
        setGuardando(false);
        return;
      }

      const { error } = await supabase
        .from('triage_results')
        .insert({
          usuario_id: session.user.id,
          resultado,
          respuestas: todasLasRespuestas,
          motivo_rechazo: motivosRechazo.length > 0 ? motivosRechazo.join(' | ') : null,
        });

      if (error) {
        console.error('[FormularioTriage] Error al guardar:', error);
        setErrorGuardado('No se pudo guardar el resultado. Intentá de nuevo.');
        setGuardando(false);
        return;
      }

      setResultadoFinal({ resultado, motivosRechazo });

    } catch (unexpectedError) {
      console.error('[FormularioTriage] Error inesperado:', unexpectedError);
      setErrorGuardado('Error inesperado. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultadoFinal(null);
    setErrorGuardado('');
  }

  if (resultadoFinal) {
    return (
      <div className="card w-full max-w-lg">
        <PantallaResultado
          resultado={resultadoFinal.resultado}
          motivosRechazo={resultadoFinal.motivosRechazo}
          onReintentar={reiniciar}
        />
      </div>
    );
  }

  return (
    <div className="card w-full max-w-lg">

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-slate-mid)' }}
          >
            Pregunta {paso + 1} de {totalPasos}
          </span>
          <span
            className="text-xs font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
          >
            {progresoPct}%
          </span>
        </div>

        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-border)' }}
          role="progressbar"
          aria-valuenow={paso + 1}
          aria-valuemin={1}
          aria-valuemax={totalPasos}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((paso + 1) / totalPasos) * 100}%`,
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
      </div>

      <div className="triage-question" key={preguntaActual.id}>
        <p className="triage-question-text text-base mb-1">
          {preguntaActual.texto}
        </p>
        {preguntaActual.detalle && (
          <p
            className="text-xs mb-3"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate-mid)' }}
          >
            {preguntaActual.detalle}
          </p>
        )}

        <div className="triage-options">
          {[
            { valor: 'si', etiqueta: 'Sí' },
            { valor: 'no', etiqueta: 'No' },
          ].map(({ valor, etiqueta }) => (
            <label
              key={valor}
              className="triage-option"
              htmlFor={`${preguntaActual.id}-${valor}`}
            >
              <input
                type="radio"
                id={`${preguntaActual.id}-${valor}`}
                name={preguntaActual.id}
                value={valor}
                checked={respuestaActual === valor}
                onChange={() => seleccionarRespuesta(valor)}
              />
              <span className="triage-option-label">{etiqueta}</span>
            </label>
          ))}
        </div>
      </div>

      {errorGuardado && (
        <div
          role="alert"
          className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{errorGuardado}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 gap-3">
        <button
          type="button"
          onClick={irAnterior}
          disabled={paso === 0}
          className="btn btn-ghost btn-sm"
          style={paso === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={irSiguiente}
          disabled={!respuestaActual || guardando}
          className="btn btn-primary btn-sm"
          style={(!respuestaActual || guardando) ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' } : {}}
        >
          {guardando ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>Guardando…</>
          ) : paso < totalPasos - 1 ? (
            'Siguiente →'
          ) : (
            'Ver mi resultado'
          )}
        </button>
      </div>

    </div>
  );
}
