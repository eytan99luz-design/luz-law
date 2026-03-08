import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import profileHero from "@/assets/profile-hero.jpg";
import profileConsult from "@/assets/profile-consult.jpg";

const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="container mx-auto px-4">
        <div ref={ref} className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-16">
              <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">{t.about.title}</h2>
              <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-[4/5] rounded-lg overflow-hidden shadow-gold-lg relative z-10"
                >
                  <img
                    src={profileHero}
                    alt="עו״ד איתן לוז במשרד"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute -bottom-6 -right-6 w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shadow-xl border-2 border-background z-20"
                >
                  <img
                    src={profileConsult}
                    alt="עו״ד איתן לוז בפגישת ייעוץ"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>

                <div className="absolute -top-4 -left-4 w-full h-full border border-primary/20 rounded-lg -z-10" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 md:pr-4"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
                className="text-foreground/90 leading-relaxed text-lg"
              >
                {t.about.p1}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground leading-relaxed"
              >
                {t.about.p2}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground leading-relaxed"
              >
                {t.about.p3}
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="w-16 h-0.5 bg-gradient-gold origin-right"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
