-- ================================================================
-- Migração 001 — Grupos, membros, convites, atribuições
-- Rodar no Supabase SQL Editor após o schema inicial
-- ================================================================

-- ── Grupos ────────────────────────────────────────────────────────────────────

CREATE TABLE public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'custom'
              CHECK (type IN ('family','school','classroom','tutoring_group','subject_group','custom')),
  school_name TEXT,
  grade       TEXT,
  subject     TEXT,
  tags        TEXT[] DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Administradores do grupo (adultos que gerenciam) ─────────────────────────

CREATE TABLE public.group_admins (
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  admin_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, admin_id)
);

-- ── Membros do grupo (alunos que aceitaram convite) ───────────────────────────

CREATE TABLE public.group_members (
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'active'
             CHECK (status IN ('active','inactive')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, student_id)
);

-- ── Convites ──────────────────────────────────────────────────────────────────

CREATE TABLE public.invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- optional pre-registration info
  email       TEXT,
  student_name TEXT,
  -- lifecycle
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','expired','revoked')),
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 days'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Atribuições de pacote a grupo ─────────────────────────────────────────────
-- Além deste registro, o server action também insere em student_packs para
-- que o RLS existente continue funcionando sem alterações.

CREATE TABLE public.group_assignments (
  group_id    UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  pack_id     UUID REFERENCES public.study_packs(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, pack_id)
);

-- ── Atualizar exercises: novos tipos + colunas para match_columns e text_interpretation ──

ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS exercises_type_check;

ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_type_check
  CHECK (type IN (
    'multiple_choice','true_false','fill_blank','open_short','numeric',
    'multiple_select','open_long','match_columns','ordering',
    'text_interpretation','explain_required','text_production'
  ));

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS passage    TEXT,
  ADD COLUMN IF NOT EXISTS left_items JSONB;  -- string[] para match_columns

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_admins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_assignments ENABLE ROW LEVEL SECURITY;

-- groups: admins full control; students read groups they belong to
CREATE POLICY "groups: admin full"
  ON public.groups FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "groups: student read own"
  ON public.groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = groups.id AND student_id = auth.uid() AND status = 'active'
  ));

-- group_admins
CREATE POLICY "group_admins: admin full"
  ON public.group_admins FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- group_members: admins full; students read own
CREATE POLICY "group_members: admin full"
  ON public.group_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "group_members: student read own"
  ON public.group_members FOR SELECT
  USING (student_id = auth.uid());

-- invitations: admins full; anyone can read by token (for acceptance page)
CREATE POLICY "invitations: admin full"
  ON public.invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "invitations: public read by token"
  ON public.invitations FOR SELECT
  USING (true);  -- token is secret; row exposed only when token is known

CREATE POLICY "invitations: student accept own"
  ON public.invitations FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (accepted_by = auth.uid());

-- group_assignments: admins full; students read (to know which packs their groups have)
CREATE POLICY "group_assignments: admin full"
  ON public.group_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "group_assignments: student read"
  ON public.group_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_assignments.group_id AND student_id = auth.uid()
  ));

-- ── Índices ───────────────────────────────────────────────────────────────────

CREATE INDEX ON public.groups (created_by);
CREATE INDEX ON public.groups (status);
CREATE INDEX ON public.group_admins (admin_id);
CREATE INDEX ON public.group_members (student_id);
CREATE INDEX ON public.group_members (group_id);
CREATE INDEX ON public.invitations (token);
CREATE INDEX ON public.invitations (group_id);
CREATE INDEX ON public.invitations (status);
CREATE INDEX ON public.group_assignments (pack_id);
