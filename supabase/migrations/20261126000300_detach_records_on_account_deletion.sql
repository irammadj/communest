ALTER TABLE public.estates
  DROP CONSTRAINT IF EXISTS estates_admin_id_fkey,
  ADD CONSTRAINT estates_admin_id_fkey
    FOREIGN KEY (admin_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;

ALTER TABLE public.inquiries
  DROP CONSTRAINT IF EXISTS inquiries_tenant_id_fkey,
  ADD CONSTRAINT inquiries_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
