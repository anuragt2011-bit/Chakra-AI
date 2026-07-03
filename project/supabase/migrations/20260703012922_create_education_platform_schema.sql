/*
# Create Education Platform Schema

1. New Tables
- `education_categories` - Stores education levels (Class 8-12, Graduation, Post Graduation) and competitive exams (UPSC, NDA, BPSC, etc.)
- `subjects` - Subjects within each category
- `books` - Book records with file paths, metadata
- `exam_schedules` - Exam dates for competitive exams
- `book_files` - File storage metadata for books

2. Security
- Enable RLS on all tables
- Allow anon + authenticated CRUD (single-tenant app, publicly browsable content)
*/

-- Education Categories (Class levels and Competitive Exams)
CREATE TABLE IF NOT EXISTS education_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('school', 'college', 'competitive')),
  level text,
  description text,
  icon text DEFAULT 'BookOpen',
  color text DEFAULT 'emerald',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Subjects within categories
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES education_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'Book',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  publisher text,
  description text,
  file_path text,
  file_type text DEFAULT 'pdf',
  cover_image_url text,
  pages integer,
  language text DEFAULT 'English',
  tags text[],
  is_featured boolean DEFAULT false,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Exam Schedules
CREATE TABLE IF NOT EXISTS exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES education_categories(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  exam_date date NOT NULL,
  registration_start date,
  registration_end date,
  result_date date,
  description text,
  official_url text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category_id);
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_category ON exam_schedules(category_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);

-- Enable RLS
ALTER TABLE education_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for education_categories
DROP POLICY IF EXISTS "anon_crud_categories" ON education_categories;
CREATE POLICY "anon_select_categories" ON education_categories FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_categories" ON education_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_categories" ON education_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_categories" ON education_categories FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for subjects
DROP POLICY IF EXISTS "anon_crud_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for books
DROP POLICY IF EXISTS "anon_crud_books" ON books;
CREATE POLICY "anon_select_books" ON books FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_books" ON books FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_books" ON books FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_books" ON books FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for exam_schedules
DROP POLICY IF EXISTS "anon_crud_exam_schedules" ON exam_schedules;
CREATE POLICY "anon_select_exam_schedules" ON exam_schedules FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_exam_schedules" ON exam_schedules FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_exam_schedules" ON exam_schedules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_exam_schedules" ON exam_schedules FOR DELETE
  TO anon, authenticated USING (true);

-- Seed initial education categories
INSERT INTO education_categories (name, type, level, description, icon, color, sort_order) VALUES
-- School levels
('Class 8', 'school', '8', 'Foundation level education for middle school students', 'GraduationCap', 'blue', 1),
('Class 9', 'school', '9', 'Secondary school foundation year', 'GraduationCap', 'blue', 2),
('Class 10', 'school', '10', 'Board examination preparatory level', 'GraduationCap', 'blue', 3),
('Class 11', 'school', '11', 'Higher secondary first year (Science/Commerce/Arts)', 'GraduationCap', 'blue', 4),
('Class 12', 'school', '12', 'Board examination and entrance preparatory level', 'GraduationCap', 'blue', 5),
-- College levels
('Graduation', 'college', 'UG', 'Undergraduate degree programs (B.A, B.Sc, B.Com, B.Tech, etc.)', 'Award', 'emerald', 6),
('Post Graduation', 'college', 'PG', 'Postgraduate degree programs (M.A, M.Sc, M.Com, M.Tech, MBA, etc.)', 'Award', 'emerald', 7),
-- Competitive Exams
('UPSC', 'competitive', 'Civil Services', 'Union Public Service Commission - IAS, IPS, IFS examinations', 'Building', 'orange', 8),
('NDA', 'competitive', 'Defence', 'National Defence Academy examination for Armed Forces', 'Shield', 'orange', 9),
('BPSC', 'competitive', 'State Services', 'Bihar Public Service Commission examinations', 'Building', 'orange', 10),
('SSC', 'competitive', 'Central Services', 'Staff Selection Commission examinations for government jobs', 'Briefcase', 'orange', 11),
('Railway', 'competitive', 'Railway Jobs', 'Indian Railways recruitment examinations', 'Train', 'orange', 12),
('Banking', 'competitive', 'Banking Jobs', 'IBPS, SBI, and other banking sector examinations', 'Landmark', 'orange', 13),
('GATE', 'competitive', 'Engineering', 'Graduate Aptitude Test in Engineering for PSU and M.Tech admissions', 'Cpu', 'orange', 14),
('CAT', 'competitive', 'Management', 'Common Admission Test for MBA admissions in IIMs', 'TrendingUp', 'orange', 15),
('NEET', 'competitive', 'Medical', 'National Eligibility Entrance Test for medical admissions', 'Heart', 'orange', 16),
('JEE', 'competitive', 'Engineering', 'Joint Entrance Examination for IIT and NIT admissions', 'Calculator', 'orange', 17)
ON CONFLICT DO NOTHING;
