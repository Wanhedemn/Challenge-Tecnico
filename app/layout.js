import './globals.css';

export const metadata = {
  title: 'DonaVida - Plataforma de Donación de Sangre',
  description: 'Conectando donantes con hospitales de forma ágil y segura.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
