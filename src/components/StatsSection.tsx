import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Briefcase, TrendingUp, Award } from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Calendar, Users, Briefcase, TrendingUp, Award,
};

interface Stat {
  id: string;
  label_he: string;
  label_en: string;
  value: number;
  icon: string | null;
}

const AnimatedNumber: React.FC<{ target: number; isVisible: boolean; suffix?: string }> = ({ target, isVisible, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection: React.FC = () => {
  const { language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    supabase
      .from("stats")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setStats(data as Stat[]);
      });
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="container mx-auto px-4" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon || "Award"] || Award;
            const suffix = stat.label_en === "Success Rate" ? "%" : "+";
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center"
              >
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
                  <AnimatedNumber target={stat.value} isVisible={isVisible} suffix={suffix} />
                </div>
                <p className="text-muted-foreground text-sm">
                  {language === "he" ? stat.label_he : stat.label_en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
