'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const emailParam   = searchParams.get('email') || '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [errors, setErrors]       = useState({ password: '', confirm: '', general: '' });
  const [status, setStatus]       = useState('idle');
  const [showPwd, setShowPwd]     = useState(false);

  function validate() {
    const errs = { password: '', confirm: '', general: '' };
    let ok = true;
    if (password.length < 8) {
      errs.password = 'La contraseña debe tener al menos 8 caracteres.';
      ok = false;
    }
    if (password !== confirm) {
      errs.confirm = 'Las contraseñas no coinciden.';
      ok = false;
    }
    return { errs, ok };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({ password: '', confirm: '', general: '' });

    const { errs, ok } = validate();
    if (!ok) { setErrors(errs); return; }

    setStatus('loading');

    try {
      /**
       * supabase.auth.updateUser requiere una sesión activa.
       * En un flujo real, el usuario llega aquí vía magic link de email.
       * En este MVP, si ya tiene sesión activa, puede cambiar su contraseña.
       * Si no hay sesión, mostramos un mensaje explicativo.
       */
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setErrors((prev) => ({
          ...prev,
          general:
            'Tu sesión expiró o no estás autenticado. ' +
            'En un entorno real, este enlace llegaría por email con un token seguro. ' +
            'Por ahora, iniciá sesión y cambiá tu contraseña desde el perfil.',
        }));
        setStatus('no_session');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || 'Error al actualizar la contraseña.',
        }));
        setStatus('error');
        return;
      }

      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch {
      setErrors((prev) => ({
        ...prev,
        general: 'No se pudo conectar. Intentá de nuevo.',
      }));
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <form onSubmit={handleSubmit} noValidate className="card w-full max-w-md"
      aria-label="Formulario de nueva contraseña">

      <div className="mb-6">
        <h2 className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Nueva contraseña
        </h2>
        {emailParam && (
          <p className="mt-1 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
            Cuenta: <strong>{emailParam}</strong>
          </p>
        )}
      </div>

      {/* Alertas de estado */}
      {errors.general && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: status === 'no_session' ? 'var(--color-warning-light)' : 'var(--color-error-light)',
                   color: status === 'no_session' ? 'var(--color-warning)' : 'var(--color-error)' }}>
          <span aria-hidden="true">{status === 'no_session' ? 'ℹ️' : '⚠️'}</span>
          <span>{errors.general}</span>
        </div>
      )}
      {isSuccess && (
        <div role="status" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
          <span aria-hidden="true">✅</span>
          <span>¡Contraseña actualizada! Redirigiendo a tu panel…</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Nueva contraseña */}
        <div className="form-group">
          <label htmlFor="new-password" className="form-label">Nueva contraseña</label>
          <div className="relative">
            <input id="new-password" type={showPwd ? 'text' : 'password'}
              autoComplete="new-password" placeholder="Mínimo 8 caracteres"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isSuccess || status === 'no_session'}
              className="form-input pr-10"
              style={errors.password ? { borderColor: 'var(--color-error)' } : {}} />
            <button type="button" tabIndex={-1} onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--color-slate-mid)' }}
              aria-label={showPwd ? 'Ocultar' : 'Mostrar'}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span className="form-error" role="alert">{errors.password}</span>}
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">Confirmar contraseña</label>
          <input id="confirm-password" type={showPwd ? 'text' : 'password'}
            autoComplete="new-password" placeholder="Repetí la contraseña"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            disabled={isLoading || isSuccess || status === 'no_session'}
            className="form-input"
            style={errors.confirm ? { borderColor: 'var(--color-error)' } : {}} />
          {errors.confirm && <span className="form-error" role="alert">{errors.confirm}</span>}
        </div>
      </div>

      <div className="mt-8">
        <button type="submit"
          disabled={isLoading || isSuccess || status === 'no_session'}
          className="btn btn-primary w-full"
          style={(isLoading || isSuccess || status === 'no_session')
            ? { opacity: 0.7, cursor: 'not-allowed', transform: 'none' } : {}}>
          {isLoading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>Actualizando…</>
          ) : 'Guardar nueva contraseña'}
        </button>
      </div>

      <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-slate-mid)' }}>
        <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          ← Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}

// Suspense boundary requerido por useSearchParams en Next.js App Router
export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,21,42,0.07) 0%, transparent 70%), var(--color-bg)' }}>
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-3xl font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Resetear contraseña
        </h1>
      </div>
      <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '60ms' }}>
        <Suspense fallback={<div className="card text-center text-sm" style={{ color: 'var(--color-slate)' }}>Cargando…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
