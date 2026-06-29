'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const INITIAL_FORM   = { email: '', password: '' };
const INITIAL_ERRORS = { email: '', password: '', general: '' };

function validate({ email, password }) {
  const errors = { ...INITIAL_ERRORS };
  let isValid = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Ingresá un email válido.';
    isValid = false;
  }
  if (password.length < 1) {
    errors.password = 'Ingresá tu contraseña.';
    isValid = false;
  }
  return { errors, isValid };
}

/**
 * FormularioLogin
 *
 * Llama a supabase.auth.signInWithPassword().
 * En caso de éxito, redirige a /dashboard.
 * Maneja todos los errores conocidos de Supabase Auth sin exponer mensajes internos.
 */
export default function FormularioLogin() {
  const router = useRouter();

  const [form, setForm]     = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [status, setStatus] = useState('idle');
  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors(INITIAL_ERRORS);

    const { errors: ve, isValid } = validate(form);
    if (!isValid) { setErrors(ve); return; }

    setStatus('loading');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (error) {
        // Supabase devuelve "Invalid login credentials" para email o password incorrecto
        const isCredential = error.message?.toLowerCase().includes('invalid login');
        const isEmail      = error.message?.toLowerCase().includes('email not confirmed');

        setErrors((prev) => ({
          ...prev,
          general: isCredential
            ? 'Email o contraseña incorrectos. Verificá tus datos.'
            : isEmail
              ? 'Debés confirmar tu email antes de iniciar sesión. Revisá tu bandeja.'
              : error.message || 'Error al iniciar sesión.',
        }));
        setStatus('error');
        return;
      }

      // Éxito → redirigir al dashboard
      setStatus('success');
      router.push('/dashboard');

    } catch {
      setErrors((prev) => ({
        ...prev,
        general: 'No se pudo conectar con el servidor. Verificá tu conexión.',
      }));
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card w-full max-w-md"
      aria-label="Formulario de inicio de sesión"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Iniciar sesión
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Accedé a tu panel de donaciones.
        </p>
      </div>

      {/* Alerta general */}
      {errors.general && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <span aria-hidden="true">⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}
      {isSuccess && (
        <div role="status" className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
          <span aria-hidden="true">✅</span>
          <span>¡Bienvenido! Redirigiendo a tu panel…</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Email */}
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="email"
            placeholder="donante@ejemplo.com" value={form.email} onChange={handleChange}
            disabled={isLoading || isSuccess} aria-invalid={!!errors.email}
            className="form-input"
            style={errors.email ? { borderColor: 'var(--color-error)' } : {}} />
          {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="form-label">Contraseña</label>
            <Link href="/recuperar" className="text-xs font-medium"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input id="login-password" name="password" type={showPwd ? 'text' : 'password'}
              autoComplete="current-password" placeholder="Tu contraseña"
              value={form.password} onChange={handleChange}
              disabled={isLoading || isSuccess} aria-invalid={!!errors.password}
              className="form-input pr-10"
              style={errors.password ? { borderColor: 'var(--color-error)' } : {}} />
            <button type="button" tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--color-slate-mid)' }}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span className="form-error" role="alert">{errors.password}</span>}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button type="submit" disabled={isLoading || isSuccess}
          className="btn btn-primary w-full"
          style={(isLoading || isSuccess) ? { opacity: 0.7, cursor: 'not-allowed', transform: 'none' } : {}}>
          {isLoading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>Ingresando…</>
          ) : '¡Ingresar!'}
        </button>
      </div>

      {/* Link a registro */}
      <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/registro" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Registrate gratis
        </Link>
      </p>
    </form>
  );
}
