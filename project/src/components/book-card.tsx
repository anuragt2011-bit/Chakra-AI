'use client';

import { Book, Download, FileText, Clock, User, Building } from 'lucide-react';
import Image from 'next/image';

interface BookCardProps {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  description: string | null;
  file_type: string;
  cover_image_url: string | null;
  pages: number | null;
  language: string;
  download_count: number;
  onClick?: () => void;
}

export function BookCard({
  title,
  author,
  publisher,
  description,
  file_type,
  cover_image_url,
  pages,
  language,
  download_count,
  onClick,
}: BookCardProps) {
  const fileTypeColors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600',
    epub: 'bg-blue-100 text-blue-600',
    mobi: 'bg-amber-100 text-amber-600',
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all"
    >
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        {cover_image_url ? (
          <Image
            src={cover_image_url}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <Book className="w-16 h-16 text-slate-300" />
        )}
        <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-lg uppercase ${fileTypeColors[file_type] || 'bg-slate-100 text-slate-600'}`}>
          {file_type}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {title}
        </h4>

        {author && (
          <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
            <User className="w-3.5 h-3.5" />
            {author}
          </p>
        )}

        {publisher && (
          <p className="text-sm text-slate-400 flex items-center gap-1 mb-2">
            <Building className="w-3.5 h-3.5" />
            {publisher}
          </p>
        )}

        {description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {pages && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {pages} pages
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {language}
            </span>
          </div>
          <span className="flex items-center gap-1 text-emerald-600">
            <Download className="w-3.5 h-3.5" />
            {download_count}
          </span>
        </div>
      </div>
    </div>
  );
}
