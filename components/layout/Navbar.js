'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navbar — Barra de navegación global.
 *
 * Estructura:
 *   [Logo]       [Nav Links]       [CTA Buttons]
 *   DonaVida     Inicio Urgencias  Iniciar Sesión | Registrarse
 *
 * Responsive:
 *   - Desktop (lg+): todo en una fila horizontal
 *   - Mobile (<lg):  menú hamburguesa con panel deslizable
 *
 * UI Kit usado: .btn, .btn-primary, .btn-sm, .btn-ghost (globals.css)
 */

const NAV_LINKS = [
  { label: 'Inicio',      href: '/'           },
  { label: 'Urgencias',   href: '#urgencias'  },
  { label: 'Requisitos',  href: '#requisitos' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
      {/* ── Inner container — alineado con .section ──────────── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 no-underline group"
            style={{ textDecoration: 'none' }}
          >
            {/* Ícono de gota de sangre */}
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-extrabold transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
              aria-hidden="true"
            >
              🩸
            </span>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
            >
              Dona<span style={{ color: 'var(--color-primary)' }}>Vida</span>
            </span>
          </Link>

          {/* ── Nav Links — solo desktop ──────────────────────── */}
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
                  {/* Indicador de ruta activa */}
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

          {/* ── CTA Buttons — solo desktop ────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link href="/registro" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              Registrarse
            </Link>
          </div>

          {/* ── Hamburger button — solo mobile ───────────────── */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg gap-1.5 transition-colors duration-150"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            style={{ color: 'var(--color-navy)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* Las tres barras se transforman en X con CSS transition */}
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                backgroundColor: 'currentColor',
                transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'currentColor',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                backgroundColor: 'currentColor',
                transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
              }}
            />
          </button>

        </div>
      </div>

      {/* ── Mobile Menu Panel ─────────────────────────────────── */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: menuOpen ? '400px' : '0px',
          borderTop: menuOpen ? `1px solid var(--color-border)` : 'none',
        }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">

          {/* Links del menú móvil */}
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-slate)',
                textDecoration: 'none',
              }}
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

          {/* Divider */}
          <div className="my-2 border-t" style={{ borderColor: 'var(--color-border)' }} />

          {/* CTA buttons móvil */}
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
        </div>
      </div>
    </header>
  );
}
