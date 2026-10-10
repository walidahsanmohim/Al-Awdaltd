-- ===== Gallery "Admin Setup SQL" (run once in Supabase Dashboard -> SQL Editor) =====
-- Your `Reviews` table already has: id, created_at, Name, Rating, Comment,
-- image_url, is_admin_proof (boolean). We do NOT add a `type` column.

-- 1. (Optional safety) ensure the is_admin_proof column exists as boolean.
ALTER TABLE public."Reviews"
  ADD COLUMN IF NOT EXISTS is_admin_proof boolean DEFAULT false;

-- 2. Enable Row Level Security on the Reviews table.
ALTER TABLE public."Reviews" ENABLE ROW LEVEL SECURITY;

-- 3. Public read access (gallery + website visitors).
DROP POLICY IF EXISTS "public_read_reviews" ON public."Reviews";
CREATE POLICY "public_read_reviews"
  ON public."Reviews"
  AS PERMISSIVE FOR SELECT
  TO public
  USING (true);

-- 4. Allow INSERT from the frontend anon client for BOTH:
--      - public website reviews  (is_admin_proof = false / null)
--      - admin delivery proofs   (is_admin_proof = true)
--    NOTE: this lets any visitor insert rows. For a locked-down admin-only
--    proof upload, restrict the true branch to authenticated admins, e.g.:
--      WITH CHECK (
--        (is_admin_proof IS NOT TRUE)                       -- anyone: reviews
--        OR (is_admin_proof = true AND auth.role() = 'authenticated')  -- admin: proofs
--      )
DROP POLICY IF EXISTS "public_insert_reviews" ON public."Reviews";
CREATE POLICY "public_insert_reviews"
  ON public."Reviews"
  AS PERMISSIVE FOR INSERT
  TO public
  WITH CHECK (
    (is_admin_proof IS NOT TRUE OR is_admin_proof = true)
    AND "Name" IS NOT NULL
    AND "Comment" IS NOT NULL
  );

-- 5. STORAGE BUCKET POLICIES for the 'Reviews-image' bucket.
--    The anon upload currently fails with:
--      "new row violates row-level security policy" (403 AccessDenied)
--    because there is no INSERT policy on storage.objects for this bucket.
--    Run ALL of the following in Supabase Dashboard -> SQL Editor.

-- 5a. (If the bucket does not exist yet) create it as PUBLIC so getPublicUrl works.
INSERT INTO storage.buckets (id, name, public)
VALUES ('Reviews-image', 'Reviews-image', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5b. Allow anyone (anon) to UPLOAD images into this bucket.
DROP POLICY IF EXISTS "public_upload_reviews_image" ON storage.objects;
CREATE POLICY "public_upload_reviews_image"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'Reviews-image');

-- 5c. Allow anyone to READ images from this bucket (needed for public URLs).
DROP POLICY IF EXISTS "public_read_reviews_image" ON storage.objects;
CREATE POLICY "public_read_reviews_image"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'Reviews-image');

-- 5d. (Optional) allow overwrite/update + delete for the owner/admin.
-- DROP POLICY IF EXISTS "owner_update_reviews_image" ON storage.objects;
-- CREATE POLICY "owner_update_reviews_image" ON storage.objects
--   FOR UPDATE TO public USING (bucket_id = 'Reviews-image') WITH CHECK (bucket_id = 'Reviews-image');
-- DROP POLICY IF EXISTS "owner_delete_reviews_image" ON storage.objects;
-- CREATE POLICY "owner_delete_reviews_image" ON storage.objects
--   FOR DELETE TO public USING (bucket_id = 'Reviews-image');

