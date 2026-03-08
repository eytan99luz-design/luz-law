
ALTER TABLE public.appointments
ADD COLUMN cancel_token text UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

-- Allow anyone to read their appointment by cancel token
CREATE POLICY "Anyone can view appointment by cancel token"
  ON public.appointments FOR SELECT
  TO anon, authenticated
  USING (cancel_token IS NOT NULL);

-- Allow anyone to cancel their appointment by token
CREATE POLICY "Anyone can cancel appointment by token"
  ON public.appointments FOR UPDATE
  TO anon, authenticated
  USING (cancel_token IS NOT NULL AND status = 'scheduled')
  WITH CHECK (status = 'cancelled');
