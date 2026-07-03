/*
# Add Progress Tracking, Custom Exams, and Subject Coverage

1. New Tables
- `user_progress` - Track mastery % per subject/topic with daily goals
- `user_exams` - Custom exam dates set by students with preparation schedule
- `daily_goals` - Daily learning targets and streak tracking
- `comprehensive_subjects` - Full list of school & university subjects
- `online_resources` - Cached online resource references for AI tutor
- `study_sessions` - Track actual study time and activities
- `achievements` - Gamification badges and milestones

2. Security
- Enable RLS on all tables
- Allow anon + authenticated CRUD (single-tenant, public learning data)
*/

-- Comprehensive Subjects (Math, Physics, Chemistry, Biology, History, Economics, Computer Science, Languages, Psychology, Philosophy, and more)
CREATE TABLE IF NOT EXISTS comprehensive_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  icon text DEFAULT 'BookOpen',
  topics text[],
  difficulty_levels text[] DEFAULT ARRAY['Beginner', 'Intermediate', 'Advanced'],
  color text DEFAULT 'emerald',
  created_at timestamptz DEFAULT now()
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES comprehensive_subjects(id) ON DELETE CASCADE,
  topic_name text NOT NULL,
  mastery_percentage integer DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  flashcards_mastered integer DEFAULT 0,
  lessons_completed integer DEFAULT 0,
  total_time_spent_minutes integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Custom Exams (students set their own exam dates)
CREATE TABLE IF NOT EXISTS user_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL,
  exam_date date NOT NULL,
  subject_ids uuid[] DEFAULT '{}',
  target_subject text,
  preparation_start_date date DEFAULT now()::date,
  target_score integer DEFAULT 70,
  current_readiness integer DEFAULT 0,
  days_before_exam_for_review integer DEFAULT 1,
  preparation_status text DEFAULT 'not_started' CHECK (preparation_status IN ('not_started', 'in_progress', 'reviewing', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Daily Goals & Streaks
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT now()::date,
  target_minutes integer DEFAULT 60,
  target_topics integer DEFAULT 3,
  target_questions integer DEFAULT 20,
  target_flashcards integer DEFAULT 30,
  actual_minutes integer DEFAULT 0,
  actual_topics integer DEFAULT 0,
  actual_questions integer DEFAULT 0,
  actual_flashcards integer DEFAULT 0,
  completed boolean DEFAULT false,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES comprehensive_subjects(id) ON DELETE SET NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('lesson', 'quiz', 'flashcard', 'practice', 'reading', 'video', 'podcast', 'ai_tutor')),
  duration_minutes integer NOT NULL,
  questions_answered integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Online Resources Cache (for AI tutor to reference)
CREATE TABLE IF NOT EXISTS online_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES comprehensive_subjects(id) ON DELETE CASCADE,
  topic text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('article', 'video', 'pdf', 'interactive', 'quiz', 'course')),
  title text NOT NULL,
  description text,
  url text,
  source text,
  difficulty text DEFAULT 'Beginner',
  rating integer DEFAULT 0,
  accessed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Unlocked Stages/Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'Award',
  category text DEFAULT 'progress',
  requirement_type text,
  requirement_value integer,
  xp_reward integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_subject ON user_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_exams_date ON user_exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created ON study_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_online_resources_subject ON online_resources(subject_id);

-- Enable RLS
ALTER TABLE comprehensive_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies for comprehensive_subjects
CREATE POLICY "anon_select_comprehensive_subjects" ON comprehensive_subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_comprehensive_subjects" ON comprehensive_subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_comprehensive_subjects" ON comprehensive_subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_comprehensive_subjects" ON comprehensive_subjects FOR DELETE TO anon, authenticated USING (true);

-- Policies for user_progress
CREATE POLICY "anon_select_user_progress" ON user_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_user_progress" ON user_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_user_progress" ON user_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_user_progress" ON user_progress FOR DELETE TO anon, authenticated USING (true);

-- Policies for user_exams
CREATE POLICY "anon_select_user_exams" ON user_exams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_user_exams" ON user_exams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_user_exams" ON user_exams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_user_exams" ON user_exams FOR DELETE TO anon, authenticated USING (true);

-- Policies for daily_goals
CREATE POLICY "anon_select_daily_goals" ON daily_goals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_daily_goals" ON daily_goals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_daily_goals" ON daily_goals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_daily_goals" ON daily_goals FOR DELETE TO anon, authenticated USING (true);

-- Policies for study_sessions
CREATE POLICY "anon_select_study_sessions" ON study_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_study_sessions" ON study_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_study_sessions" ON study_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_study_sessions" ON study_sessions FOR DELETE TO anon, authenticated USING (true);

-- Policies for online_resources
CREATE POLICY "anon_select_online_resources" ON online_resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_online_resources" ON online_resources FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_online_resources" ON online_resources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_online_resources" ON online_resources FOR DELETE TO anon, authenticated USING (true);

-- Policies for achievements
CREATE POLICY "anon_select_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_achievements" ON achievements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_achievements" ON achievements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_achievements" ON achievements FOR DELETE TO anon, authenticated USING (true);

-- Seed comprehensive subjects
INSERT INTO comprehensive_subjects (name, category, description, icon, topics, color) VALUES
('Mathematics', 'school', 'Core mathematical concepts from algebra to calculus', 'Calculator', ARRAY['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'], 'blue'),
('Physics', 'school', 'Understanding the fundamental laws of nature', 'Atom', ARRAY['Mechanics', 'Thermodynamics', 'Waves', 'Electricity', 'Magnetism', 'Optics', 'Modern Physics'], 'purple'),
('Chemistry', 'school', 'Study of matter, its properties and reactions', 'FlaskConical', ARRAY['Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'], 'green'),
('Biology', 'school', 'Study of living organisms and life processes', 'Leaf', ARRAY['Cell Biology', 'Genetics', 'Evolution', 'Human Physiology', 'Botany', 'Zoology', 'Ecology'], 'green'),
('History', 'school', 'Understanding past events and civilizations', 'ScrollText', ARRAY['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Indian History', 'World History'], 'amber'),
('Geography', 'school', 'Study of Earth and its features', 'Globe', ARRAY['Physical Geography', 'Human Geography', 'Indian Geography', 'World Geography', 'Maps', 'Environment'], 'teal'),
('Economics', 'school', 'Study of production, distribution, and consumption', 'TrendingUp', ARRAY['Microeconomics', 'Macroeconomics', 'Indian Economy', 'International Trade', 'Banking', 'Public Finance'], 'emerald'),
('Computer Science', 'school', 'Computing, programming, and digital systems', 'Cpu', ARRAY['Programming Fundamentals', 'Data Structures', 'Algorithms', 'Databases', 'Networking', 'Web Development'], 'slate'),
('Political Science', 'school', 'Study of government systems and politics', 'Building2', ARRAY['Indian Constitution', 'Political Theory', 'International Relations', 'Public Administration', 'Governance'], 'red'),
('Psychology', 'school', 'Study of mind and behavior', 'Brain', ARRAY['Cognitive Psychology', 'Developmental Psychology', 'Social Psychology', 'Abnormal Psychology', 'Research Methods'], 'pink'),
('English', 'language', 'English language and literature', 'Languages', ARRAY['Grammar', 'Vocabulary', 'Comprehension', 'Writing Skills', 'Literature', 'Communication'], 'blue'),
('German', 'language', 'German language learning', 'Languages', ARRAY['Basic Vocabulary', 'Grammar', 'Conversation', 'Reading', 'Writing', 'Culture'], 'yellow'),
('Spanish', 'language', 'Spanish language learning', 'Languages', ARRAY['Basic Vocabulary', 'Grammar', 'Conversation', 'Reading', 'Writing', 'Culture'], 'orange'),
('French', 'language', 'French language learning', 'Languages', ARRAY['Basic Vocabulary', 'Grammar', 'Conversation', 'Reading', 'Writing', 'Culture'], 'indigo'),
('Hindi', 'language', 'Hindi language and literature', 'Languages', ARRAY['Grammar', 'Vocabulary', 'Literature', 'Writing', 'Poetry', 'Prose'], 'orange'),
('Sanskrit', 'language', 'Classical Sanskrit language', 'Languages', ARRAY['Grammar', 'Vocabulary', 'Literature', 'Shlokas', 'Translation'], 'amber'),
('Calculus', 'university', 'Advanced calculus for university level', 'Calculator', ARRAY['Limits', 'Derivatives', 'Integrals', 'Differential Equations', 'Multivariable Calculus'], 'blue'),
('Statistics', 'university', 'Statistical analysis and probability theory', 'BarChart3', ARRAY['Descriptive Statistics', 'Probability', 'Hypothesis Testing', 'Regression', 'ANOVA'], 'blue'),
('Organic Chemistry', 'university', 'Advanced organic chemistry', 'FlaskConical', ARRAY['Hydrocarbons', 'Functional Groups', 'Reaction Mechanisms', 'Stereochemistry', 'Biomolecules'], 'green'),
('Philosophy', 'university', 'Study of fundamental questions about existence, knowledge, and values', 'Lightbulb', ARRAY['Logic', 'Ethics', 'Metaphysics', 'Epistemology', 'Political Philosophy', 'Philosophy of Mind'], 'violet'),
('Advanced Physics', 'university', 'University-level physics', 'Atom', ARRAY['Classical Mechanics', 'Quantum Mechanics', 'Electromagnetism', 'Statistical Mechanics', 'Relativity'], 'purple'),
('Anatomy', 'university', 'Human anatomy and physiology', 'Heart', ARRAY['Musculoskeletal System', 'Nervous System', 'Cardiovascular System', 'Respiratory System', 'Digestive System'], 'red'),
('General Knowledge', 'professional', 'Current affairs and general awareness', 'Newspaper', ARRAY['Current Affairs', 'History', 'Geography', 'Polity', 'Economy', 'Science'], 'orange'),
('Reasoning', 'professional', 'Logical and analytical reasoning', 'Puzzle', ARRAY['Logical Reasoning', 'Analytical Reasoning', 'Verbal Reasoning', 'Non-verbal Reasoning', 'Data Interpretation'], 'cyan'),
('Quantitative Aptitude', 'professional', 'Mathematical aptitude for competitive exams', 'Calculator', ARRAY['Number System', 'Algebra', 'Geometry', 'Arithmetic', 'Data Interpretation', 'Mensuration'], 'blue'),
('Verbal Ability', 'professional', 'English language skills for competitive exams', 'MessageSquare', ARRAY['Reading Comprehension', 'Grammar', 'Vocabulary', 'Para Jumbles', 'Sentence Correction'], 'emerald')
ON CONFLICT DO NOTHING;

-- Seed achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('First Steps', 'Complete your first lesson', 'Footprints', 'progress', 'mastery', 1, 10),
('Quick Learner', 'Master 10 topics', 'Rocket', 'progress', 'mastery', 10, 50),
('Knowledge Seeker', 'Master 25 topics', 'BookOpen', 'progress', 'mastery', 25, 100),
('Scholar', 'Master 50 topics', 'GraduationCap', 'progress', 'mastery', 50, 200),
('On Fire!', 'Maintain a 7-day streak', 'Flame', 'streak', 'streak', 7, 75),
('Unstoppable', 'Maintain a 30-day streak', 'TrendingUp', 'streak', 'streak', 30, 300),
('Quiz Master', 'Answer 100 questions correctly', 'CheckCircle', 'questions', 'questions', 100, 100),
('Dedicated Learner', 'Study for 10 hours', 'Clock', 'time', 'time', 600, 50),
('Knowledge Vault', 'Study for 100 hours', 'Library', 'time', 'time', 6000, 500)
ON CONFLICT DO NOTHING;
