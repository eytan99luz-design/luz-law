CREATE POLICY "Anyone can view documents with submissions"
ON public.documents
FOR SELECT
USING (
  id IN (SELECT document_id FROM public.document_submissions)
);