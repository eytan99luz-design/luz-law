import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-3">
              {language === "he" ? "עו\"ד איתן לוז" : "Eitan Luz, Adv."}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
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
