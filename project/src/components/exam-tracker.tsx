'use client';

import { Calendar, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

interface ExamInfo {
  id: string;
  exam_name: string;
  exam_date: string;
  registration_start: string | null;
  registration_end: string | null;
  result_date: string | null;
  description: string | null;
  official_url: string | null;
  category_name: string;
}

interface ExamTrackerProps {
  exams: ExamInfo[];
  onExamClick?: (examId: string) => void;
}

export function ExamTracker({ exams, onExamClick }: ExamTrackerProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (examDate: string, regEnd: string | null) => {
    const daysUntilExam = getDaysUntil(examDate);
    const daysUntilRegEnd = regEnd ? getDaysUntil(regEnd) : null;

    if (daysUntilExam < 0) return { status: 'completed', label: 'Completed', color: 'slate' };
    if (daysUntilRegEnd !== null && daysUntilRegEnd < 0) return { status: 'closed', label: 'Registration Closed', color: 'red' };
    if (daysUntilRegEnd !== null && daysUntilRegEnd <= 7) return { status: 'urgent', label: 'Register Soon!', color: 'red' };
    if (daysUntilExam <= 7) return { status: 'imminent', label: 'This Week!', color: 'red' };
    if (daysUntilExam <= 30) return { status: 'soon', label: 'This Month', color: 'amber' };
    return { status: 'upcoming', label: 'Upcoming', color: 'emerald' };
  };

  const sortedExams = [...exams].sort((a, b) => {
    const daysA = getDaysUntil(a.exam_date);
    const daysB = getDaysUntil(b.exam_date);
    return daysA - daysB;
  });

  const upcomingExams = sortedExams.filter(e => getDaysUntil(e.exam_date) > 0);
  const recentExams = sortedExams.filter(e => getDaysUntil(e.exam_date) <= 0).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Exam Schedule Tracker
          </h2>
          <span className="text-sm text-slate-500">{upcomingExams.length} upcoming</span>
        </div>
      </div>

      {upcomingExams.length === 0 && recentExams.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No exam schedules available yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {upcomingExams.map((exam) => {
            const { status, label, color } = getStatus(exam.exam_date, exam.registration_end);
            const daysUntil = getDaysUntil(exam.exam_date);

            return (
              <div
                key={exam.id}
                onClick={() => onExamClick?.(exam.id)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-400">{exam.category_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${color === 'red' ? 'bg-red-100 text-red-700' :
                          color === 'amber' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">{exam.exam_name}</h3>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(exam.exam_date)}
                      </span>
                      {exam.registration_end && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Reg ends: {formatDate(exam.registration_end)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-2xl font-bold ${
                      daysUntil <= 7 ? 'text-red-600' :
                      daysUntil <= 30 ? 'text-amber-600' :
                      'text-slate-400'
                    }`}>
                      {daysUntil}
                    </div>
                    <span className="text-xs text-slate-400">days</span>
                    {status === 'urgent' && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Register Now!</span>
                      </div>
                    )}
                  </div>
                </div>

                {exam.official_url && (
                  <a
                    href={exam.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Official Website
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
