'use client';
import Link from 'next/link';
import { Droplets } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 py-16 mt-auto w-full border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-12">
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-12">
          
          {/* Columna 1: Marca */}
          <div className="flex flex-col md:w-1/3">
            <Link
              href="/"
              className="flex items-center gap-2 no-underline group mb-3"
              style={{ textDecoration: 'none', width: 'fit-content' }}
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
            <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Conectando donantes con esperanza.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div className="flex flex-col md:w-1/3">
            <h3 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
              Navegación
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/#nosotros" className="text-sm text-gray-700 hover:text-red-600 transition-colors duration-200" style={{ fontFamily: 'var(--font-body)' }}>
                Sobre nosotros
              </Link>
              <Link href="/#requisitos" className="text-sm text-gray-700 hover:text-red-600 transition-colors duration-200" style={{ fontFamily: 'var(--font-body)' }}>
                Requisitos para donar
              </Link>
              <Link href="/#contacto" className="text-sm text-gray-700 hover:text-red-600 transition-colors duration-200" style={{ fontFamily: 'var(--font-body)' }}>
                Contacto
              </Link>
            </div>
          </div>

          {/* Columna 3: Social y Legal */}
          <div className="flex flex-col md:w-1/3 md:items-end">
            <h3 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
              Síguenos
            </h3>
            <div className="flex space-x-5 mb-6">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.6l.4-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Línea de copyright independiente al final */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs text-gray-500 text-center md:text-left" style={{ fontFamily: 'var(--font-body)' }}>
            © 2026 DonaVida. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
