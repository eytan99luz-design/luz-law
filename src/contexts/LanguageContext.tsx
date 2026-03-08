import React, { createContext, useContext, useState, useCallback } from "react";
import { Language, translations, Translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("he");

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "he" ? "en" : "he"));
  }, []);

  const t = translations[language];
  const dir = t.dir;

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, dir }}>
      <div dir={dir} className={language === "he" ? "font-heebo" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
