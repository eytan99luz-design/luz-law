import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import bgPortrait from "@/assets/bg-portrait.jpg";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const PracticeAreasSection = lazy(() => import("@/components/PracticeAreasSection"));
const WhyChooseSection = lazy(() => import("@/components/WhyChooseSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));

const SectionFallback = () => <div className="py-24" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${bgPortrait})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />

      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <Suspense fallback={<SectionFallback />}>
            <AboutSection />
            <StatsSection />
            <PracticeAreasSection />
            <WhyChooseSection />
            <TestimonialsSection />
            <BlogSection />
            <FAQSection />
            <ContactSection />
          </Suspense>
        </main>
        <Footer />
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default Index;
