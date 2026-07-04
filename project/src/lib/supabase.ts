import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EducationCategory = {
  id: string;
  name: string;
  type: 'school' | 'college' | 'competitive';
  level: string | null;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Subject = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type Book = {
  id: string;
  subject_id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  description: string | null;
  file_path: string | null;
  file_type: string;
  cover_image_url: string | null;
  pages: number | null;
  language: string;
  tags: string[] | null;
  is_featured: boolean;
  download_count: number;
  created_at: string;
};

export type ExamSchedule = {
  id: string;
  category_id: string;
  exam_name: string;
  exam_date: string;
  registration_start: string | null;
  registration_end: string | null;
  result_date: string | null;
  description: string | null;
  official_url: string | null;
  created_at: string;
};

export type ComprehensiveSubject = {
  id: string;
  name: string;
  category: 'school' | 'university' | 'language' | 'professional';
  description: string | null;
  icon: string;
  topics: string[] | null;
  difficulty_levels: string[] | null;
  color: string;
  created_at: string;
};

export type UserProgress = {
  id: string;
  subject_id: string | null;
  topic_name: string;
  mastery_percentage: number;
  questions_attempted: number;
  questions_correct: number;
  flashcards_mastered: number;
  lessons_completed: number;
  total_time_spent_minutes: number;
  last_accessed: string;
  created_at: string;
};

export type UserExam = {
  id: string;
  exam_name: string;
  exam_date: string;
  subject_ids: string[] | null;
  target_subject: string | null;
  preparation_start_date: string;
  target_score: number;
  current_readiness: number;
  days_before_exam_for_review: number;
  preparation_status: 'not_started' | 'in_progress' | 'reviewing' | 'completed';
  notes: string | null;
  created_at: string;
};

export type DailyGoal = {
  id: string;
  date: string;
  target_minutes: number;
  target_topics: number;
  target_questions: number;
  target_flashcards: number;
  actual_minutes: number;
  actual_topics: number;
  actual_questions: number;
  actual_flashcards: number;
  completed: boolean;
  streak_days: number;
  created_at: string;
};

export type StudySession = {
  id: string;
  subject_id: string | null;
  activity_type: 'lesson' | 'quiz' | 'flashcard' | 'practice' | 'reading' | 'video' | 'podcast' | 'ai_tutor';
  duration_minutes: number;
  questions_answered: number;
  questions_correct: number;
  notes: string | null;
  created_at: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  requirement_type: string | null;
  requirement_value: number | null;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
};

export type OnlineResource = {
  id: string;
  subject_id: string | null;
  topic: string;
  resource_type: 'article' | 'video' | 'pdf' | 'interactive' | 'quiz' | 'course';
  title: string;
  description: string | null;
  url: string | null;
  source: string | null;
  difficulty: string;
  rating: number;
  accessed_count: number;
  created_at: string;
};
