import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name_he: string;
  name_en: string;
  text_he: string;
  text_en: string;
  rating: number;
}

const TestimonialsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setTestimonials(data as Testimonial[]);
      });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (testimonials.length === 0) return null;

  const item = testimonials[current];

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
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
              {language === "he" ? "מה הלקוחות אומרים" : "What Our Clients Say"}
            </h2>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border rounded-lg p-8 md:p-12 text-center relative"
              >
                <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                  {language === "he" ? item.text_he : item.text_en}
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-primary font-semibold text-lg">
                  {language === "he" ? item.name_he : item.name_en}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prev}
              className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 p-2 rounded-full bg-card border border-border hover:border-primary/40 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 p-2 rounded-full bg-card border border-border hover:border-primary/40 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-primary w-6" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
