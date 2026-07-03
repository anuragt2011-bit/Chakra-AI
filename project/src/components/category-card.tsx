'use client';

import { BookOpen, GraduationCap, Award, Building, Shield, Briefcase, Train, Landmark, Cpu, TrendingUp, Heart, Calculator, Folder, ChevronRight, Calendar } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  GraduationCap,
  Award,
  Building,
  Shield,
  Briefcase,
  Train,
  Landmark,
  Cpu,
  TrendingUp,
  Heart,
  Calculator,
  Folder,
};

const colorMap: Record<string, { bg: string; hover: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  slate: { bg: 'bg-slate-50', hover: 'hover:bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

interface CategoryCardProps {
  id: string;
  name: string;
  type: 'school' | 'college' | 'competitive';
  level: string | null;
  description: string | null;
  icon: string;
  color: string;
  bookCount?: number;
  examDate?: string | null;
  onClick?: () => void;
}

export function CategoryCard({
  name,
  type,
  level,
  description,
  icon,
  color,
  bookCount = 0,
  examDate,
  onClick,
}: CategoryCardProps) {
  const IconComponent = iconMap[icon] || Folder;
  const colors = colorMap[color] || colorMap.slate;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const examDate = new Date(dateStr);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExam = examDate ? getDaysUntil(examDate) : null;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border ${colors.border} p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className={`w-14 h-14 ${colors.bg} ${colors.hover} rounded-xl flex items-center justify-center mb-4 transition-colors`}>
        <IconComponent className={`w-7 h-7 ${colors.text}`} />
      </div>

      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
        {level && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {level}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          {bookCount} books
        </span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>

      {examDate && daysUntilExam !== null && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${daysUntilExam <= 30 ? 'text-red-500' : 'text-slate-400'}`} />
            <span className={`text-sm font-medium ${daysUntilExam <= 30 ? 'text-red-600' : 'text-slate-600'}`}>
              {formatDate(examDate)}
            </span>
            {daysUntilExam > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                daysUntilExam <= 7 ? 'bg-red-100 text-red-700' :
                daysUntilExam <= 30 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {daysUntilExam} days left
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
