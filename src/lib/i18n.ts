export type Language = "he" | "en";

export const translations = {
  he: {
    dir: "rtl" as const,
    nav: {
      home: "ראשי",
      about: "אודות",
      practiceAreas: "תחומי עיסוק",
      whyMe: "למה לבחור בי",
      contact: "צור קשר",
    },
    hero: {
      title: "עו\"ד איתן לוז",
      subtitle: "משרד עורכי דין",
      description: "מומחיות בדין אזרחי, ייעוץ משפטי לתאגידים, עמותות וחברות",
      cta: "צור קשר",
      phone: "התקשר עכשיו",
    },
    about: {
      title: "אודות",
      p1: "עו\"ד איתן לוז מתמחה בתחום הדין האזרחי ומעניק ייעוץ משפטי מקיף לתאגידים, עמותות, חברות ויחידים. עם ניסיון רב שנים בתחום, המשרד מספק מענה מקצועי ואישי לכל לקוח.",
      p2: "המשרד פועל מתוך אמונה בשירות אישי, מקצועי ואמין. אנו מלווים את לקוחותינו בכל שלב, תוך מתן מענה מהיר ויעיל לכל צורך משפטי.",
      p3: "הגישה שלנו משלבת מקצועיות ללא פשרות עם יחס אנושי וחם, כדי להבטיח את התוצאה הטובה ביותר עבורכם.",
    },
    practiceAreas: {
      title: "תחומי עיסוק",
      areas: [
        {
          title: "דיני חוזים",
          description: "ניסוח, בדיקה וליווי חוזים מסחריים ואישיים. הגנה על האינטרסים שלכם בכל עסקה.",
          icon: "FileText",
        },
        {
          title: "נדל\"ן ומקרקעין",
          description: "ליווי עסקאות נדל\"ן, רישום זכויות, טאבו ותכנון ובנייה. מקצועיות בכל שלב.",
          icon: "Building2",
        },
        {
          title: "דיני תאגידים",
          description: "ייעוץ וליווי משפטי לחברות, שותפויות ותאגידים. הקמה, ניהול ורגולציה.",
          icon: "Briefcase",
        },
        {
          title: "ייעוץ לעמותות",
          description: "הקמת עמותות, ניהול שוטף, דיווח לרשם העמותות וליווי משפטי מלא.",
          icon: "Heart",
        },
        {
          title: "ליטיגציה אזרחית",
          description: "ייצוג בתביעות אזרחיות, סכסוכים מסחריים ותביעות כספיות בכל הערכאות.",
          icon: "Scale",
        },
        {
          title: "גישור ובוררות",
          description: "פתרון סכסוכים בדרכים חלופיות. חיסכון בזמן ובעלויות תוך שמירה על האינטרסים.",
          icon: "Handshake",
        },
      ],
    },
    whyMe: {
      title: "למה לבחור בנו",
      reasons: [
        {
          title: "מקצועיות ללא פשרות",
          description: "ניסיון רב שנים ומומחיות מוכחת בתחומי המשפט האזרחי והמסחרי.",
          icon: "Award",
        },
        {
          title: "יחס אישי",
          description: "כל לקוח מקבל תשומת לב מלאה וליווי צמוד לאורך כל הדרך.",
          icon: "Users",
        },
        {
          title: "זמינות ומהירות",
          description: "מענה מהיר ויעיל, זמינות גבוהה ועמידה בלוחות זמנים.",
          icon: "Clock",
        },
        {
          title: "יושרה ואמינות",
          description: "שקיפות מלאה, עבודה ישרה והקפדה על ערכים אתיים בכל התנהלות.",
          icon: "Shield",
        },
      ],
    },
    contact: {
      title: "צור קשר",
      subtitle: "נשמח לעמוד לשירותכם. מלאו את הפרטים ונחזור אליכם בהקדם.",
      name: "שם מלא",
      email: "כתובת מייל",
      phone: "טלפון",
      message: "הודעה",
      send: "שלח הודעה",
      sending: "שולח...",
      success: "ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.",
      error: "אירעה שגיאה. אנא נסו שנית.",
      address: "נווה דקלים 30, נתיבות",
      phoneNumber: "054-9183429",
      emailAddress: "eytanluz.law@gmail.com",
    },
    footer: {
      rights: "כל הזכויות שמורות",
      privacy: "מדיניות פרטיות",
      terms: "תנאי שימוש",
      accessibility: "נגישות",
    },
  },
  en: {
    dir: "ltr" as const,
    nav: {
      home: "Home",
      about: "About",
      practiceAreas: "Practice Areas",
      whyMe: "Why Choose Us",
      contact: "Contact",
    },
    hero: {
      title: "Eitan Luz, Adv.",
      subtitle: "Law Office",
      description: "Expertise in Civil Law, Corporate Legal Counsel, NGOs & Associations",
      cta: "Contact Us",
      phone: "Call Now",
    },
    about: {
      title: "About",
      p1: "Adv. Eitan Luz specializes in civil law and provides comprehensive legal counsel to corporations, NGOs, companies, and individuals. With years of experience in the field, the firm delivers professional and personalized service to every client.",
      p2: "The firm operates with a belief in personal, professional, and reliable service. We accompany our clients at every stage, providing quick and efficient solutions for every legal need.",
      p3: "Our approach combines uncompromising professionalism with a warm, human touch to ensure the best outcome for you.",
    },
    practiceAreas: {
      title: "Practice Areas",
      areas: [
        {
          title: "Contract Law",
          description: "Drafting, reviewing, and managing commercial and personal contracts. Protecting your interests in every transaction.",
          icon: "FileText",
        },
        {
          title: "Real Estate",
          description: "Real estate transactions, property registration, land registry, and construction planning. Professionalism at every step.",
          icon: "Building2",
        },
        {
          title: "Corporate Law",
          description: "Legal counsel for companies, partnerships, and corporations. Establishment, management, and regulation.",
          icon: "Briefcase",
        },
        {
          title: "NGO Consulting",
          description: "Establishing NGOs, ongoing management, reporting to the registrar, and full legal support.",
          icon: "Heart",
        },
        {
          title: "Civil Litigation",
          description: "Representation in civil lawsuits, commercial disputes, and monetary claims in all courts.",
          icon: "Scale",
        },
        {
          title: "Mediation & Arbitration",
          description: "Alternative dispute resolution. Saving time and costs while protecting your interests.",
          icon: "Handshake",
        },
      ],
    },
    whyMe: {
      title: "Why Choose Us",
      reasons: [
        {
          title: "Uncompromising Professionalism",
          description: "Years of experience and proven expertise in civil and commercial law.",
          icon: "Award",
        },
        {
          title: "Personal Attention",
          description: "Every client receives full attention and close guidance throughout the process.",
          icon: "Users",
        },
        {
          title: "Availability & Speed",
          description: "Quick and efficient response, high availability, and meeting deadlines.",
          icon: "Clock",
        },
        {
          title: "Integrity & Reliability",
          description: "Full transparency, honest work, and adherence to ethical values in every interaction.",
          icon: "Shield",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      subtitle: "We'd be happy to assist you. Fill in your details and we'll get back to you shortly.",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully! We'll get back to you soon.",
      error: "An error occurred. Please try again.",
      address: "30 Neve Dekalim, Netivot",
      phoneNumber: "054-9183429",
      emailAddress: "eytanluz.law@gmail.com",
    },
    footer: {
      rights: "All rights reserved",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      accessibility: "Accessibility",
    },
  },
} as const;

export type Translations = typeof translations.he | typeof translations.en;
