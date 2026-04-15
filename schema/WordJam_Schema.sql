-- ═══════════════════════════════════════════════════════════════
-- WORDJAM — Supabase PostgreSQL Schema v1.0
-- Jamaica Creole Literacy Platform
-- ═══════════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor (Project → SQL Editor → New Query)
-- Supabase Auth is assumed (auth.users already exists).
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Enums ───────────────────────────────────────────────────────
CREATE TYPE user_role         AS ENUM ('learner','teacher','parent','admin');
CREATE TYPE grade_band        AS ENUM ('seedling','sprout','sapling','branch','canopy');
CREATE TYPE language_mode     AS ENUM ('patwa','sje','bilingual');
CREATE TYPE question_type     AS ENUM ('literal','inferential','evaluative');
CREATE TYPE submission_status AS ENUM ('draft','submitted','reviewed','returned');
CREATE TYPE writing_type      AS ENUM ('narrative','expository','persuasive','descriptive','poetic','response');
CREATE TYPE activity_type     AS ENUM ('reading','vocabulary','phonics','writing','oral','assessment','gamification');
CREATE TYPE badge_rarity      AS ENUM ('common','uncommon','rare','legendary');

-- ════════════════════════════════════════════════════════════════
-- SECTION 1 — CORE USER TABLES
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.users (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id         UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        UNIQUE NOT NULL,
  full_name       TEXT        NOT NULL,
  role            user_role   NOT NULL DEFAULT 'learner',
  avatar_url      TEXT,
  preferred_language language_mode DEFAULT 'bilingual',
  timezone        TEXT        DEFAULT 'America/Jamaica',
  is_active       BOOLEAN     DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.learner_profiles (
  id                      UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                 UUID        UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  grade_band              grade_band  NOT NULL DEFAULT 'sapling',
  current_grade           TEXT,
  age                     INTEGER,
  reading_level_lexile    INTEGER,
  streak_days             INTEGER     DEFAULT 0,
  longest_streak          INTEGER     DEFAULT 0,
  total_points            INTEGER     DEFAULT 0,
  dyslexia_mode           BOOLEAN     DEFAULT FALSE,
  high_contrast           BOOLEAN     DEFAULT FALSE,
  font_size_preference    TEXT        DEFAULT 'medium',
  text_to_speech_default  BOOLEAN     DEFAULT FALSE,
  parent_id               UUID        REFERENCES public.users(id),
  onboarding_complete     BOOLEAN     DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.teacher_profiles (
  id                  UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID    UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  school_name         TEXT,
  parish              TEXT,
  grade_levels_taught TEXT[],
  subject_areas       TEXT[],
  nsc_certified       BOOLEAN DEFAULT FALSE,
  bio                 TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.parent_profiles (
  id                        UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                   UUID    UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  notification_preferences  JSONB   DEFAULT '{"email":true,"push":true,"weekly_summary":true}',
  preferred_language        language_mode DEFAULT 'bilingual',
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 2 — CLASSROOM MANAGEMENT
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.classes (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id  UUID        REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  grade_band  grade_band  NOT NULL,
  school_year TEXT        NOT NULL DEFAULT '2025-2026',
  join_code   TEXT        UNIQUE,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.class_enrollments (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id    UUID    REFERENCES public.classes(id) ON DELETE CASCADE,
  learner_id  UUID    REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  is_active   BOOLEAN DEFAULT TRUE,
  UNIQUE(class_id, learner_id)
);

CREATE TABLE public.assignments (
  id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id            UUID            REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id          UUID            REFERENCES public.teacher_profiles(id),
  title               TEXT            NOT NULL,
  description         TEXT,
  activity_type       activity_type   NOT NULL,
  grade_band          grade_band      NOT NULL,
  due_date            TIMESTAMPTZ,
  story_id            UUID,
  prompt_id           UUID,
  nsc_standard_codes  TEXT[],
  allow_patwa         BOOLEAN         DEFAULT TRUE,
  allow_sje           BOOLEAN         DEFAULT TRUE,
  max_points          INTEGER         DEFAULT 100,
  is_published        BOOLEAN         DEFAULT FALSE,
  created_at          TIMESTAMPTZ     DEFAULT NOW()
);

CREATE TABLE public.assignment_submissions (
  id              UUID                DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id   UUID                REFERENCES public.assignments(id) ON DELETE CASCADE,
  learner_id      UUID                REFERENCES public.learner_profiles(id),
  content         TEXT,
  audio_url       TEXT,
  language_used   language_mode,
  status          submission_status   DEFAULT 'draft',
  ai_score        INTEGER,
  ai_feedback     JSONB,
  teacher_score   INTEGER,
  teacher_feedback TEXT,
  submitted_at    TIMESTAMPTZ,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ         DEFAULT NOW(),
  updated_at      TIMESTAMPTZ         DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 3 — CONTENT LIBRARY
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.stories (
  id                      UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_patwa             TEXT        NOT NULL,
  title_sje               TEXT        NOT NULL,
  slug                    TEXT        UNIQUE NOT NULL,
  grade_band              grade_band  NOT NULL,
  lexile_level            INTEGER,
  content_patwa           JSONB       NOT NULL,
  content_sje             JSONB       NOT NULL,
  audio_url_patwa         TEXT,
  audio_url_sje           TEXT,
  cover_image_url         TEXT,
  cultural_themes         TEXT[],
  jamaican_proverbs       TEXT[],
  author                  TEXT,
  is_published            BOOLEAN     DEFAULT FALSE,
  estimated_read_minutes  INTEGER,
  view_count              INTEGER     DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.story_comprehension_questions (
  id              UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id        UUID            REFERENCES public.stories(id) ON DELETE CASCADE,
  question_type   question_type   NOT NULL,
  question_text   TEXT            NOT NULL,
  options         JSONB           NOT NULL,
  explanation     TEXT,
  grade_band      grade_band,
  created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE TABLE public.vocabulary_items (
  id                      UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  patwa_word              TEXT        NOT NULL,
  sje_equivalent          TEXT        NOT NULL,
  definition              TEXT        NOT NULL,
  etymology               TEXT,
  usage_example_patwa     TEXT,
  usage_example_sje       TEXT,
  grade_band              grade_band  NOT NULL,
  audio_url               TEXT,
  image_url               TEXT,
  cultural_note           TEXT,
  is_proverb_origin       BOOLEAN     DEFAULT FALSE,
  difficulty              INTEGER     CHECK (difficulty BETWEEN 1 AND 5),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.phonics_lessons (
  id                      UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title                   TEXT        NOT NULL,
  grade_band              grade_band  NOT NULL,
  target_phoneme          TEXT        NOT NULL,
  jamaican_example_words  TEXT[],
  sje_example_words       TEXT[],
  creole_phoneme_note     TEXT,
  lesson_content          JSONB,
  cover_image_url         TEXT,
  audio_url               TEXT,
  sequence_order          INTEGER,
  is_published            BOOLEAN     DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.writing_prompts (
  id                   UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  title                TEXT            NOT NULL,
  prompt_text          TEXT            NOT NULL,
  writing_type         writing_type    NOT NULL,
  grade_band           grade_band      NOT NULL,
  cultural_context     TEXT,
  allow_patwa          BOOLEAN         DEFAULT TRUE,
  scaffolding_hints    JSONB,
  model_response_sje   TEXT,
  model_response_patwa TEXT,
  nsc_standard_codes   TEXT[],
  is_published         BOOLEAN         DEFAULT FALSE,
  created_at           TIMESTAMPTZ     DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 4 — LEARNER PROGRESS & ANALYTICS
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.reading_sessions (
  id                      UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id              UUID            REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  story_id                UUID            REFERENCES public.stories(id),
  language_mode           language_mode   NOT NULL,
  started_at              TIMESTAMPTZ     NOT NULL,
  ended_at                TIMESTAMPTZ,
  paragraphs_read         INTEGER         DEFAULT 0,
  words_encountered       INTEGER         DEFAULT 0,
  comprehension_score     INTEGER,
  time_on_text_seconds    INTEGER,
  completed               BOOLEAN         DEFAULT FALSE,
  points_earned           INTEGER         DEFAULT 0
);

CREATE TABLE public.vocabulary_mastery (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id      UUID        REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  vocab_id        UUID        REFERENCES public.vocabulary_items(id) ON DELETE CASCADE,
  times_seen      INTEGER     DEFAULT 1,
  times_correct   INTEGER     DEFAULT 0,
  mastery_level   INTEGER     DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  next_review_at  TIMESTAMPTZ,
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, vocab_id)
);

CREATE TABLE public.writing_submissions (
  id                          UUID                DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id                  UUID                REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  prompt_id                   UUID                REFERENCES public.writing_prompts(id),
  assignment_id               UUID                REFERENCES public.assignments(id),
  content                     TEXT                NOT NULL,
  word_count                  INTEGER,
  language_used               language_mode,
  creole_elements_detected    JSONB,
  status                      submission_status   DEFAULT 'draft',
  ai_feedback                 JSONB,
  teacher_feedback            TEXT,
  score                       INTEGER,
  points_earned               INTEGER             DEFAULT 0,
  submitted_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ         DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ         DEFAULT NOW()
);

CREATE TABLE public.oral_recordings (
  id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id       UUID        REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  assignment_id    UUID        REFERENCES public.assignments(id),
  activity_type    TEXT        NOT NULL,
  audio_url        TEXT        NOT NULL,
  duration_seconds INTEGER,
  transcript       TEXT,
  ai_analysis      JSONB,
  teacher_feedback TEXT,
  score            INTEGER,
  points_earned    INTEGER     DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.assessment_results (
  id                      UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id              UUID        REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  assessment_type         TEXT        NOT NULL,
  grade_band              grade_band,
  score                   INTEGER     NOT NULL CHECK (score BETWEEN 0 AND 100),
  questions_total         INTEGER,
  questions_correct       INTEGER,
  areas_of_strength       TEXT[],
  areas_for_improvement   TEXT[],
  nsc_standards_met       TEXT[],
  administered_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.daily_activity_log (
  id               UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id       UUID            REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  activity_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
  activity_type    activity_type   NOT NULL,
  reference_id     UUID,
  points_earned    INTEGER         DEFAULT 0,
  duration_minutes INTEGER,
  logged_at        TIMESTAMPTZ     DEFAULT NOW(),
  UNIQUE(learner_id, activity_date, activity_type, reference_id)
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 5 — GAMIFICATION
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.badges (
  id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT            UNIQUE NOT NULL,
  description         TEXT            NOT NULL,
  emoji               TEXT            NOT NULL,
  cultural_reference  TEXT,
  criteria            JSONB           NOT NULL,
  rarity              badge_rarity    DEFAULT 'common',
  grade_band          grade_band,
  image_url           TEXT,
  created_at          TIMESTAMPTZ     DEFAULT NOW()
);

CREATE TABLE public.badge_awards (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id  UUID    REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  badge_id    UUID    REFERENCES public.badges(id),
  awarded_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, badge_id)
);

CREATE TABLE public.streaks (
  id                      UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id              UUID    UNIQUE REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  current_streak          INTEGER DEFAULT 0,
  longest_streak          INTEGER DEFAULT 0,
  last_activity_date      DATE,
  streak_freeze_available INTEGER DEFAULT 1,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 6 — AI INTERACTION LOGS
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.ai_feedback_log (
  id                  UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id          UUID    REFERENCES public.learner_profiles(id),
  interaction_type    TEXT    NOT NULL,
  input_data          JSONB   NOT NULL,
  output_data         JSONB   NOT NULL,
  model_used          TEXT    DEFAULT 'claude-sonnet-4-20250514',
  tokens_used         INTEGER,
  latency_ms          INTEGER,
  helpful_rating      INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.creole_bridge_sessions (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id          UUID        REFERENCES public.learner_profiles(id),
  source_text         TEXT        NOT NULL,
  direction           TEXT        NOT NULL,
  translated_text     TEXT        NOT NULL,
  vocabulary_notes    JSONB,
  cultural_notes      TEXT,
  grade_band          grade_band,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 7 — FAMILY ENGAGEMENT
-- ════════════════════════════════════════════════════════════════

CREATE TABLE public.home_reading_logs (
  id                   UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id           UUID            REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  logged_by            UUID            REFERENCES public.users(id),
  activity_description TEXT            NOT NULL,
  duration_minutes     INTEGER,
  language_used        language_mode,
  log_date             DATE            NOT NULL DEFAULT CURRENT_DATE,
  parent_note          TEXT,
  created_at           TIMESTAMPTZ     DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 8 — SEED DATA: BADGES
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.badges (name, description, emoji, cultural_reference, criteria, rarity, grade_band) VALUES
('First Word', 'Read your very first story on WORDJAM!', '⭐',
 'Every journey starts with one word — even Anansi''s.',
 '{"type":"stories_read","threshold":1}', 'common', NULL),

('Anansi Scholar', 'Completed 5 Anansi folk stories', '🕷️',
 'Anansi the Spider — master storyteller of Akan and Caribbean tradition.',
 '{"type":"stories_read","threshold":5,"theme":"anansi"}', 'uncommon', NULL),

('Patwa Bridge', 'Completed 10 Creole Bridge reading sessions', '🌉',
 'Bridging the language divide — both tongues are yours.',
 '{"type":"creole_bridge_sessions","threshold":10}', 'uncommon', NULL),

('Blue Mountain Reader', 'Read 20 stories across any genre', '🏔️',
 'Named for Jamaica''s majestic Blue Mountains — highest peak in the Caribbean.',
 '{"type":"stories_read","threshold":20}', 'rare', NULL),

('Word Master', 'Mastered 100 Patwa–SJE vocabulary pairs', '📚',
 'A vocabulary as rich as Jamaica''s biodiversity.',
 '{"type":"vocabulary_mastered","threshold":100}', 'rare', NULL),

('Yard Storyteller', 'Submitted 5 oral story recordings', '🎙️',
 'Carrying on the great oral tradition of the Caribbean yard.',
 '{"type":"oral_recordings","threshold":5}', 'uncommon', NULL),

('Maroon Scholar', 'Read all Maroon history stories', '🌿',
 'Honouring the Maroons — Jamaica''s freedom fighters who never surrendered.',
 '{"type":"cultural_theme_complete","theme":"maroon_history"}', 'legendary', 'branch'),

('Taino Voice', 'Read all Taino heritage stories', '🌊',
 'Remembering the first people of Jamaica — the Taino, whose name means "the good people".',
 '{"type":"cultural_theme_complete","theme":"taino_heritage"}', 'legendary', 'sapling'),

('30-Day Warrior', 'Maintained a 30-day reading streak', '🔥',
 'Consistency is the foundation of literacy — like the rhythm of reggae.',
 '{"type":"streak","threshold":30}', 'legendary', NULL),

('AI Writing Wizard', 'Submitted 10 pieces with AI Writing Coach feedback', '🤖',
 'Every great writer grows through feedback.',
 '{"type":"ai_writing_submissions","threshold":10}', 'rare', NULL),

('Proverb Keeper', 'Correctly interpreted 20 Jamaican proverbs', '🌺',
 '"If yuh want good, yuh nose haffi run." — wisdom lives in proverbs.',
 '{"type":"proverbs_interpreted","threshold":20}', 'rare', NULL),

('Code-Switch Champion', 'Used both Patwa and SJE in 5 writing submissions', '🔀',
 'The ability to move between languages is an academic superpower.',
 '{"type":"bilingual_submissions","threshold":5}', 'uncommon', 'branch');

-- ════════════════════════════════════════════════════════════════
-- SECTION 9 — SEED DATA: SAMPLE STORY
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.stories
  (title_patwa, title_sje, slug, grade_band, lexile_level,
   content_patwa, content_sje, cultural_themes, estimated_read_minutes, is_published)
VALUES (
  'Anansi an di Hummingbird',
  'Anansi and the Hummingbird',
  'anansi-and-the-hummingbird',
  'sapling', 620,
  '[
    {"index":1,"text":"Anansi did love fi tell story more dan anyting inna di world."},
    {"index":2,"text":"One bright mawnin, im climb up im web — high, high inna di Blue Mountain sky, where di cloud dem touch di tallest treetop."},
    {"index":3,"text":"\"Mi rich!\" Anansi seh, lookin dung pon di whole a Jamaica. \"Mi have more story dan anybody inna di whole wide world.\""},
    {"index":4,"text":"But den a likkle hummingbird fly up beside him. ''Anansi,'' she seh soft-soft, ''story is fi share — not fi keep to yuhself.''"}
  ]',
  '[
    {"index":1,"text":"Anansi loved to tell stories more than anything else in the world."},
    {"index":2,"text":"One bright morning, he climbed up his web — high, high into the Blue Mountain sky, where the clouds touched the tallest treetops."},
    {"index":3,"text":"\"I am rich!\" Anansi said, looking down at all of Jamaica. \"I have more stories than anyone in the whole wide world.\""},
    {"index":4,"text":"But then a little hummingbird flew up beside him. ''Anansi,'' she said softly, ''stories are meant to be shared — not kept for yourself.''"}
  ]',
  ARRAY['anansi','blue_mountains','oral_tradition'],
  4, TRUE
);

-- ════════════════════════════════════════════════════════════════
-- SECTION 10 — ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oral_recordings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_reading_logs       ENABLE ROW LEVEL SECURITY;

-- Own user record
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = auth_id);

-- Learner owns their profile
CREATE POLICY "learner_own_profile" ON public.learner_profiles
  FOR ALL USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Teacher reads their enrolled learners
CREATE POLICY "teacher_read_class_learners" ON public.learner_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c         ON c.id  = ce.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      JOIN public.users u           ON u.id  = tp.user_id
      WHERE ce.learner_id = learner_profiles.id
        AND u.auth_id = auth.uid()
    )
  );

-- Learner owns their submissions
CREATE POLICY "learner_own_submissions" ON public.writing_submissions
  FOR ALL USING (
    learner_id = (
      SELECT lp.id FROM public.learner_profiles lp
      JOIN public.users u ON u.id = lp.user_id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Teacher reads submissions in their classes
CREATE POLICY "teacher_read_submissions" ON public.writing_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignment_submissions asub
      JOIN public.assignments a    ON a.id  = asub.assignment_id
      JOIN public.classes c        ON c.id  = a.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      JOIN public.users u          ON u.id  = tp.user_id
      WHERE asub.learner_id = writing_submissions.learner_id
        AND u.auth_id = auth.uid()
    )
  );

-- Teacher updates assignment submission scores/feedback
CREATE POLICY "teacher_update_assignment_subs" ON public.assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classes c        ON c.id  = a.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      JOIN public.users u          ON u.id  = tp.user_id
      WHERE a.id = assignment_submissions.assignment_id
        AND u.auth_id = auth.uid()
    )
  );

-- Published content is public-read
CREATE POLICY "public_read_stories"  ON public.stories        FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_badges"   ON public.badges         FOR SELECT USING (TRUE);
CREATE POLICY "public_read_prompts"  ON public.writing_prompts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_phonics"  ON public.phonics_lessons FOR SELECT USING (is_published = TRUE);

-- ════════════════════════════════════════════════════════════════
-- SECTION 11 — INDEXES
-- ════════════════════════════════════════════════════════════════

CREATE INDEX idx_users_auth_id                ON public.users(auth_id);
CREATE INDEX idx_learner_user_id              ON public.learner_profiles(user_id);
CREATE INDEX idx_learner_grade_band           ON public.learner_profiles(grade_band);
CREATE INDEX idx_enrollments_class            ON public.class_enrollments(class_id);
CREATE INDEX idx_enrollments_learner          ON public.class_enrollments(learner_id);
CREATE INDEX idx_stories_band_published       ON public.stories(grade_band) WHERE is_published = TRUE;
CREATE INDEX idx_stories_themes               ON public.stories USING GIN(cultural_themes);
CREATE INDEX idx_stories_fts                  ON public.stories USING GIN(
  to_tsvector('english', coalesce(title_sje,'') || ' ' || coalesce(title_patwa,''))
);
CREATE INDEX idx_vocab_grade_band             ON public.vocabulary_items(grade_band);
CREATE INDEX idx_reading_sessions_learner     ON public.reading_sessions(learner_id, started_at DESC);
CREATE INDEX idx_vocab_mastery_learner        ON public.vocabulary_mastery(learner_id);
CREATE INDEX idx_vocab_mastery_next_review    ON public.vocabulary_mastery(next_review_at) WHERE mastery_level < 5;
CREATE INDEX idx_writing_subs_learner         ON public.writing_submissions(learner_id, submitted_at DESC);
CREATE INDEX idx_assignment_subs_assignment   ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_daily_log_learner_date       ON public.daily_activity_log(learner_id, activity_date DESC);
CREATE INDEX idx_badge_awards_learner         ON public.badge_awards(learner_id);
CREATE INDEX idx_ai_log_learner               ON public.ai_feedback_log(learner_id, created_at DESC);

-- ════════════════════════════════════════════════════════════════
-- SECTION 12 — FUNCTIONS & TRIGGERS
-- ════════════════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at              BEFORE UPDATE ON public.users              FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER learner_profiles_updated_at   BEFORE UPDATE ON public.learner_profiles   FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER writing_submissions_updated_at BEFORE UPDATE ON public.writing_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER assignment_subs_updated_at    BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER stories_updated_at            BEFORE UPDATE ON public.stories             FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create sub-profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'learner' THEN
    INSERT INTO public.learner_profiles (user_id) VALUES (NEW.id);
    INSERT INTO public.streaks (learner_id)
      SELECT id FROM public.learner_profiles WHERE user_id = NEW.id;
  ELSIF NEW.role = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id);
  ELSIF NEW.role = 'parent' THEN
    INSERT INTO public.parent_profiles (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_user AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Streak tracking on daily activity insert
CREATE OR REPLACE FUNCTION public.update_learner_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date   DATE;
  v_curr_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak
  INTO   v_last_date, v_curr_streak
  FROM   public.streaks WHERE learner_id = NEW.learner_id;

  IF v_last_date IS NULL THEN
    UPDATE public.streaks
    SET current_streak=1, longest_streak=1,
        last_activity_date=CURRENT_DATE, updated_at=NOW()
    WHERE learner_id=NEW.learner_id;
  ELSIF v_last_date = CURRENT_DATE THEN
    NULL; -- already logged today
  ELSIF v_last_date = CURRENT_DATE - 1 THEN
    UPDATE public.streaks
    SET current_streak=current_streak+1,
        longest_streak=GREATEST(longest_streak, current_streak+1),
        last_activity_date=CURRENT_DATE, updated_at=NOW()
    WHERE learner_id=NEW.learner_id;
  ELSE
    UPDATE public.streaks
    SET current_streak=1, last_activity_date=CURRENT_DATE, updated_at=NOW()
    WHERE learner_id=NEW.learner_id;
  END IF;

  UPDATE public.learner_profiles lp
  SET streak_days=s.current_streak, longest_streak=s.longest_streak
  FROM public.streaks s
  WHERE s.learner_id=NEW.learner_id AND lp.id=NEW.learner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER streak_on_daily_activity AFTER INSERT ON public.daily_activity_log
  FOR EACH ROW EXECUTE FUNCTION public.update_learner_streak();

-- Add points on activity log
CREATE OR REPLACE FUNCTION public.add_learner_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.learner_profiles SET total_points=total_points+NEW.points_earned WHERE id=NEW.learner_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER points_on_activity AFTER INSERT ON public.daily_activity_log
  FOR EACH ROW EXECUTE FUNCTION public.add_learner_points();

-- Increment story view count
CREATE OR REPLACE FUNCTION public.increment_story_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories SET view_count=view_count+1 WHERE id=NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reading_session_start AFTER INSERT ON public.reading_sessions
  FOR EACH ROW EXECUTE FUNCTION public.increment_story_view();

-- ════════════════════════════════════════════════════════════════
-- SECTION 13 — ANALYTICAL VIEWS
-- ════════════════════════════════════════════════════════════════

-- Learner progress summary
CREATE OR REPLACE VIEW public.v_learner_progress AS
SELECT
  lp.id                                                                       AS learner_id,
  u.full_name,
  lp.grade_band,
  lp.current_grade,
  lp.total_points,
  lp.streak_days,
  lp.longest_streak,
  COUNT(DISTINCT rs.story_id)                                                  AS stories_read,
  COUNT(DISTINCT vm.vocab_id) FILTER (WHERE vm.mastery_level >= 3)             AS vocab_mastered,
  COUNT(DISTINCT ws.id)       FILTER (WHERE ws.status = 'submitted')           AS writing_submitted,
  COUNT(DISTINCT ba.badge_id)                                                  AS badges_earned,
  ROUND(AVG(rs.comprehension_score))                                           AS avg_comprehension
FROM public.learner_profiles lp
JOIN public.users u                ON u.id  = lp.user_id
LEFT JOIN public.reading_sessions  rs ON rs.learner_id = lp.id AND rs.completed = TRUE
LEFT JOIN public.vocabulary_mastery vm ON vm.learner_id = lp.id
LEFT JOIN public.writing_submissions ws ON ws.learner_id = lp.id
LEFT JOIN public.badge_awards      ba ON ba.learner_id = lp.id
GROUP BY lp.id, u.full_name, lp.grade_band, lp.current_grade,
         lp.total_points, lp.streak_days, lp.longest_streak;

-- Teacher class overview
CREATE OR REPLACE VIEW public.v_class_overview AS
SELECT
  c.id                                                                         AS class_id,
  c.name                                                                       AS class_name,
  c.grade_band,
  u.full_name                                                                  AS teacher_name,
  COUNT(DISTINCT ce.learner_id)                                                AS total_learners,
  COUNT(DISTINCT ce.learner_id) FILTER (
    WHERE dal.activity_date >= CURRENT_DATE - INTERVAL '7 days'
  )                                                                            AS active_this_week,
  ROUND(AVG(lp.total_points))                                                  AS avg_points,
  MAX(lp.streak_days)                                                          AS highest_streak
FROM public.classes c
JOIN public.teacher_profiles tp   ON tp.id = c.teacher_id
JOIN public.users u               ON u.id  = tp.user_id
LEFT JOIN public.class_enrollments ce ON ce.class_id = c.id AND ce.is_active = TRUE
LEFT JOIN public.learner_profiles  lp ON lp.id = ce.learner_id
LEFT JOIN public.daily_activity_log dal ON dal.learner_id = ce.learner_id
GROUP BY c.id, c.name, c.grade_band, u.full_name;

-- Vocabulary items due for spaced-repetition review today
CREATE OR REPLACE VIEW public.v_vocab_due_today AS
SELECT
  vm.learner_id,
  vi.patwa_word,
  vi.sje_equivalent,
  vi.definition,
  vi.grade_band,
  vi.audio_url,
  vm.mastery_level,
  vm.times_seen,
  vm.next_review_at
FROM public.vocabulary_mastery vm
JOIN public.vocabulary_items vi ON vi.id = vm.vocab_id
WHERE vm.next_review_at <= NOW()
  AND vm.mastery_level < 5
ORDER BY vm.next_review_at;

-- AI usage analytics (admin / cost tracking)
CREATE OR REPLACE VIEW public.v_ai_usage_summary AS
SELECT
  DATE_TRUNC('day', created_at)   AS day,
  interaction_type,
  COUNT(*)                        AS calls,
  SUM(tokens_used)                AS total_tokens,
  ROUND(AVG(latency_ms))          AS avg_latency_ms,
  ROUND(AVG(helpful_rating), 2)   AS avg_rating
FROM public.ai_feedback_log
GROUP BY 1, 2
ORDER BY 1 DESC, calls DESC;

-- Pending AI review queue for teachers
CREATE OR REPLACE VIEW public.v_ai_review_queue AS
SELECT
  asub.id                         AS submission_id,
  u.full_name                     AS learner_name,
  a.title                         AS assignment_title,
  asub.language_used,
  asub.ai_score,
  asub.ai_feedback,
  asub.submitted_at,
  c.name                          AS class_name
FROM public.assignment_submissions asub
JOIN public.learner_profiles lp ON lp.id  = asub.learner_id
JOIN public.users u             ON u.id   = lp.user_id
JOIN public.assignments a       ON a.id   = asub.assignment_id
JOIN public.classes c           ON c.id   = a.class_id
WHERE asub.status = 'submitted'
  AND asub.ai_score IS NOT NULL
  AND asub.teacher_score IS NULL
ORDER BY asub.submitted_at;

-- ════════════════════════════════════════════════════════════════
-- SECTION 14 — STORAGE BUCKETS (run via Supabase Dashboard or API)
-- ════════════════════════════════════════════════════════════════
-- Execute these in Supabase Dashboard → Storage, or via the JS client.
-- Uncomment if running via pg_net or supabase-js admin:

-- Story audio files (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('story-audio', 'story-audio', TRUE);

-- Story cover images (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', TRUE);

-- Learner oral recordings (private — RLS enforced)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('oral-recordings', 'oral-recordings', FALSE);

-- Vocabulary audio clips (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vocab-audio', 'vocab-audio', TRUE);

-- User avatars (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- ════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ════════════════════════════════════════════════════════════════
-- Tables: 22 | Triggers: 10 | Functions: 6 | Views: 5
-- RLS Policies: 10 | Indexes: 15 | Badge Seeds: 12
-- ════════════════════════════════════════════════════════════════
