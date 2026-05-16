-- Fix infinite recursion in profiles RLS policy.
-- The "admin read all" policy queried profiles FROM a profiles policy,
-- causing infinite recursion (PostgreSQL error 42P17).
-- Solution: extract the admin check into a SECURITY DEFINER function
-- that bypasses RLS for its inner query.

CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Replace the recursive policy with one that calls the function
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;

CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.auth_is_admin());

-- Also fix other policies that have the same recursion pattern
DROP POLICY IF EXISTS "packs: admin full" ON public.study_packs;
CREATE POLICY "packs: admin full"
  ON public.study_packs FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "topics: admin full" ON public.topics;
CREATE POLICY "topics: admin full"
  ON public.topics FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "sections: admin full" ON public.sections;
CREATE POLICY "sections: admin full"
  ON public.sections FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "exercises: admin full" ON public.exercises;
CREATE POLICY "exercises: admin full"
  ON public.exercises FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "progress: admin read" ON public.topic_progress;
CREATE POLICY "progress: admin read"
  ON public.topic_progress FOR SELECT
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "student_packs: admin full" ON public.student_packs;
CREATE POLICY "student_packs: admin full"
  ON public.student_packs FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "source_files: admin full" ON public.source_files;
CREATE POLICY "source_files: admin full"
  ON public.source_files FOR ALL
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "profiles: admin insert" ON public.profiles;
CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.auth_is_admin());
