
-- Create site_content table for all dynamic website content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  value_he TEXT,
  value_en TEXT,
  content_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section, key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can do everything with site_content"
ON public.site_content
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read site content (public website)
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
TO public
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for site assets (logos, images, backgrounds)
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies for site-assets
CREATE POLICY "Anyone can view site assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'::app_role));
