import { Navbar } from '../components/navbar';
import { HeroSection } from '../components/hero-section';
import { AboutSection } from '../components/about-section';
import { IdeaSection } from '../components/idea-section';
import { MissionSection } from '../components/mission-section';
import { FeaturesSection } from '../components/features-section';
import { ContactSection } from '../components/contact-section';
import { Footer } from '../components/footer';
import { ScrollToTop } from '../components/scroll-to-top';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <IdeaSection />
      <MissionSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}