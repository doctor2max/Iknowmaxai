import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, ChevronLeft } from 'lucide-react';

export default function CoursesPage() {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/series').then(res => res.json()).then(setSeries);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Helmet>
        <title>الدورات التعليمية - الأكاديمية</title>
      </Helmet>

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">الدورات التعليمية</h1>
        <p className="text-lg text-neutral-500 max-w-2xl">
          تصفح جميع السلاسل والدروس المتاحة في الأكاديمية وابدأ رحلة التعلم الخاصة بك.
        </p>
      </div>

      <div className="space-y-12">
        {series.map((s) => (
          <div key={s.id} className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">{s.title}</h2>
                <p className="text-neutral-500">{s.description || 'لا يوجد وصف لهذه السلسلة.'}</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {s.lessons.length > 0 ? s.lessons.map((l: any, index: number) => (
                  <Link 
                    key={l.id} 
                    to={`/lesson/${l.slug}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        {index + 1}
                      </div>
                      <span className="font-bold text-neutral-900">{l.title}</span>
                    </div>
                    <PlayCircle size={20} className="text-neutral-300 group-hover:text-blue-600 transition-colors" />
                  </Link>
                )) : (
                  <div className="col-span-2 text-neutral-400 py-4">لا توجد دروس في هذه السلسلة بعد.</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {series.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            لا توجد دورات متاحة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
