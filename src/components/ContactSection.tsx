import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For now, just show success — will be connected to Edge Function later
    setTimeout(() => {
      toast({ title: t.contact.success });
      setForm({ name: "", email: "", phone: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: MapPin, text: t.contact.address },
    { icon: Phone, text: t.contact.phoneNumber, href: "tel:054-9183429" },
    { icon: Mail, text: t.contact.emailAddress, href: "mailto:eytanluz.law@gmail.com" },
  ];

  return (
    <section id="contact" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">{t.contact.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.contact.subtitle}</p>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-5"
            >
              <Input
                placeholder={t.contact.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-card border-border focus:border-primary"
              />
              <Input
                type="email"
                placeholder={t.contact.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-card border-border focus:border-primary"
              />
              <Input
                type="tel"
                placeholder={t.contact.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-card border-border focus:border-primary"
              />
              <Textarea
                placeholder={t.contact.message}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="bg-card border-border focus:border-primary resize-none"
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-gold"
              >
                <Send className="h-4 w-4" />
                {loading ? t.contact.sending : t.contact.send}
              </Button>
            </motion.form>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col justify-center space-y-8"
            >
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-foreground hover:text-primary transition-colors text-lg"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <p className="text-foreground text-lg">{item.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Decorative */}
              <div className="mt-8 p-6 rounded-lg border border-border bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.about.p2}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
