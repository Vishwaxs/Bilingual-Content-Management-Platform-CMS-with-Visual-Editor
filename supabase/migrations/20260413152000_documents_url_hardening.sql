-- Documents URL hardening: enforce http/https links only

UPDATE public.documents
SET file_url = 'https://example.invalid/document-unavailable'
WHERE file_url IS NULL
   OR length(trim(file_url)) = 0
   OR file_url !~* '^https?://';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_documents_file_url_http'
  ) THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT chk_documents_file_url_http
      CHECK (file_url ~* '^https?://') NOT VALID;
  END IF;
END $$;

ALTER TABLE public.documents
  VALIDATE CONSTRAINT chk_documents_file_url_http;
