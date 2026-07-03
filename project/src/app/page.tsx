'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Search, Menu, X, BookOpen, Brain, MessageCircle, Headphones, TrendingUp, Calendar, Target, Globe, ChevronLeft, LayoutDashboard, Award, Layers } from 'lucide-react';
import { supabase, type EducationCategory, type ExamSchedule, type ComprehensiveSubject, type UserExam } from '@/lib/supabase';
import { CategoryCard } from '@/components/category-card';
import { ExamTracker } from '@/components/exam-tracker';
import { ProgressDashboard } from '@/components/progress-dashboard';
import { ExamScheduler } from '@/components/exam-scheduler';
import { AITutorChat } from '@/components/ai-tutor-chat';

type CategoryWithExam = EducationCategory & {
  exam_dates?: ExamSchedule[];
};

type ExamWithCategory = ExamSchedule & {
  category_name: string;
  education_categories: { name: string };
};

type TabType = 'dashboard' | 'subjects' | 'exams' | 'ai-tutor';

export default function Home() {
  const [categories, setCategories] = useState<CategoryWithExam[]>([]);
  const [comprehensiveSubjects, setComprehensiveSubjects] = useState<ComprehensiveSubject[]>([]);
  const [exams, setExams] = useState<ExamWithCategory[]>([]);
  const [userExams, setUserExams] = useState<UserExam[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithExam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ComprehensiveSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, examsRes, subjectsRes, userExamsRes] = await Promise.all([
        supabase.from('education_categories').select('*').order('sort_order'),
        supabase.from('exam_schedules').select('*, education_categories(name)'),
        supabase.from('comprehensive_subjects').select('*').order('name'),
        supabase.from('user_exams').select('*').order('exam_date'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (examsRes.data) {
        setExams(examsRes.data.map(e => ({
          ...e,
          category_name: e.education_categories?.name || 'Unknown',
        })));
      }
      if (subjectsRes.data) setComprehensiveSubjects(subjectsRes.data);
      if (userExamsRes.data) setUserExams(userExamsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.level?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = comprehensiveSubjects.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const schoolCategories = filteredCategories.filter(c => c.type === 'school');
  const collegeCategories = filteredCategories.filter(c => c.type === 'college');
  const competitiveCategories = filteredCategories.filter(c => c.type === 'competitive');

  const activeUserExams = userExams.filter(e => e.preparation_status === 'in_progress' || e.preparation_status === 'reviewing')[0];

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects' as const, label: 'Subjects', icon: BookOpen },
    { id: 'exams' as const, label: 'My Exams', icon: Calendar },
    { id: 'ai-tutor' as const, label: 'AI Tutor', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-semibold text-slate-800">LearnSmart</span>
                  <p className="text-xs text-slate-500">AI-Powered Learning Platform</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subjects, exams, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-40 overflow-y-auto">
          <div className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl ${
                  activeTab === tab.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your learning dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
                    <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">25+</p>
                    <p className="text-emerald-100 text-sm">Subjects Available</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
                    <Globe className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">Online</p>
                    <p className="text-blue-100 text-sm">Resource Access</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
                    <Calendar className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">{userExams.length}</p>
                    <p className="text-amber-100 text-sm">Exams Scheduled</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
                    <Award className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">9</p>
                    <p className="text-purple-100 text-sm">Achievements</p>
                  </div>
                </div>

                {/* Subject Coverage Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    Complete Subject Coverage
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Covers school & university subjects: <span className="font-medium">Math, Physics, Chemistry, Biology, History, Economics, Computer Science, Languages (German, Spanish, French), Psychology, Philosophy</span>, and more.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {comprehensiveSubjects.slice(0, 12).map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setActiveTab('ai-tutor');
                        }}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left"
                      >
                        <p className="font-medium text-slate-800 text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{subject.category}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab('subjects')}
                    className="mt-4 text-emerald-600 text-sm font-medium hover:text-emerald-700"
                  >
                    Browse all {comprehensiveSubjects.length} subjects →
                  </button>
                </div>

                {/* Progress Dashboard */}
                <ProgressDashboard
                  onSubjectSelect={(subjectId) => {
                    const subject = comprehensiveSubjects.find(s => s.id === subjectId);
                    if (subject) {
                      setSelectedSubject(subject);
                      setActiveTab('ai-tutor');
                    }
                  }}
                />

                {/* Quick Exam Tracker */}
                {userExams.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-800">Upcoming Exams</h2>
                      <button
                        onClick={() => setActiveTab('exams')}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Manage →
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {userExams.slice(0, 2).map((exam) => {
                        const daysUntil = Math.ceil((new Date(exam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={exam.id} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-slate-800">{exam.exam_name}</h3>
                                <p className="text-sm text-slate-500">{new Date(exam.exam_date).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${daysUntil <= exam.days_before_exam_for_review ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {daysUntil}
                                </p>
                                <p className="text-xs text-slate-500">days</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${exam.current_readiness}%` }}></div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Readiness: {exam.current_readiness}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjects Tab */}
            {activeTab === 'subjects' && (
              <div className="space-y-8">
                {/* School Level Exams */}
                {schoolCategories.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-800">School Level (Class 8-12)</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {schoolCategories.map((category) => {
                        const categoryExams = exams.filter(e => e.category_id === category.id);
                        return (
                          <CategoryCard
                            key={category.id}
                            {...category}
                            examDate={categoryExams[0]?.exam_date || null}
                            onClick={() => setSelectedCategory(category)}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* College Level */}
                {collegeCategories.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-xl font-semibold text-slate-800">College Level</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collegeCategories.map((category) => (
                        <CategoryCard
                          key={category.id}
                          {...category}
                          onClick={() => setSelectedCategory(category)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Competitive Exams */}
                {competitiveCategories.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-orange-600" />
                      <h2 className="text-xl font-semibold text-slate-800">Competitive Exams (UPSC, NDA, BPSC, etc.)</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {competitiveCategories.map((category) => {
                        const categoryExams = exams.filter(e => e.category_id === category.id);
                        return (
                          <CategoryCard
                            key={category.id}
                            {...category}
                            examDate={categoryExams[0]?.exam_date || null}
                            onClick={() => setSelectedCategory(category)}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Comprehensive Subjects */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-slate-800">All Subjects ({comprehensiveSubjects.length})</h2>
                  </div>

                  {/* Filter by category */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['school', 'university', 'language', 'professional'].map((cat) => (
                      <button
                        key={cat}
                        className="px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 capitalize"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setActiveTab('ai-tutor');
                        }}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                            {subject.category}
                          </span>
                        </div>
                        {subject.description && (
                          <p className="text-sm text-slate-500 line-clamp-2">{subject.description}</p>
                        )}
                        {subject.topics && subject.topics.length > 0 && (
                          <p className="text-xs text-slate-400 mt-2">{subject.topics.length} topics</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <div className="max-w-3xl mx-auto">
                <ExamScheduler onUpdate={fetchData} />

                {/* Info Box */}
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-800 mb-1">Exam Preparation Features</h3>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Set your exam date and I&apos;ll create a personalized study plan</li>
                        <li>• AI prepares you <strong>one day before the exam</strong> with focused review</li>
                        <li>• Track your readiness percentage and daily progress</li>
                        <li>• Access online resources when you don&apos;t have materials</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Tutor Tab */}
            {activeTab === 'ai-tutor' && (
              <div className="max-w-3xl mx-auto">
                <div className="min-h-[70vh] bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <AITutorChat
                    selectedCategory={selectedCategory?.name}
                    selectedSubject={selectedSubject}
                    upcomingExam={activeUserExams}
                  />
                </div>

                {/* Features */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium text-slate-800">Online Resource Access</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Don&apos;t have study materials? I&apos;ll fetch resources from Khan Academy, YouTube, Coursera, and more.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <h3 className="font-medium text-slate-800">Exam-Day Preparation</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Set your exam date and I&apos;ll review with you the day before, ensuring you&apos;re fully prepared.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-2">
              Visual dashboards show % mastered, daily goals, and unlocked stages.
            </p>
            <p className="text-slate-400 text-xs">
              &copy; 2026 LearnSmart Education Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
