import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            {/* Section title */}
            <div className="text-center mb-16">
              <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">{t.about.title}</h2>
              <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-lg bg-secondary border border-border overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl text-primary font-bold">א</span>
                    </div>
                    <p className="text-sm">תמונת פרופיל</p>
                  </div>
                </div>
                {/* Gold corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-6"
            >
              <p className="text-foreground/90 leading-relaxed text-lg">{t.about.p1}</p>
              <p className="text-muted-foreground leading-relaxed">{t.about.p2}</p>
              <p className="text-muted-foreground leading-relaxed">{t.about.p3}</p>
              <div className="w-16 h-0.5 bg-gradient-gold mt-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
