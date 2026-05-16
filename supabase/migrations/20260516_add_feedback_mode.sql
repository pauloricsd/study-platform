ALTER TABLE public.study_packs
  ADD COLUMN IF NOT EXISTS feedback_mode TEXT NOT NULL DEFAULT 'immediate'
  CHECK (feedback_mode IN ('immediate', 'adaptive'));
