import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo-dark.jpg";
import { usePublicContent } from "@/hooks/usePublicContent";

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { get, getImage } = usePublicContent();
  const lang = language;
  const footerLogo = getImage("images", "logo_dark", logo);
  const contactAddress = get("contact", "address", lang, t.contact.address);
  const contactPhone = get("contact", "phone", lang, t.contact.phoneNumber);
  const contactEmail = get("contact", "email", lang, t.contact.emailAddress);
  const footerDesc = get("footer", "description", lang,
    language === "he"
      ? "מומחיות בדין אזרחי וייעוץ משפטי לתאגידים ועמותות"
      : "Expertise in Civil Law & Corporate Legal Counsel"
  );
  const copyrightName = get("footer", "copyright_name", lang,
    language === "he" ? "עו\"ד איתן לוז" : "Eitan Luz, Adv."
  );

  return (
    <footer className="py-12 border-t border-border relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src={footerLogo} alt="לוגו עו״ד איתן לוז" className="h-16 w-auto object-contain rounded" />
            <p className="text-muted-foreground text-sm leading-relaxed text-center md:text-start">
              {footerDesc}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{contactAddress}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <a href={`tel:${contactPhone}`} className="hover:text-primary transition-colors">
                {contactPhone}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                {contactEmail}
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
          <a
            href="/admin/login"
            className="text-muted-foreground/30 text-xs hover:text-muted-foreground/60 transition-colors cursor-pointer"
          >
            © {new Date().getFullYear()}{" "}
            {copyrightName}.{" "}
            {t.footer.rights}.
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
