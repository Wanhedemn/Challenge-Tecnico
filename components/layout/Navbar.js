'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Droplets,    // logo DonaVida
  User,        // avatar de sesión
  LogOut,      // cerrar sesión
  Menu,        // hamburger abierto
  X,           // hamburger cerrado
  ChevronDown, // flecha dropdown (desktop)
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Token estándar de iconos ─────────────────────────────────────────────────
// Usá ICON_SIZE y ICON_COLOR en toda la app para consistencia visual.
export const ICON_SIZE  = 18;
export const ICON_COLOR = 'currentColor';

const NAV_LINKS = [
  { label: 'Inicio',     href: '/'            },
  { label: 'Urgencias',  href: '/#urgencias'  },
  { label: 'Requisitos', href: '/#requisitos' },
];

// ─── Sub-componente: menú de usuario autenticado ──────────────────────────────

function UserMenu({ usuario, onLogout }) {
  const [open, setOpen] = useState(false);
  const nombre = usuario?.nombre?.split(' ')[0] ?? usuario?.email ?? 'Mi cuenta';

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-150"
        style={{ fontFamily: 'var(--font-heading)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menú de ${nombre}`}
      >
        {/* Avatar con inicial */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          {nombre.charAt(0).toUpperCase()}
        </div>
        <span
          className="hidden sm:block text-sm font-semibold max-w-[120px] truncate"
          style={{ color: 'var(--color-navy)' }}
        >
          {nombre}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--color-slate-mid)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
          }}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-[14px] py-1 z-50"
          style={{
            backgroundColor: '#fff',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
          role="menu"
        >
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <User size={ICON_SIZE} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>
                  {nombre}
                </p>
                {usuario?.email && (
                  <p className="text-xs truncate" style={{ color: 'var(--color-slate-mid)', fontFamily: 'var(--font-body)' }}>
                    {usuario.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Link al dashboard */}
          <Link
            href="/dashboard"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-navy)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            onClick={() => setOpen(false)}
          >
            Mi panel
          </Link>

          {/* Cerrar sesión */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-error-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={ICON_SIZE} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [session,  setSession]  = useState(undefined); // undefined=cargando, null=sin sesión, obj=con sesión
  const [usuario,  setUsuario]  = useState(null);
  const pathname = usePathname();
  const router   = useRouter();

  // ── Sincronización con Supabase Auth ────────────────────────────────────────
  // onAuthStateChange dispara inmediatamente con el estado actual y cada vez
  // que el usuario hace login o logout en cualquier pestaña.
  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) cargarPerfil(s.user.id);
    });

    // 2. Suscribirse a cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user?.id) {
          await cargarPerfil(s.user.id);
        } else {
          setUsuario(null);
        }
      }
    );

    // Cleanup al desmontar
    return () => subscription.unsubscribe();
  }, []);

  async function cargarPerfil(userId) {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('nombre, email')
        .eq('id', userId)
        .single();
      setUsuario(data ?? null);
    } catch {
      setUsuario(null);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('[Navbar] Error al cerrar sesión:', err);
    }
  }

  const haySession = session !== undefined && session !== null;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 no-underline group"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              <Droplets size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
            >
              Dona<span style={{ color: 'var(--color-primary)' }}>Vida</span>
            </span>
          </Link>

          {/* ── Nav Links — desktop ────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-slate)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-navy)';
                    e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-slate)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── CTA / UserMenu — desktop ───────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {session === undefined ? (
              // Mientras resuelve la sesión → placeholder invisible para evitar layout shift
              <div className="w-28 h-8" aria-hidden="true" />
            ) : haySession ? (
              // Sesión activa → menú de usuario
              <UserMenu usuario={usuario} onLogout={handleLogout} />
            ) : (
              // Sin sesión → botones de auth
              <>
                <Link href="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger — mobile ─────────────────────────────────────── */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-150"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            style={{ color: 'var(--color-navy)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {menuOpen
              ? <X size={ICON_SIZE} aria-hidden="true" />
              : <Menu size={ICON_SIZE} aria-hidden="true" />
            }
          </button>

        </div>
      </div>

      {/* ── Mobile Menu Panel ─────────────────────────────────────────────── */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: menuOpen ? '400px' : '0px',
          borderTop: menuOpen ? `1px solid var(--color-border)` : 'none',
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">

          {/* Links */}
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-slate)', textDecoration: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-navy)';
                e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-slate)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {label}
            </Link>
          ))}

          <div className="my-2 border-t" style={{ borderColor: 'var(--color-border)' }} />

          {/* CTA mobile — condicional según sesión */}
          {haySession ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={ICON_SIZE} aria-hidden="true" />
                Mi panel
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-error-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={ICON_SIZE} aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn btn-ghost"
                style={{ textDecoration: 'none', justifyContent: 'flex-start' }}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
