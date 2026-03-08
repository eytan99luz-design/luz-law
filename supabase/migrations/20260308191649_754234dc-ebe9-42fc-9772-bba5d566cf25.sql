CREATE POLICY "Anyone can upload signed documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documents');