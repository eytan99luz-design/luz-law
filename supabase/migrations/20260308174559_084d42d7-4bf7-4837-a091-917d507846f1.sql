
-- Drop the permissive INSERT policy and replace with a more specific one
DROP POLICY "Anyone can submit contact form" ON public.contact_submissions;

-- Create a more specific insert policy that still allows public submissions
-- but validates required fields are present
CREATE POLICY "Public can submit contact form" ON public.contact_submissions
FOR INSERT WITH CHECK (
  name IS NOT NULL AND name <> '' AND
  email IS NOT NULL AND email <> '' AND
  message IS NOT NULL AND message <> ''
);
