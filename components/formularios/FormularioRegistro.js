'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ─── Constantes ───────────────────────────────────────────────────────────────

const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const INITIAL_FORM = {
  nombre: '',
  email: '',
  password: '',
  grupo_sanguineo: '',
};

const INITIAL_ERRORS = {
  nombre: '', email: '', password: '', grupo_sanguineo: '', general: '',
};

// ─── Validación client-side ───────────────────────────────────────────────────

function validate(fields) {
  const errors = { ...INITIAL_ERRORS };
  let isValid = true;

  if (!fields.nombre.trim() || fields.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    isValid = false;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(fields.email.trim())) {
    errors.email = 'Ingresá un email válido.';
    isValid = false;
  }
  if (fields.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    isValid = false;
  }
  if (!GRUPOS_SANGUINEOS.includes(fields.grupo_sanguineo)) {
    errors.grupo_sanguineo = 'Seleccioná tu grupo sanguíneo.';
    isValid = false;
  }

  return { errors, isValid };
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * FormularioRegistro
 *
 * Llama a supabase.auth.signUp() con metadatos extra (nombre, grupo_sanguineo).
 * El Trigger `handle_new_user` en la DB copia esos datos a public.usuarios
 * automáticamente → no hay exposición de service_role en el cliente.
 *
 * Flujo: signUp → redirigir a /login (sin autologin).
 */
export default function FormularioRegistro() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
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
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          // Estos metadatos los lee el Trigger en la DB
          data: {
            nombre: form.nombre.trim(),
            grupo_sanguineo: form.grupo_sanguineo,
          },
          // Deshabilita el autologin: el usuario debe confirmar el email o
          // ir directamente al login en entornos sin email confirmation
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        /* Email ya en uso
        const isDup = error.message?.toLowerCase().includes('already registered');
        setErrors((prev) => ({
          ...prev,
          general: isDup
            ? 'Este email ya está registrado. ¿Querés iniciar sesión?'
            : error.message || 'Error al crear la cuenta.',
        }));
        setStatus('error');
        return;*/

        // --- AQUÍ EL LOG PARA DEBUGGING ---
        console.error("DEBUG: Error completo de Supabase Auth:", error);
        // ----------------------------------

        // Email ya en uso
        const isDup = error.message?.toLowerCase().includes('already registered');
        setErrors((prev) => ({
          ...prev,
          general: isDup
            ? 'Este email ya está registrado. ¿Querés iniciar sesión?'
            : error.message || 'Error al crear la cuenta.',
        }));
        setStatus('error');
        return;
      }

      // Éxito → redirigir a /login
      setStatus('success');
      setTimeout(() => router.push('/login'), 1500);

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
      aria-label="Formulario de registro"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
          Crear cuenta
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>
          Registrate para acceder a las urgencias y reservar turnos.
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
          <span>¡Cuenta creada! Redirigiendo al inicio de sesión…</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Nombre */}
        <div className="form-group">
          <label htmlFor="reg-nombre" className="form-label">Nombre completo</label>
          <input id="reg-nombre" name="nombre" type="text" autoComplete="name"
            placeholder="Ej: Juan Pérez" value={form.nombre} onChange={handleChange}
            disabled={isLoading || isSuccess} aria-invalid={!!errors.nombre}
            className="form-input"
            style={errors.nombre ? { borderColor: 'var(--color-error)' } : {}} />
          {errors.nombre && <span className="form-error" role="alert">{errors.nombre}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email</label>
          <input id="reg-email" name="email" type="email" autoComplete="email"
            placeholder="donante@ejemplo.com" value={form.email} onChange={handleChange}
            disabled={isLoading || isSuccess} aria-invalid={!!errors.email}
            className="form-input"
            style={errors.email ? { borderColor: 'var(--color-error)' } : {}} />
          {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Contraseña</label>
          <div className="relative">
            <input id="reg-password" name="password" type={showPwd ? 'text' : 'password'}
              autoComplete="new-password" placeholder="Mínimo 8 caracteres"
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

        {/* Grupo sanguíneo */}
        <div className="form-group">
          <label htmlFor="reg-grupo" className="form-label">Grupo sanguíneo</label>
          <select id="reg-grupo" name="grupo_sanguineo" value={form.grupo_sanguineo}
            onChange={handleChange} disabled={isLoading || isSuccess}
            className="form-select"
            style={errors.grupo_sanguineo ? { borderColor: 'var(--color-error)' } : {}}>
            <option value="" disabled>Seleccioná tu grupo</option>
            {GRUPOS_SANGUINEOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.grupo_sanguineo && <span className="form-error" role="alert">{errors.grupo_sanguineo}</span>}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button type="submit" disabled={isLoading || isSuccess}
          className="btn btn-primary w-full"
          style={(isLoading || isSuccess) ? { opacity: 0.7, cursor: 'not-allowed', transform: 'none' } : {}}>
          {isLoading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>Creando cuenta…</>
          ) : isSuccess ? '¡Registrado!' : 'Crear mi cuenta'}
        </button>
      </div>
    </form>
  );
}
