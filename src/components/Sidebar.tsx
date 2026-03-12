import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, BookOpen, X, Mail, Facebook, Twitter, Youtube, Github } from "lucide-react";
import { cn } from "../lib/utils";

type Lesson = {
  id: number;
  title: string;
  slug: string;
};

type Series = {
  id: number;
  title: string;
  lessons: Lesson[];
};

export function Sidebar({ onClose, settings = {} }: { onClose?: () => void, settings?: Record<string, string> }) {
  const [series, setSeries] = useState<Series[]>([]);
  const [openSeries, setOpenSeries] = useState<Record<number, boolean>>({});
  const location = useLocation();

  useEffect(() => {
    fetch("/api/series")
      .then((res) => res.json())
      .then((data) => {
        setSeries(data);
        // Open the first series by default
        if (data.length > 0) {
          setOpenSeries({ [data[0].id]: true });
        }
      });
  }, []);

  const toggleSeries = (id: number) => {
    setOpenSeries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const academyTitle = settings.academy_title || "أكاديمية الكود";

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300">
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3 text-white hover:text-indigo-400 transition-colors">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight">{academyTitle}</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {series.map((s) => (
          <div key={s.id} className="mb-2">
            <button
              onClick={() => toggleSeries(s.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <span className="text-slate-200">{s.title}</span>
              {openSeries[s.id] ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              )}
            </button>
            
            {openSeries[s.id] && (
              <div className="mt-1 pr-4 space-y-1 border-r-2 border-slate-800 mr-2">
                {s.lessons.map((lesson) => {
                  const encodedSlug = encodeURIComponent(lesson.slug || "");
                  const isActive = location.pathname === `/lessons/${encodedSlug}`;
                  return (
                    <Link
                      key={lesson.id}
                      to={`/lessons/${encodedSlug}`}
                      onClick={onClose}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        isActive 
                          ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      )}
                    >
                      {lesson.title}
                    </Link>
                  );
                })}
                {s.lessons.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500 italic">لا توجد دروس بعد</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-center gap-4">
          {settings.social_facebook && (
            <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          )}
          {settings.social_twitter && (
            <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {settings.social_youtube && (
            <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {settings.social_github && (
            <a href={settings.social_github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          )}
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="text-slate-500 hover:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
        <Link to="/admin/login" className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center">
          دخول الإدارة
        </Link>
      </div>
    </div>
  );
}
