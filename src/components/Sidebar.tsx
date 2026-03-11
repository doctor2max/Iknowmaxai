import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const [series, setSeries] = useState<any[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<number[]>([]);
  const location = useLocation();

  useEffect(() => {
    fetch('/api/series').then(res => res.json()).then(data => {
      setSeries(data);
      // Expand the series containing the current lesson
      const currentLesson = data.flatMap((s: any) => s.lessons).find((l: any) => `/lesson/${l.slug}` === location.pathname);
      if (currentLesson) {
        setExpandedSeries(prev => [...new Set([...prev, currentLesson.series_id])]);
      }
    });
  }, [location.pathname]);

  const toggleSeries = (id: number) => {
    setExpandedSeries(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full overflow-y-auto py-6 px-4">
      <div className="space-y-6">
        {series.map((s) => (
          <div key={s.id} className="space-y-2">
            <button
              onClick={() => toggleSeries(s.id)}
              className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-xl group transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-200 transition-colors">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-semibold text-neutral-900 text-right">{s.title}</span>
              </div>
              {expandedSeries.includes(s.id) ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
            </button>

            {expandedSeries.includes(s.id) && (
              <div className="mr-4 pr-4 border-r border-neutral-100 space-y-1">
                {s.lessons.map((l: any) => (
                  <Link
                    key={l.id}
                    to={`/lesson/${l.slug}`}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg text-sm transition-all",
                      location.pathname === `/lesson/${l.slug}`
                        ? "bg-neutral-900 text-white font-medium shadow-sm"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                  >
                    <PlayCircle size={14} className={cn(location.pathname === `/lesson/${l.slug}` ? "text-white/70" : "text-neutral-300")} />
                    <span>{l.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
