import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, CheckCircle, MessageSquare, Code, Layout as LayoutIcon, Play, Maximize, Minimize } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../App';

export default function LessonPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'code' | 'sandbox'>('content');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    fetch(`/api/lessons/${slug}`)
      .then(res => res.json())
      .then(data => {
        setLesson(data);
        fetchComments(data.id);
      });
  }, [slug]);

  const fetchComments = (lessonId: number) => {
    fetch(`/api/comments/${lessonId}`).then(res => res.json()).then(setComments);
  };

  const handleComplete = async () => {
    if (!user) return showToast('يرجى تسجيل الدخول لتتبع تقدمك', 'error');
    try {
      const res = await fetchWithAuth(`/api/progress/${lesson.id}`, { method: 'POST' });
      if (res.ok) {
        setIsCompleted(true);
        showToast('تم حفظ تقدمك بنجاح');
      } else {
        const err = await res.json();
        showToast('حدث خطأ: ' + (err.error || 'فشل الحفظ'), 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return showToast('يرجى تسجيل الدخول للتعليق', 'error');
    try {
      const res = await fetchWithAuth(`/api/comments/${lesson.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments(lesson.id);
        showToast('تم إضافة التعليق بنجاح');
      } else {
        const err = await res.json();
        showToast('حدث خطأ: ' + (err.error || 'فشل إضافة التعليق'), 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  if (!lesson) return <div className="p-12 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-xl transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <Helmet>
        <title>{lesson.title} - الأكاديمية</title>
        <meta name="description" content={lesson.markdown_summary?.substring(0, 160)} />
      </Helmet>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-4">
          <Link to="/" className="hover:text-neutral-900 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-neutral-900">{lesson.title}</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">{lesson.title}</h1>

        {/* Video Player */}
        {lesson.youtube_id && (
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black mb-8">
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-neutral-200 rounded-2xl mb-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleComplete}
              disabled={isCompleted}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
                isCompleted 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95"
              )}
            >
              <CheckCircle size={18} /> {isCompleted ? 'تم الإكمال' : 'تحديد كمكتمل'}
            </button>
            {lesson.download_url && (
              <a 
                href={lesson.download_url} 
                className="p-2.5 bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors"
                title="تحميل المرفقات"
              >
                <Download size={20} />
              </a>
            )}
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('content')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'content' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500")}
            >
              <Play size={14} className="inline ml-1" /> الشرح
            </button>
            {lesson.python_code && (
              <button 
                onClick={() => setActiveTab('code')}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'code' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500")}
              >
                <Code size={14} className="inline ml-1" /> الكود
              </button>
            )}
            {lesson.custom_html && (
              <button 
                onClick={() => setActiveTab('sandbox')}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'sandbox' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500")}
              >
                <LayoutIcon size={14} className="inline ml-1" /> تجربة
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 mb-12 shadow-sm min-h-[400px]">
          {activeTab === 'content' && (
            <div className="prose prose-neutral max-w-none">
              <ReactMarkdown>{lesson.markdown_summary}</ReactMarkdown>
            </div>
          )}
          
          {activeTab === 'code' && lesson.python_code && (
            <div className="rounded-2xl overflow-hidden border border-neutral-200">
              <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, padding: '24px' }}>
                {lesson.python_code}
              </SyntaxHighlighter>
            </div>
          )}

          {activeTab === 'sandbox' && lesson.custom_html && (
            <div className={cn(
              "rounded-2xl overflow-hidden border border-neutral-200 bg-white relative transition-all duration-300",
              isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-none" : "h-[600px]"
            )}>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-4 left-4 p-2 bg-neutral-900/80 text-white rounded-lg hover:bg-neutral-900 transition-colors z-10"
                title={isFullscreen ? "تصغير" : "تكبير"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <iframe
                srcDoc={lesson.custom_html}
                className="w-full h-full"
                title="HTML Sandbox"
              />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
            <MessageSquare size={24} className="text-neutral-400" />
            النقاشات ({comments.length})
          </h2>

          <form onSubmit={handleComment} className="mb-10">
            <textarea
              placeholder={user ? "شاركنا رأيك أو استفسارك..." : "يرجى تسجيل الدخول للتعليق"}
              disabled={!user}
              className="w-full p-4 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all min-h-[120px] mb-4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={!user || !newComment.trim()}
                className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all"
              >
                إرسال التعليق
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                      {c.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{c.username}</div>
                      <div className="text-xs text-neutral-400">{new Date(c.created_at).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
