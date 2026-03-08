
ALTER TABLE public.document_submissions
ADD COLUMN admin_signature_data text,
ADD COLUMN admin_signed_at timestamp with time zone,
ADD COLUMN final_pdf_url text;
