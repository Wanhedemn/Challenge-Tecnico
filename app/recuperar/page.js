'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RecuperarPage() {
  const router  = useRouter();
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | not_found | found

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      setError('Ingresá un email válido.');
      return;
    }

    setStatus('loading');

    try {
      /**
       * Verificamos si el email existe en public.usuarios.
       * Usamos el cliente anon: el RLS de SELECT permite leer
       * solo la fila propia, pero como el usuario no está autenticado,
       * no podrá leer ninguna fila vía .eq() — obtendrá array vacío.
       *
       * Para la búsqueda mock en un MVP sin autenticación activa,
       * consultamos a través de la API Route que sí usa el admin client.
       */
      const res = await fetch(
        `/api/usuarios/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      const data = await res.json();

      if (!res.ok || !data.existe) {
        setStatus('not_found');
        return;
      }

      // Email encontrado → redirigir a reset-password con el email como param
      setStatus('found');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1000);

    } catch {
      setError('No se pudo verificar el email. Intentá de nuevo.');
      setStatus('idle');
    }
  }

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
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm max-w-sm mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Ingresá tu email y verificaremos si tenés una cuenta registrada.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="card w-full max-w-md animate-fade-up"
        style={{ animationDelay: '60ms' }}
        aria-label="Formulario de recuperación de contraseña"
      >
        {/* Estados de respuesta */}
        {status === 'not_found' && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
            <span aria-hidden="true">❌</span>
            <span>No encontramos una cuenta con ese email. ¿Querés <Link href="/registro" style={{ fontWeight: 700 }}>registrarte</Link>?</span>
          </div>
        )}
        {status === 'found' && (
          <div role="status" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <span aria-hidden="true">✅</span>
            <span>Cuenta verificada. Redirigiendo para resetear tu contraseña…</span>
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="recuperar-email" className="form-label">Email registrado</label>
          <input id="recuperar-email" type="email" autoComplete="email"
            placeholder="donante@ejemplo.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); setStatus('idle'); }}
            disabled={status === 'loading' || status === 'found'}
            className="form-input" />
        </div>

        <div className="mt-6">
          <button type="submit"
            disabled={status === 'loading' || status === 'found'}
            className="btn btn-primary w-full"
            style={(status === 'loading' || status === 'found') ? { opacity: 0.7, cursor: 'not-allowed', transform: 'none' } : {}}>
            {status === 'loading' ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>Verificando…</>
            ) : 'Verificar email'}
          </button>
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
