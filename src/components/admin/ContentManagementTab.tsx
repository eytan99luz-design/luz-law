import React, { useState, useEffect } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, Image as ImageIcon, Type, Palette, Phone, Mail, MapPin, Globe } from "lucide-react";

type FieldConfig = {
  section: string;
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "color";
  bilingual?: boolean;
};

const heroFields: FieldConfig[] = [
  { section: "hero", key: "title", label: "כותרת ראשית", type: "text", bilingual: true },
  { section: "hero", key: "subtitle", label: "כותרת משנית", type: "text", bilingual: true },
  { section: "hero", key: "description", label: "תיאור", type: "textarea", bilingual: true },
  { section: "hero", key: "cta_text", label: "טקסט כפתור CTA", type: "text", bilingual: true },
  { section: "hero", key: "phone_text", label: "טקסט כפתור טלפון", type: "text", bilingual: true },
  { section: "hero", key: "profile_image", label: "תמונת פרופיל ראשית", type: "image" },
];

const aboutFields: FieldConfig[] = [
  { section: "about", key: "title", label: "כותרת", type: "text", bilingual: true },
  { section: "about", key: "paragraph_1", label: "פסקה ראשונה", type: "textarea", bilingual: true },
  { section: "about", key: "paragraph_2", label: "פסקה שנייה", type: "textarea", bilingual: true },
  { section: "about", key: "paragraph_3", label: "פסקה שלישית", type: "textarea", bilingual: true },
  { section: "about", key: "main_image", label: "תמונה ראשית", type: "image" },
  { section: "about", key: "secondary_image", label: "תמונה משנית", type: "image" },
];

const contactFields: FieldConfig[] = [
  { section: "contact", key: "title", label: "כותרת", type: "text", bilingual: true },
  { section: "contact", key: "subtitle", label: "כותרת משנית", type: "textarea", bilingual: true },
  { section: "contact", key: "address", label: "כתובת", type: "text", bilingual: true },
  { section: "contact", key: "phone", label: "טלפון", type: "text" },
  { section: "contact", key: "email", label: "אימייל", type: "text" },
];

const footerFields: FieldConfig[] = [
  { section: "footer", key: "description", label: "תיאור קצר", type: "textarea", bilingual: true },
  { section: "footer", key: "copyright_name", label: "שם בקופירייט", type: "text", bilingual: true },
];

const imageFields: FieldConfig[] = [
  { section: "images", key: "logo_dark", label: "לוגו כהה (למצב כהה)", type: "image" },
  { section: "images", key: "logo_light", label: "לוגו בהיר (למצב בהיר)", type: "image" },
  { section: "images", key: "profile_headshot", label: "תמונת פרופיל - Hero", type: "image" },
  { section: "images", key: "profile_hero", label: "תמונת אודות - ראשית", type: "image" },
  { section: "images", key: "profile_consult", label: "תמונת אודות - משנית", type: "image" },
  { section: "images", key: "profile_standing", label: "תמונת למה לבחור בנו", type: "image" },
  { section: "images", key: "bg_portrait", label: "תמונת רקע", type: "image" },
];

const designFields: FieldConfig[] = [
  { section: "design", key: "primary_color", label: "צבע ראשי (זהב)", type: "color" },
  { section: "design", key: "background_color", label: "צבע רקע", type: "color" },
  { section: "design", key: "card_color", label: "צבע כרטיסים", type: "color" },
  { section: "design", key: "text_color", label: "צבע טקסט", type: "color" },
];

const practiceAreaKeys = [
  { key: "area_1", icon: "FileText" },
  { key: "area_2", icon: "Building2" },
  { key: "area_3", icon: "Briefcase" },
  { key: "area_4", icon: "Heart" },
  { key: "area_5", icon: "Scale" },
  { key: "area_6", icon: "Handshake" },
];

const whyChooseKeys = [
  { key: "reason_1", icon: "Award" },
  { key: "reason_2", icon: "Users" },
  { key: "reason_3", icon: "Clock" },
  { key: "reason_4", icon: "Shield" },
];

// Local state manager for form fields
function useFormState(content: any[], getValue: (s: string, k: string, l?: "he" | "en") => string) {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const getKey = (section: string, key: string, suffix: string = "") =>
    `${section}:${key}${suffix}`;

  const getLocal = (section: string, key: string, lang?: "he" | "en") => {
    const k = getKey(section, key, lang ? `:${lang}` : "");
    if (k in localValues) return localValues[k];
    return getValue(section, key, lang);
  };

  const setLocal = (section: string, key: string, value: string, lang?: "he" | "en") => {
    const k = getKey(section, key, lang ? `:${lang}` : "");
    setLocalValues((prev) => ({ ...prev, [k]: value }));
    setDirty((prev) => new Set(prev).add(`${section}:${key}`));
  };

  const isDirty = (section: string, key: string) => dirty.has(`${section}:${key}`);

  const clearDirty = (section: string, key: string) => {
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(`${section}:${key}`);
      return next;
    });
  };

  return { getLocal, setLocal, isDirty, clearDirty };
}

const ContentManagementTab: React.FC = () => {
  const { content, loading, getValue, saveField, uploadImage, load } = useSiteContent();
  const form = useFormState(content, getValue);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-primary animate-pulse">טוען תוכן...</div>
      </div>
    );
  }

  const handleSave = async (field: FieldConfig) => {
    if (field.bilingual) {
      await saveField(
        field.section,
        field.key,
        null,
        form.getLocal(field.section, field.key, "he"),
        form.getLocal(field.section, field.key, "en"),
        field.type === "textarea" ? "text" : field.type
      );
    } else {
      await saveField(
        field.section,
        field.key,
        form.getLocal(field.section, field.key),
        null,
        null,
        field.type
      );
    }
    form.clearDirty(field.section, field.key);
  };

  const handleImageUpload = async (field: FieldConfig, file: File) => {
    await uploadImage(field.section, field.key, file);
  };

  const renderTextField = (field: FieldConfig) => {
    const InputComponent = field.type === "textarea" ? Textarea : Input;

    if (field.bilingual) {
      return (
        <div key={`${field.section}-${field.key}`} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">{field.label}</Label>
            <Button
              size="sm"
              onClick={() => handleSave(field)}
              disabled={!form.isDirty(field.section, field.key)}
              className="bg-gradient-gold text-primary-foreground"
            >
              <Save className="h-3 w-3 ml-1" />
              שמור
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">🇮🇱 עברית</Label>
              <InputComponent
                value={form.getLocal(field.section, field.key, "he")}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  form.setLocal(field.section, field.key, e.target.value, "he")
                }
                className="mt-1"
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇺🇸 English</Label>
              <InputComponent
                value={form.getLocal(field.section, field.key, "en")}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  form.setLocal(field.section, field.key, e.target.value, "en")
                }
                className="mt-1"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={`${field.section}-${field.key}`} className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">{field.label}</Label>
          <Button
            size="sm"
            onClick={() => handleSave(field)}
            disabled={!form.isDirty(field.section, field.key)}
            className="bg-gradient-gold text-primary-foreground"
          >
            <Save className="h-3 w-3 ml-1" />
            שמור
          </Button>
        </div>
        {field.type === "color" ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.getLocal(field.section, field.key) || "#c5963a"}
              onChange={(e) => form.setLocal(field.section, field.key, e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={form.getLocal(field.section, field.key) || ""}
              onChange={(e) => form.setLocal(field.section, field.key, e.target.value)}
              placeholder="#c5963a"
              className="flex-1"
            />
          </div>
        ) : (
          <InputComponent
            value={form.getLocal(field.section, field.key)}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              form.setLocal(field.section, field.key, e.target.value)
            }
          />
        )}
      </div>
    );
  };

  const renderImageField = (field: FieldConfig) => {
    const currentUrl = getValue(field.section, field.key);
    return (
      <div key={`${field.section}-${field.key}`} className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Label className="text-base font-semibold">{field.label}</Label>
        <div className="flex items-start gap-4">
          {currentUrl ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-border shrink-0">
              <img src={currentUrl} alt={field.label} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center shrink-0">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(field, file);
                }}
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary text-sm font-medium w-fit">
                <Upload className="h-4 w-4" />
                העלה תמונה חדשה
              </div>
            </label>
            {currentUrl && (
              <p className="text-xs text-muted-foreground break-all max-w-xs">{currentUrl.split("/").pop()}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPracticeAreas = () => (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">כותרת הסקשן</Label>
          <Button
            size="sm"
            onClick={() => handleSave({ section: "practice_areas", key: "title", label: "", type: "text", bilingual: true })}
            disabled={!form.isDirty("practice_areas", "title")}
            className="bg-gradient-gold text-primary-foreground"
          >
            <Save className="h-3 w-3 ml-1" />
            שמור
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">🇮🇱 עברית</Label>
            <Input
              value={form.getLocal("practice_areas", "title", "he")}
              onChange={(e) => form.setLocal("practice_areas", "title", e.target.value, "he")}
              dir="rtl"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">🇺🇸 English</Label>
            <Input
              value={form.getLocal("practice_areas", "title", "en")}
              onChange={(e) => form.setLocal("practice_areas", "title", e.target.value, "en")}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {practiceAreaKeys.map(({ key, icon }, idx) => (
        <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">תחום {idx + 1} ({icon})</Label>
            <Button
              size="sm"
              onClick={async () => {
                await saveField("practice_areas", `${key}_title`, null,
                  form.getLocal("practice_areas", `${key}_title`, "he"),
                  form.getLocal("practice_areas", `${key}_title`, "en")
                );
                await saveField("practice_areas", `${key}_desc`, null,
                  form.getLocal("practice_areas", `${key}_desc`, "he"),
                  form.getLocal("practice_areas", `${key}_desc`, "en")
                );
                await saveField("practice_areas", `${key}_icon`, icon);
                form.clearDirty("practice_areas", `${key}_title`);
                form.clearDirty("practice_areas", `${key}_desc`);
              }}
              disabled={!form.isDirty("practice_areas", `${key}_title`) && !form.isDirty("practice_areas", `${key}_desc`)}
              className="bg-gradient-gold text-primary-foreground"
            >
              <Save className="h-3 w-3 ml-1" />
              שמור
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">🇮🇱 כותרת</Label>
              <Input
                value={form.getLocal("practice_areas", `${key}_title`, "he")}
                onChange={(e) => form.setLocal("practice_areas", `${key}_title`, e.target.value, "he")}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇺🇸 Title</Label>
              <Input
                value={form.getLocal("practice_areas", `${key}_title`, "en")}
                onChange={(e) => form.setLocal("practice_areas", `${key}_title`, e.target.value, "en")}
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇮🇱 תיאור</Label>
              <Textarea
                value={form.getLocal("practice_areas", `${key}_desc`, "he")}
                onChange={(e) => form.setLocal("practice_areas", `${key}_desc`, e.target.value, "he")}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇺🇸 Description</Label>
              <Textarea
                value={form.getLocal("practice_areas", `${key}_desc`, "en")}
                onChange={(e) => form.setLocal("practice_areas", `${key}_desc`, e.target.value, "en")}
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">אייקון</Label>
            <Input
              value={form.getLocal("practice_areas", `${key}_icon`) || icon}
              onChange={(e) => form.setLocal("practice_areas", `${key}_icon`, e.target.value)}
              placeholder="FileText, Building2, Briefcase..."
              className="max-w-xs"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderWhyChoose = () => (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">כותרת הסקשן</Label>
          <Button
            size="sm"
            onClick={() => handleSave({ section: "why_choose", key: "title", label: "", type: "text", bilingual: true })}
            disabled={!form.isDirty("why_choose", "title")}
            className="bg-gradient-gold text-primary-foreground"
          >
            <Save className="h-3 w-3 ml-1" />
            שמור
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">🇮🇱 עברית</Label>
            <Input
              value={form.getLocal("why_choose", "title", "he")}
              onChange={(e) => form.setLocal("why_choose", "title", e.target.value, "he")}
              dir="rtl"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">🇺🇸 English</Label>
            <Input
              value={form.getLocal("why_choose", "title", "en")}
              onChange={(e) => form.setLocal("why_choose", "title", e.target.value, "en")}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {whyChooseKeys.map(({ key, icon }, idx) => (
        <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">סיבה {idx + 1} ({icon})</Label>
            <Button
              size="sm"
              onClick={async () => {
                await saveField("why_choose", `${key}_title`, null,
                  form.getLocal("why_choose", `${key}_title`, "he"),
                  form.getLocal("why_choose", `${key}_title`, "en")
                );
                await saveField("why_choose", `${key}_desc`, null,
                  form.getLocal("why_choose", `${key}_desc`, "he"),
                  form.getLocal("why_choose", `${key}_desc`, "en")
                );
                form.clearDirty("why_choose", `${key}_title`);
                form.clearDirty("why_choose", `${key}_desc`);
              }}
              disabled={!form.isDirty("why_choose", `${key}_title`) && !form.isDirty("why_choose", `${key}_desc`)}
              className="bg-gradient-gold text-primary-foreground"
            >
              <Save className="h-3 w-3 ml-1" />
              שמור
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">🇮🇱 כותרת</Label>
              <Input
                value={form.getLocal("why_choose", `${key}_title`, "he")}
                onChange={(e) => form.setLocal("why_choose", `${key}_title`, e.target.value, "he")}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇺🇸 Title</Label>
              <Input
                value={form.getLocal("why_choose", `${key}_title`, "en")}
                onChange={(e) => form.setLocal("why_choose", `${key}_title`, e.target.value, "en")}
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇮🇱 תיאור</Label>
              <Textarea
                value={form.getLocal("why_choose", `${key}_desc`, "he")}
                onChange={(e) => form.setLocal("why_choose", `${key}_desc`, e.target.value, "he")}
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">🇺🇸 Description</Label>
              <Textarea
                value={form.getLocal("why_choose", `${key}_desc`, "en")}
                onChange={(e) => form.setLocal("why_choose", `${key}_desc`, e.target.value, "en")}
                dir="ltr"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">ניהול תוכן האתר</h2>
      <p className="text-muted-foreground">
        כאן תוכל לערוך את כל התכנים, התמונות והעיצוב של האתר. שינויים יופיעו מיד באתר הציבורי.
      </p>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="hero" className="data-[state=active]:bg-primary/20 text-xs">
            <Type className="h-3 w-3 ml-1" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-primary/20 text-xs">
            <Type className="h-3 w-3 ml-1" />
            אודות
          </TabsTrigger>
          <TabsTrigger value="practice" className="data-[state=active]:bg-primary/20 text-xs">
            <Globe className="h-3 w-3 ml-1" />
            תחומים
          </TabsTrigger>
          <TabsTrigger value="whychoose" className="data-[state=active]:bg-primary/20 text-xs">
            <Globe className="h-3 w-3 ml-1" />
            למה לבחור
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-primary/20 text-xs">
            <Phone className="h-3 w-3 ml-1" />
            צור קשר
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-primary/20 text-xs">
            <Type className="h-3 w-3 ml-1" />
            פוטר
          </TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-primary/20 text-xs">
            <ImageIcon className="h-3 w-3 ml-1" />
            תמונות
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-primary/20 text-xs">
            <Palette className="h-3 w-3 ml-1" />
            עיצוב
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          {heroFields.map((f) => f.type === "image" ? renderImageField(f) : renderTextField(f))}
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          {aboutFields.map((f) => f.type === "image" ? renderImageField(f) : renderTextField(f))}
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          {renderPracticeAreas()}
        </TabsContent>

        <TabsContent value="whychoose" className="space-y-4">
          {renderWhyChoose()}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          {contactFields.map((f) => f.type === "image" ? renderImageField(f) : renderTextField(f))}
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          {footerFields.map((f) => renderTextField(f))}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            העלה תמונות חדשות כדי להחליף את התמונות הקיימות באתר. תמונות מומלצות בגודל מינימלי של 800×600 פיקסלים.
          </p>
          {imageFields.map((f) => renderImageField(f))}
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            שנה את הצבעים הראשיים של האתר. הזן ערכי צבע בפורמט HEX (למשל #c5963a).
          </p>
          {designFields.map((f) => renderTextField(f))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagementTab;