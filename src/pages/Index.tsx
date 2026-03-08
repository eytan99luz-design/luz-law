import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PracticeAreasSection from "@/components/PracticeAreasSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import bgPortrait from "@/assets/bg-portrait.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed parallax background */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${bgPortrait})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Gradient overlay for readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />

      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <PracticeAreasSection />
          <WhyChooseSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
