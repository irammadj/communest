CREATE INDEX IF NOT EXISTS idx_estates_status_submitted_at
  ON public.estates (status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_estates_submitted_at
  ON public.estates (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_estate_role_name
  ON public.profiles (estate_id, role, name);

CREATE INDEX IF NOT EXISTS idx_houses_estate_house_number
  ON public.houses (estate_id, house_number);

CREATE INDEX IF NOT EXISTS idx_houses_status_rent_amount
  ON public.houses (status, rent_amount);

CREATE INDEX IF NOT EXISTS idx_proposals_estate_submitted_at
  ON public.proposals (estate_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_estate_event_date
  ON public.notifications (estate_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_estate_created_at
  ON public.maintenance_issues (estate_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_options_estate
  ON public.payment_options (estate_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_estate_created_at
  ON public.inquiries (estate_id, created_at DESC);
