import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SiteContentItem = {
  id?: string;
  section: string;
  key: string;
  value: string | null;
  value_he: string | null;
  value_en: string | null;
  content_type: string;
};

export function useSiteContent() {
  const [content, setContent] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("section")
      .order("key");
    if (error) {
      toast({ title: "שגיאה בטעינת תוכן", variant: "destructive" });
    } else {
      setContent(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const getValue = useCallback(
    (section: string, key: string, lang?: "he" | "en"): string => {
      const item = content.find((c) => c.section === section && c.key === key);
      if (!item) return "";
      if (lang === "he") return item.value_he || item.value || "";
      if (lang === "en") return item.value_en || item.value || "";
      return item.value || "";
    },
    [content]
  );

  const upsert = async (
    section: string,
    key: string,
    updates: Partial<SiteContentItem>
  ) => {
    const existing = content.find(
      (c) => c.section === section && c.key === key
    );
    if (existing?.id) {
      const { error } = await supabase
        .from("site_content")
        .update(updates)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("site_content").insert({
        section,
        key,
        content_type: updates.content_type || "text",
        ...updates,
      });
      if (error) throw error;
    }
  };

  const saveField = async (
    section: string,
    key: string,
    value: string | null,
    valueHe?: string | null,
    valueEn?: string | null,
    contentType: string = "text"
  ) => {
    try {
      await upsert(section, key, {
        value,
        value_he: valueHe ?? null,
        value_en: valueEn ?? null,
        content_type: contentType,
      });
      await load();
      toast({ title: "נשמר בהצלחה" });
    } catch {
      toast({ title: "שגיאה בשמירה", variant: "destructive" });
    }
  };

  const uploadImage = async (
    section: string,
    key: string,
    file: File
  ): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${section}/${key}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      await upsert(section, key, {
        value: data.publicUrl,
        content_type: "image",
      });
      await load();
      toast({ title: "התמונה הועלתה בהצלחה" });
      return data.publicUrl;
    } catch {
      toast({ title: "שגיאה בהעלאת התמונה", variant: "destructive" });
      return null;
    }
  };

  return { content, loading, load, getValue, saveField, uploadImage };
}