import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  FileText,
  Building2,
  Briefcase,
  Heart,
  Scale,
  Handshake,
} from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Building2,
  Briefcase,
  Heart,
  Scale,
  Handshake,
};

const PracticeAreasSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="practice-areas" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">
              {t.practiceAreas.title}
            </h2>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {t.practiceAreas.areas.map((area, index) => {
              const Icon = iconMap[area.icon] || FileText;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <div className="h-full rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-gold">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{area.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{area.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreasSection;
