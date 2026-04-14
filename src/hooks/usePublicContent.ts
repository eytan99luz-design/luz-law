import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContentMap = Record<string, Record<string, { value?: string | null; value_he?: string | null; value_en?: string | null }>>;

let cachedContent: ContentMap | null = null;
let cachePromise: Promise<ContentMap> | null = null;

async function fetchContent(): Promise<ContentMap> {
  const { data } = await supabase.from("site_content").select("section,key,value,value_he,value_en");
  const map: ContentMap = {};
  (data || []).forEach((row: any) => {
    if (!map[row.section]) map[row.section] = {};
    map[row.section][row.key] = { value: row.value, value_he: row.value_he, value_en: row.value_en };
  });
  return map;
}

export function usePublicContent() {
  const [content, setContent] = useState<ContentMap>(cachedContent || {});
  const [loaded, setLoaded] = useState(!!cachedContent);

  useEffect(() => {
    if (cachedContent) {
      setContent(cachedContent);
      setLoaded(true);
      return;
    }
    if (!cachePromise) {
      cachePromise = fetchContent();
    }
    cachePromise.then((data) => {
      cachedContent = data;
      setContent(data);
      setLoaded(true);
    });
  }, []);

  const get = useCallback(
    (section: string, key: string, lang: "he" | "en", fallback: string): string => {
      const item = content[section]?.[key];
      if (!item) return fallback;
      const val = lang === "he" ? (item.value_he || item.value) : (item.value_en || item.value);
      return val || fallback;
    },
    [content]
  );

  const getImage = useCallback(
    (section: string, key: string, fallback: string): string => {
      const item = content[section]?.[key];
      return item?.value || fallback;
    },
    [content]
  );

  return { get, getImage, loaded };
}