
CREATE POLICY "Anyone can read availability settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('availability', 'slot_duration'));
