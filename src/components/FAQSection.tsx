import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  id: string;
  question_he: string;
  question_en: string;
  answer_he: string;
  answer_en: string;
}

const FAQSection: React.FC = () => {
  const { language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setFaqs(data as FAQ[]);
      });
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 relative">
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
              {language === "he" ? "שאלות נפוצות" : "Frequently Asked Questions"}
            </h2>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="bg-card border border-border rounded-lg px-6 hover:border-primary/40 transition-colors"
                >
                  <AccordionTrigger className="text-foreground hover:text-primary text-start">
                    {language === "he" ? faq.question_he : faq.question_en}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {language === "he" ? faq.answer_he : faq.answer_en}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
