-- ================================================================
-- Sia — Schema inicial
-- Rodar no Supabase SQL Editor após criar o projeto
-- ================================================================

-- Perfis de usuário (admin ou aluno)
CREATE TABLE public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  name             TEXT NOT NULL,
  grade            TEXT,
  avatar_initials  TEXT,
  avatar_color     TEXT,
  can_switch_role  BOOLEAN DEFAULT FALSE,
  is_operational   BOOLEAN DEFAULT FALSE,  -- acesso ao Painel Operacional
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pacotes de estudo
CREATE TABLE public.study_packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  subject         TEXT NOT NULL,
  grade           TEXT NOT NULL,
  exam_name       TEXT NOT NULL,
  exam_date       DATE,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
  topics_count    INT DEFAULT 0,
  questions_count INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Atribuição de pacotes a alunos (N:N)
CREATE TABLE public.student_packs (
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id     UUID REFERENCES public.study_packs(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, pack_id)
);

-- Tópicos
CREATE TABLE public.topics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id    UUID NOT NULL REFERENCES public.study_packs(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  summary    TEXT,
  "order"    INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seções de conteúdo
CREATE TABLE public.sections (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  type     TEXT NOT NULL CHECK (type IN ('explanation','example','summary','note','common_mistake')),
  title    TEXT,
  content  TEXT NOT NULL,
  "order"  INT NOT NULL DEFAULT 0
);

-- Exercícios
CREATE TABLE public.exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id       UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('multiple_choice','true_false','fill_blank','open_short','numeric')),
  statement      TEXT NOT NULL,
  choices        JSONB,   -- [{id, label, text}] para múltipla escolha
  correct_answer TEXT NOT NULL,
  explanation    TEXT NOT NULL,
  "order"        INT NOT NULL DEFAULT 0,
  max_attempts   INT,                        -- null = unlimited retries
  hide_correct_answer_during_retry BOOLEAN DEFAULT FALSE,
  acceptance_criteria TEXT                  -- criteria for AI grading of open questions
);
-- Migration for existing databases:
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS max_attempts INT;
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS hide_correct_answer_during_retry BOOLEAN DEFAULT FALSE;
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy','medium','hard'));
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty_source TEXT DEFAULT 'ai_inferred';
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'ai_reorganized';
-- ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'ai_reorganized';

-- Progresso do aluno por tópico
CREATE TABLE public.topic_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id        UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  score           INT DEFAULT 0,   -- 0-100 %
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  attempts        INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  UNIQUE (student_id, topic_id)
);

-- Respostas individuais
CREATE TABLE public.exercise_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id    UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  user_answer    TEXT,
  is_correct     BOOLEAN,
  was_revealed   BOOLEAN DEFAULT FALSE,
  answered_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Arquivos de origem (PDFs enviados)
CREATE TABLE public.source_files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id           UUID NOT NULL REFERENCES public.study_packs(id) ON DELETE CASCADE,
  file_name         TEXT NOT NULL,
  file_size         INT,
  storage_path      TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending'
                    CHECK (processing_status IN ('pending','processing','done','error')),
  uploaded_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_packs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_packs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_files     ENABLE ROW LEVEL SECURITY;

-- Profiles: each user can read their own; admins can read all
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Study packs: admins manage; students read assigned
CREATE POLICY "packs: admin full"
  ON public.study_packs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "packs: student read assigned published"
  ON public.study_packs FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.student_packs
      WHERE pack_id = study_packs.id AND student_id = auth.uid()
    )
  );

-- Topics: admins manage; students read if pack is assigned
CREATE POLICY "topics: admin full"
  ON public.topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "topics: student read"
  ON public.topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_packs sp
      JOIN public.student_packs stp ON stp.pack_id = sp.id
      WHERE sp.id = topics.pack_id AND stp.student_id = auth.uid() AND sp.status = 'published'
    )
  );

-- Sections and exercises: same logic as topics
CREATE POLICY "sections: admin full"  ON public.sections  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "sections: student read" ON public.sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.topics t
    JOIN public.study_packs sp ON sp.id = t.pack_id
    JOIN public.student_packs stp ON stp.pack_id = sp.id
    WHERE t.id = sections.topic_id AND stp.student_id = auth.uid() AND sp.status = 'published'
  ));

CREATE POLICY "exercises: admin full" ON public.exercises FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "exercises: student read" ON public.exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.topics t
    JOIN public.study_packs sp ON sp.id = t.pack_id
    JOIN public.student_packs stp ON stp.pack_id = sp.id
    WHERE t.id = exercises.topic_id AND stp.student_id = auth.uid() AND sp.status = 'published'
  ));

-- Progress: each student manages their own; admins read all
CREATE POLICY "progress: own"
  ON public.topic_progress FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "progress: admin read"
  ON public.topic_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "responses: own"
  ON public.exercise_responses FOR ALL
  USING (student_id = auth.uid());

-- Student packs: admins manage; students read own
CREATE POLICY "student_packs: admin full"
  ON public.student_packs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "student_packs: student read own"
  ON public.student_packs FOR SELECT
  USING (student_id = auth.uid());

-- Source files: admins only
CREATE POLICY "source_files: admin full"
  ON public.source_files FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX ON public.topics (pack_id, "order");
CREATE INDEX ON public.sections (topic_id, "order");
CREATE INDEX ON public.exercises (topic_id, "order");
CREATE INDEX ON public.student_packs (student_id);
CREATE INDEX ON public.student_packs (pack_id);
CREATE INDEX ON public.topic_progress (student_id);
CREATE INDEX ON public.topic_progress (topic_id);
CREATE INDEX ON public.exercise_responses (student_id, exercise_id);
CREATE INDEX ON public.study_packs (status);
CREATE INDEX ON public.study_packs (created_by);

-- ── Tutor IA ──────────────────────────────────────────────────────────────────
-- Sessões de conversa (uma por aluno × tópico × questão)
CREATE TABLE public.tutor_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id     UUID NOT NULL REFERENCES public.study_packs(id) ON DELETE CASCADE,
  topic_id    UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  mode        TEXT NOT NULL DEFAULT 'study' CHECK (mode IN ('study', 'exercise')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens da conversa
CREATE TABLE public.tutor_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES public.tutor_sessions(id) ON DELETE CASCADE,
  role                  TEXT NOT NULL CHECK (role IN ('student', 'assistant')),
  content               TEXT NOT NULL,
  confidence            TEXT,
  direct_answer_blocked BOOLEAN DEFAULT FALSE,
  used_studypack_context BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos de segurança (pedido de resposta bloqueado, conteúdo inadequado, etc.)
CREATE TABLE public.tutor_safety_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.tutor_sessions(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  action          TEXT NOT NULL,
  student_message TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: aluno só vê as próprias sessões; admin vê todas
ALTER TABLE public.tutor_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_safety_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_sessions_student"  ON public.tutor_sessions
  FOR ALL USING (student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "tutor_messages_student"  ON public.tutor_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tutor_sessions s WHERE s.id = session_id AND
      (s.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
  );

CREATE POLICY "tutor_safety_events_admin" ON public.tutor_safety_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX ON public.tutor_sessions (student_id, topic_id);
CREATE INDEX ON public.tutor_messages (session_id, created_at);

-- Migration SQL (for existing databases):
-- ALTER TABLE … is only needed if you're adding to an existing Supabase project.
-- Run each statement in Supabase SQL Editor > New query:
--
-- CREATE TABLE IF NOT EXISTS public.tutor_sessions (…);
-- CREATE TABLE IF NOT EXISTS public.tutor_messages (…);
-- CREATE TABLE IF NOT EXISTS public.tutor_safety_events (…);

-- ── Fase 7 — Qualidade pedagógica e sugestões da IA ──────────────────────────

-- Novas colunas em exercises
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy','medium','hard'));
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty_source TEXT DEFAULT 'ai_inferred';
-- ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'ai_reorganized';

-- Nova coluna em sections
-- ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'ai_reorganized';

-- Questões sugeridas pela IA (aguardam aprovação humana)
CREATE TABLE public.suggested_questions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id                 UUID NOT NULL REFERENCES public.study_packs(id) ON DELETE CASCADE,
  topic_id                UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  type                    TEXT NOT NULL,
  statement               TEXT NOT NULL,
  choices                 JSONB,
  correct_answer          TEXT NOT NULL,
  explanation             TEXT NOT NULL,
  difficulty              TEXT CHECK (difficulty IN ('easy','medium','hard')),
  suggestion_reason       TEXT,
  status                  TEXT NOT NULL DEFAULT 'suggested'
                          CHECK (status IN ('suggested','approved','rejected')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at             TIMESTAMPTZ,
  reviewed_by             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_as_exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL
);

ALTER TABLE public.suggested_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggested_questions: admin full"
  ON public.suggested_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX ON public.suggested_questions (pack_id, status);
CREATE INDEX ON public.suggested_questions (topic_id);
