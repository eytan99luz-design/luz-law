
DROP POLICY IF EXISTS "Anyone can read availability settings" ON public.admin_settings;
CREATE POLICY "Anyone can read public settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('availability', 'slot_duration', 'admin_whatsapp'));
