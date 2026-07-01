import Hero from '../components/home/Hero';
import UrgenciasHome from '../components/home/UrgenciasCarousel'; // Usando el archivo renombrado internamente
import RequisitosSection from '../components/home/RequisitosSection';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <UrgenciasHome />
      <RequisitosSection />
    </main>
  );
}
