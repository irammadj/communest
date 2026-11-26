WITH pending_or_denied_owner_profiles AS (
  SELECT DISTINCT p.id
  FROM public.profiles p
  JOIN public.estates submitted
    ON submitted.id = p.estate_id
   AND submitted.admin_id = p.id
  WHERE p.role = 'estate_admin'
    AND submitted.status IN ('pending', 'denied')
),
approved_owner_estates AS (
  SELECT DISTINCT ON (e.admin_id)
    e.admin_id,
    e.id
  FROM public.estates e
  JOIN pending_or_denied_owner_profiles affected
    ON affected.id = e.admin_id
  WHERE e.status = 'approved'
  ORDER BY e.admin_id, e.submitted_at DESC, e.id DESC
)
UPDATE public.profiles p
SET role = CASE
      WHEN approved.id IS NULL THEN 'regular_user'
      ELSE 'estate_admin'
    END,
    estate_id = approved.id
FROM pending_or_denied_owner_profiles affected
LEFT JOIN approved_owner_estates approved
  ON approved.admin_id = affected.id
WHERE p.id = affected.id;
