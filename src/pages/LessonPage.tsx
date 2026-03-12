import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Download, ExternalLink, PlaySquare, Maximize, Minimize } from "lucide-react";
import { cn } from "../lib/utils";

type Lesson = {
  id: number;
  title: string;
  youtube_id: string;
  markdown_summary: string;
  python_code: string;
  custom_html: string;
  download_url: string;
};

export function LessonPage() {
  const { slug } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lessons/${encodeURIComponent(slug || "")}`)
      .then((res) => {
        if (!res.ok) throw new Error("الدرس غير موجود");
        return res.json();
      })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullScreen]);

  useEffect(() => {
    if (lesson?.custom_html && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(lesson.custom_html);
        doc.close();
      }
    }
  }, [lesson?.custom_html]);

  const handleCopy = () => {
    if (lesson?.python_code) {
      navigator.clipboard.writeText(lesson.python_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId) return "";
    // Regex to extract YouTube ID from various URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 pb-24" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {lesson.title}
        </h1>
        <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
      </div>

      {/* Video Player */}
      {lesson.youtube_id && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-900/5 bg-slate-900">
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(lesson.youtube_id)}`}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Markdown Summary */}
          {lesson.markdown_summary && (
            <div className="prose prose-slate prose-indigo max-w-none rtl:prose-reverse">
              <Markdown>{lesson.markdown_summary}</Markdown>
            </div>
          )}

          {/* Python Code Snippet */}
          {lesson.python_code && (
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 font-mono text-xs">python</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ" : "نسخ الكود"}
                </button>
              </div>
              <div className="relative" dir="ltr">
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    borderRadius: '0 0 0.75rem 0.75rem',
                  }}
                >
                  {lesson.python_code}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Interactive Sandbox */}
          {lesson.custom_html && (
            <div className={cn(
              "bg-white shadow-sm border border-slate-200 overflow-hidden transition-all duration-300",
              isFullScreen ? "fixed inset-0 z-50 rounded-none flex flex-col" : "rounded-2xl"
            )}>
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlaySquare className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">بيئة تفاعلية</h3>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  {isFullScreen ? (
                    <>
                      <Minimize className="w-3.5 h-3.5" />
                      تصغير
                    </>
                  ) : (
                    <>
                      <Maximize className="w-3.5 h-3.5" />
                      برنامج تفاعلي
                    </>
                  )}
                </button>
              </div>
              <div className={cn("bg-slate-50/30", isFullScreen ? "flex-1 p-0" : "p-4")}>
                <iframe
                  ref={iframeRef}
                  className={cn("w-full border-0 bg-white shadow-inner", isFullScreen ? "h-full rounded-none" : "min-h-[250px] rounded-lg")}
                  title="Interactive Sandbox"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* Resources */}
          {lesson.download_url && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-sm">الموارد والملحقات</h3>
              </div>
              <div className="p-4">
                <a
                  href={lesson.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>تحميل ملفات المشروع</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
