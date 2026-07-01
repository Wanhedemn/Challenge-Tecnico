import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const metadata = {
  title: 'DonaVida - Plataforma de Donación de Sangre',
  description: 'Conectando donantes con hospitales de forma ágil y segura.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className="min-h-screen antialiased flex flex-col bg-white"
        style={{ color: 'var(--color-navy)' }}
      >
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
