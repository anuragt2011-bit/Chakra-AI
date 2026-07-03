'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Target, Clock, Award, Flame, BookOpen, Brain, CheckCircle, ChevronRight,Calendar } from 'lucide-react';
import { supabase, type UserProgress, type DailyGoal, type Achievement, type ComprehensiveSubject } from '@/lib/supabase';

interface ProgressDashboardProps {
  onSubjectSelect?: (subjectId: string) => void;
}

export function ProgressDashboard({ onSubjectSelect }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [subjects, setSubjects] = useState<ComprehensiveSubject[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [subjectsRes, progressRes, goalsRes, achievementsRes] = await Promise.all([
        supabase.from('comprehensive_subjects').select('*').limit(30),
        supabase.from('user_progress').select('*').order('last_accessed', { ascending: false }).limit(10),
        supabase.from('daily_goals').select('*').eq('date', today).maybeSingle(),
        supabase.from('achievements').select('*').order('xp_reward', { ascending: false }),
      ]);

      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      if (goalsRes.data) setDailyGoal(goalsRes.data);
      else {
        // Create today's goal if not exists
        const newGoal = await supabase.from('daily_goals').insert({
          date: today,
          target_minutes: 60,
          target_topics: 3,
          target_questions: 20,
          target_flashcards: 30,
        }).select().single();
        if (newGoal.data) setDailyGoal(newGoal.data);
      }
      if (achievementsRes.data) setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallMastery = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.mastery_percentage, 0);
    return Math.round(total / progress.length);
  };

  const calculateGoalProgress = () => {
    if (!dailyGoal) return { minutes: 0, topics: 0, questions: 0, flashcards: 0 };
    return {
      minutes: Math.min(100, Math.round((dailyGoal.actual_minutes / dailyGoal.target_minutes) * 100)),
      topics: Math.min(100, Math.round((dailyGoal.actual_topics / dailyGoal.target_topics) * 100)),
      questions: Math.min(100, Math.round((dailyGoal.actual_questions / dailyGoal.target_questions) * 100)),
      flashcards: Math.min(100, Math.round((dailyGoal.actual_flashcards / dailyGoal.target_flashcards) * 100)),
    };
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const goalProgress = calculateGoalProgress();
  const overallMastery = calculateOverallMastery();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mastery Overview Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Overall Mastery</h2>
            <p className="text-emerald-100 text-sm">Your learning progress across all subjects</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">{dailyGoal?.streak_days || 0} day streak</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeDasharray={`${overallMastery * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-bold">{overallMastery}%</span>
              <span className="text-xs text-emerald-100">mastered</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Topics Covered
                </span>
                <span className="text-sm font-medium">{progress.length} topics</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(progress.length * 5, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Questions Answered
                </span>
                <span className="text-sm font-medium">
                  {progress.reduce((sum, p) => sum + p.questions_attempted, 0)} total
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(progress.reduce((sum, p) => sum + p.questions_correct, 0) / Math.max(1, progress.reduce((sum, p) => sum + p.questions_attempted, 0)) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Today&apos;s Goals
          </h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            dailyGoal?.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {dailyGoal?.completed ? 'Completed!' : 'In Progress'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: 'Study Time', current: dailyGoal?.actual_minutes || 0, target: dailyGoal?.target_minutes || 60, unit: 'min', progress: goalProgress.minutes },
            { icon: BookOpen, label: 'Topics', current: dailyGoal?.actual_topics || 0, target: dailyGoal?.target_topics || 3, unit: '', progress: goalProgress.topics },
            { icon: Brain, label: 'Questions', current: dailyGoal?.actual_questions || 0, target: dailyGoal?.target_questions || 20, unit: '', progress: goalProgress.questions },
            { icon: CheckCircle, label: 'Flashcards', current: dailyGoal?.actual_flashcards || 0, target: dailyGoal?.target_flashcards || 30, unit: '', progress: goalProgress.flashcards },
          ].map((goal, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <goal.icon className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">{goal.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-800">{goal.current}</span>
                <span className="text-sm text-slate-400">/ {goal.target}{goal.unit}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    goal.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Subject Progress</h3>
          <span className="text-sm text-slate-500">{progress.length} topics active</span>
        </div>

        {progress.length > 0 ? (
          <div className="space-y-3">
            {progress.slice(0, 5).map((p) => {
              const subject = subjects.find(s => s.id === p.subject_id);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => subject && onSubjectSelect?.(subject.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{p.topic_name}</span>
                      <span className="text-sm font-semibold text-emerald-600">{p.mastery_percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${p.mastery_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start learning to track your progress</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <span className="text-sm text-slate-500">{unlockedAchievements.length}/{achievements.length} unlocked</span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {achievements.slice(0, 10).map((achievement) => (
            <div
              key={achievement.id}
              className={`relative p-3 rounded-xl text-center transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-slate-50 opacity-50'
              }`}
              title={achievement.description || ''}
            >
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                achievement.unlocked ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-700 truncate">{achievement.name}</p>
              {achievement.unlocked && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Subjects */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Browse Subjects</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subjects.slice(0, 12).map((subject) => (
            <div
              key={subject.id}
              onClick={() => onSubjectSelect?.(subject.id)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <p className="font-medium text-slate-800 text-sm truncate">{subject.name}</p>
              <p className="text-xs text-slate-500 capitalize">{subject.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
