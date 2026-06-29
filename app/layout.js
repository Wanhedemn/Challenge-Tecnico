import './globals.css';
import Navbar from '../components/layout/Navbar';

export const metadata = {
  title: 'DonaVida - Plataforma de Donación de Sangre',
  description: 'Conectando donantes con hospitales de forma ágil y segura.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
      >
        {/* Navbar global — visible en todas las páginas */}
        <Navbar />

        {/* Contenido de cada página */}
        {children}
      </body>
    </html>
  );
}
