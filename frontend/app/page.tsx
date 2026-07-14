import { AboutSection } from "@/src/components/home/about-section";
import { FeaturesSection } from "@/src/components/home/features-section";
import { HeroSection } from "@/src/components/home/hero-section";
import { StatsSection } from "@/src/components/home/stats-section";
import { WorkingModulesSection } from "@/src/components/home/working-modules-section";
import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <WorkingModulesSection />
        <FeaturesSection />
        <StatsSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
