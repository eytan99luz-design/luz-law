import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Award, Users, Clock, Shield } from "lucide-react";
import profileStanding from "@/assets/profile-standing.jpg";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Award,
  Users,
  Clock,
  Shield,
};

const WhyChooseSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="why-me" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">{t.whyMe.title}</h2>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto items-center">
            {/* Left reasons */}
            <div className="space-y-10">
              {t.whyMe.reasons.slice(0, 2).map((reason, index) => {
                const Icon = iconMap[reason.icon] || Award;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 * index }}
                    className="text-center lg:text-end group"
                  >
                    <div className="flex flex-col items-center lg:items-end gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-gold transition-all duration-300"
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground">{reason.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{reason.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Center image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-gold-lg relative">
                <img
                  src={profileStanding}
                  alt="עו״ד איתן לוז"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
              {/* Decorative frame */}
              <div className="absolute -inset-3 border border-primary/15 rounded-lg" />
            </motion.div>

            {/* Right reasons */}
            <div className="space-y-10">
              {t.whyMe.reasons.slice(2, 4).map((reason, index) => {
                const Icon = iconMap[reason.icon] || Award;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 * (index + 2) }}
                    className="text-center lg:text-start group"
                  >
                    <div className="flex flex-col items-center lg:items-start gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-gold transition-all duration-300"
                      >
                        <Icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground">{reason.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{reason.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
