
-- Remove overly permissive policies and replace with more restrictive ones
DROP POLICY "Anyone can insert appointments" ON public.appointments;
DROP POLICY "Anyone can view scheduled appointments dates" ON public.appointments;

-- Only allow inserting with required fields (client_id must exist)
CREATE POLICY "Anyone can book appointments with valid client"
  ON public.appointments FOR INSERT
  WITH CHECK (client_id IS NOT NULL AND title IS NOT NULL);

-- Public can only view future scheduled appointments (for booking availability)
CREATE POLICY "Anyone can view future appointments for availability"
  ON public.appointments FOR SELECT
  USING (appointment_date >= CURRENT_DATE AND status = 'scheduled');
