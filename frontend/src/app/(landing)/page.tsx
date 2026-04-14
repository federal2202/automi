import AboutSection from "@/components/landing/AboutSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import CTASection from "@/components/landing/CTASection";
import HeroSection from "@/components/landing/HeroSection";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <HeroSection />
      <AboutSection />
      <ArchitectureSection />
      <CTASection />
    </div>
  );
}
