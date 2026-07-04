'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Target, Trash2, Edit, AlertTriangle, CheckCircle, Play, Pause, CalendarPlus, BookOpen } from 'lucide-react';
import { supabase, type UserExam, type ComprehensiveSubject } from '@/lib/supabase';

interface ExamSchedulerProps {
  onUpdate?: () => void;
}

export function ExamScheduler({ onUpdate }: ExamSchedulerProps) {
  const [exams, setExams] = useState<UserExam[]>([]);
  const [subjects, setSubjects] = useState<ComprehensiveSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<UserExam | null>(null);

  // Form state
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [targetSubject, setTargetSubject] = useState('');
  const [targetScore, setTargetScore] = useState(70);
  const [reviewDays, setReviewDays] = useState(1);
  const [notes, setNotes] = useState('');

  const fallbackSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Economics', 'Geography', 'Political Science', 'Hindi', 'Sanskrit'];
  const subjectOptions = subjects.length > 0 ? subjects.map((subject) => subject.name) : fallbackSubjects;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        supabase.from('user_exams').select('*').order('exam_date', { ascending: true }),
        supabase.from('comprehensive_subjects').select('*').limit(30),
      ]);

      if (examsRes.data) setExams(examsRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const examData = {
      exam_name: examName,
      exam_date: examDate,
      target_subject: targetSubject || null,
      target_score: targetScore,
      days_before_exam_for_review: reviewDays,
      notes: notes || null,
      preparation_status: 'not_started' as const,
    };

    try {
      if (editingExam) {
        await supabase.from('user_exams').update(examData).eq('id', editingExam.id);
      } else {
        await supabase.from('user_exams').insert(examData);
      }

      resetForm();
      fetchData();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExam(null);
    setExamName('');
    setExamDate('');
    setTargetSubject('');
    setTargetScore(70);
    setReviewDays(1);
    setNotes('');
  };

  const handleEdit = (exam: UserExam) => {
    setEditingExam(exam);
    setExamName(exam.exam_name);
    setExamDate(exam.exam_date);
    setTargetSubject(exam.target_subject || '');
    setTargetScore(exam.target_score);
    setReviewDays(exam.days_before_exam_for_review);
    setNotes(exam.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      await supabase.from('user_exams').delete().eq('id', id);
      fetchData();
      onUpdate?.();
    }
  };

  const updateStatus = async (id: string, status: UserExam['preparation_status']) => {
    await supabase.from('user_exams').update({ preparation_status: status }).eq('id', id);
    fetchData();
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateStr);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: UserExam['preparation_status'], daysUntil: number) => {
    if (status === 'completed') return 'bg-slate-100 text-slate-600 border-slate-200';
    if (daysUntil <= 0) return 'bg-red-100 text-red-600 border-red-200';
    if (daysUntil <= reviewDays) return 'bg-amber-100 text-amber-600 border-amber-200';
    return 'bg-emerald-100 text-emerald-600 border-emerald-200';
  };

  const upcomingExams = exams.filter(e => getDaysUntil(e.exam_date) > 0);
  const pastExams = exams.filter(e => getDaysUntil(e.exam_date) <= 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Exam Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          My Exam Schedule
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          Add Exam
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g., UPSC Prelims 2024"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Focus</label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select subject or type below</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Or type custom subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    placeholder="e.g., Algebra, Organic Chemistry, World History"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Score (%)</label>
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Review Days Before</label>
                  <input
                    type="number"
                    value={reviewDays}
                    onChange={(e) => setReviewDays(Number(e.target.value))}
                    min={1}
                    max={7}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">AI will prepare you this many days before</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingExam ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Exams */}
      {upcomingExams.length === 0 && pastExams.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No exams scheduled yet</p>
          <p className="text-sm text-slate-400 mt-1">Click &quot;Add Exam&quot; to schedule your first exam</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upcoming Exams */}
          {upcomingExams.map((exam) => {
            const daysUntil = getDaysUntil(exam.exam_date);
            const isReviewDay = daysUntil <= exam.days_before_exam_for_review;
            const statusColor = getStatusColor(exam.preparation_status, daysUntil);

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-xl border p-5 transition-all ${statusColor}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-800">{exam.exam_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                        {exam.preparation_status === 'completed' ? 'Completed' :
                         exam.preparation_status === 'reviewing' ? 'Reviewing' :
                         exam.preparation_status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                      {isReviewDay && exam.preparation_status !== 'completed' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Review Period!
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exam.exam_date)}
                      </span>
                      {exam.target_subject && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {exam.target_subject}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Target: {exam.target_score}%
                      </span>
                    </div>

                    {exam.notes && (
                      <p className="text-sm text-slate-500 mt-2">{exam.notes}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      daysUntil <= exam.days_before_exam_for_review ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {daysUntil}
                    </div>
                    <div className="text-xs text-slate-500">days left</div>

                    {isReviewDay && (
                      <p className="text-xs text-amber-600 mt-1">AI review active!</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Readiness</span>
                    <span>{exam.current_readiness}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        exam.current_readiness >= exam.target_score ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${exam.current_readiness}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  {exam.preparation_status === 'not_started' && (
                    <button
                      onClick={() => updateStatus(exam.id, 'in_progress')}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Play className="w-4 h-4" />
                      Start Preparation
                    </button>
                  )}
                  {exam.preparation_status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(exam.id, 'reviewing')}
                      className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                    >
                      <Pause className="w-4 h-4" />
                      Enter Review Mode
                    </button>
                  )}
                  {(exam.preparation_status === 'reviewing' || exam.preparation_status === 'in_progress') && (
                    <button
                      onClick={() => updateStatus(exam.id, 'completed')}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(exam)}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700 ml-auto"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {/* Past Exams */}
          {pastExams.length > 0 && (
            <div className="pt-6">
              <h3 className="text-sm font-medium text-slate-500 mb-3">Past Exams</h3>
              {pastExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-slate-50 rounded-xl p-4 mb-2 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-700">{exam.exam_name}</h4>
                      <p className="text-sm text-slate-500">{formatDate(exam.exam_date)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      exam.preparation_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {exam.preparation_status === 'completed' ? 'Completed' : 'Past'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
