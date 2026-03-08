import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="py-12 border-t border-border relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="h-14 px-3 py-1.5 bg-white/95 rounded-md shadow-sm inline-block">
              <img src={logo} alt="לוגו עו״ד איתן לוז" className="h-full w-auto object-contain" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed text-center md:text-start">
              {language === "he"
                ? "מומחיות בדין אזרחי וייעוץ משפטי לתאגידים ועמותות"
                : "Expertise in Civil Law & Corporate Legal Counsel"}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{t.contact.address}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <a href="tel:054-9183429" className="hover:text-primary transition-colors">
                {t.contact.phoneNumber}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <a href="mailto:eytanluz.law@gmail.com" className="hover:text-primary transition-colors">
                {t.contact.emailAddress}
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.footer.accessibility}</a>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}{" "}
            {language === "he" ? "עו\"ד איתן לוז" : "Eitan Luz, Adv."}.{" "}
            {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
