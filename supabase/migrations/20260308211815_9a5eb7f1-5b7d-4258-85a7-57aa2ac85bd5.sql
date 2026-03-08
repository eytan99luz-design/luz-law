
-- Allow public users to insert clients for booking (limited)
CREATE POLICY "Public can create client for booking"
  ON public.clients FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND full_name <> '' AND
    phone IS NOT NULL AND phone <> ''
  );
