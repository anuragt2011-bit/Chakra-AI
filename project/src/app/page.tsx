'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Search, Menu, X, BookOpen, Brain, MessageCircle, TrendingUp, Calendar, Target, Globe, LayoutDashboard, Award, Layers, Phone, Mail, Chrome, UploadCloud, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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

type TabType = 'dashboard' | 'subjects' | 'exams' | 'materials' | 'ai-tutor';

type StudentProfile = {
  name: string;
  phone: string;
  email: string;
  authMethod: 'phone' | 'google' | 'email';
  classLevel: string;
  improvementSubjects: string[];
};

type StudyMaterial = {
  id: string;
  name: string;
  type: string;
  size: number;
  subject: string;
  note: string;
  addedAt: string;
};

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
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [authMethod, setAuthMethod] = useState<StudentProfile['authMethod']>('phone');
  const [studentName, setStudentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState('Class 10');
  const [selectedImprovementSubjects, setSelectedImprovementSubjects] = useState<string[]>(['Mathematics']);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [materialSubject, setMaterialSubject] = useState('General');
  const [materialNote, setMaterialNote] = useState('');

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


  const improvementOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Economics', 'Geography', 'Languages'];

  const toggleImprovementSubject = (subject: string) => {
    setSelectedImprovementSubjects((current) =>
      current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]
    );
  };

  const handleStudentEntry = () => {
    if (!studentName.trim() || !classLevel.trim() || selectedImprovementSubjects.length === 0) return;

    setStudentProfile({
      name: studentName.trim(),
      phone: phoneNumber.trim(),
      email: email.trim(),
      authMethod,
      classLevel,
      improvementSubjects: selectedImprovementSubjects,
    });
  };

  const handleMaterialUpload = (files: FileList | null) => {
    if (!files?.length) return;

    const newMaterials = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      type: file.type || 'Study file',
      size: file.size,
      subject: materialSubject,
      note: materialNote,
      addedAt: new Date().toISOString(),
    }));

    setStudyMaterials((current) => [...newMaterials, ...current]);
    setMaterialNote('');
    setActiveTab('ai-tutor');
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_transparent_36%),linear-gradient(135deg,_#0f172a_0%,_#134e4a_52%,_#0f766e_100%)] px-4 py-8 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-emerald-200" /> Secure student entry • personalized learning
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Welcome to a smarter, more creative AI study space.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-emerald-50/90">
                Authenticate, choose your class and improvement subjects, upload your own notes, and practice with an AI tutor that explains, quizzes, and solves questions around your material.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Authenticate', 'Phone, Google, or email sign-in flow'],
                ['Personalize', 'Class level and weak subjects first'],
                ['Upload', 'Notes, PDFs, images, worksheets'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <Sparkles className="mb-3 h-5 w-5 text-amber-200" />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-emerald-50/80">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/20 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Student authentication</p>
              <h2 className="text-2xl font-bold">Create your learning profile</h2>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                { id: 'phone', label: 'Phone', icon: Phone },
                { id: 'google', label: 'Google', icon: Chrome },
                { id: 'email', label: 'Email', icon: Mail },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setAuthMethod(method.id as StudentProfile['authMethod'])}
                  className={`rounded-2xl border p-3 text-sm font-medium transition ${authMethod === method.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <method.icon className="mx-auto mb-1 h-5 w-5" /> {method.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'College', 'Competitive Exam'].map((level) => <option key={level}>{level}</option>)}
              </select>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Subjects you want to improve</p>
                <div className="flex flex-wrap gap-2">
                  {improvementOptions.map((subject) => (
                    <button key={subject} onClick={() => toggleImprovementSubject(subject)} className={`rounded-full px-3 py-2 text-sm transition ${selectedImprovementSubjects.includes(subject) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {selectedImprovementSubjects.includes(subject) && <CheckCircle2 className="mr-1 inline h-4 w-4" />}{subject}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleStudentEntry} disabled={!studentName.trim() || selectedImprovementSubjects.length === 0} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
                Enter my AI classroom
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects' as const, label: 'Subjects', icon: BookOpen },
    { id: 'exams' as const, label: 'My Exams', icon: Calendar },
    { id: 'materials' as const, label: 'My Materials', icon: UploadCloud },
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
            <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-700 p-6 text-white shadow-xl">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Welcome back, {studentProfile.name}</p>
                  <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Your {studentProfile.classLevel} AI classroom is ready.</h1>
                  <p className="mt-3 max-w-2xl text-emerald-50/90">Ask questions, upload materials, practice weak subjects, and get step-by-step solutions that match your notes and goals.</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-emerald-100">Improvement focus</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentProfile.improvementSubjects.map((subject) => <span key={subject} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-teal-700">{subject}</span>)}
                  </div>
                  <button onClick={() => setActiveTab('materials')} className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-200"><UploadCloud className="h-4 w-4" /> Upload study material</button>
                </div>
              </div>
            </section>

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


            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><UploadCloud className="h-6 w-6" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Upload your own study materials</h2>
                      <p className="mt-1 text-slate-600">Add notes, PDFs, worksheets, images, assignments, or question papers. The AI tutor will reference these files in practice prompts and solution guidance.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[0.7fr_1fr]">
                    <div className="space-y-3">
                      <input value={materialSubject} onChange={(e) => setMaterialSubject(e.target.value)} placeholder="Subject for these files" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                      <textarea value={materialNote} onChange={(e) => setMaterialNote(e.target.value)} placeholder="Optional note: chapter, exam, or what you need help with" className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
                      <UploadCloud className="mb-3 h-10 w-10 text-emerald-600" />
                      <span className="font-semibold text-slate-800">Drop files here or click to upload</span>
                      <span className="mt-1 text-sm text-slate-500">PDF, image, text, document, or slides</span>
                      <input type="file" multiple className="hidden" onChange={(e) => handleMaterialUpload(e.target.files)} />
                    </label>
                  </div>
                </div>

                <div className="grid gap-3">
                  {studyMaterials.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">No materials yet. Upload your notes to unlock material-aware AI help.</div>
                  ) : studyMaterials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{material.name}</h3>
                        <p className="text-sm text-slate-500">{material.subject} • {(material.size / 1024).toFixed(1)} KB {material.note ? `• ${material.note}` : ''}</p>
                      </div>
                      <button onClick={() => setActiveTab('ai-tutor')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Ask AI</button>
                    </div>
                  ))}
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
                    studentProfile={studentProfile}
                    studyMaterials={studyMaterials}
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
