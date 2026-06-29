import Hero from '@/components/home/Hero';

/**
 * LandingPage — Punto de entrada público de la aplicación.
 * Renderiza las secciones de la Home en orden lógico.
 */
export default function LandingPage() {
  return (
    <main>
      <Hero />
      {/*
        Próximas secciones a agregar:
        <MapaUrgencias />
        <ComoFunciona />
        <Footer />
      */}
    </main>
  );
}
