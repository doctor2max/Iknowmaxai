import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Download,
  MessageCircle,
  Code,
  FileText,
  Play,
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { sampleSeries, sampleComments } from '../data/sampleData';

export default function LessonPage() {
  const { lessonId } = useParams();
  const [activeTab, setActiveTab] = useState<'description' | 'code' | 'sandbox'>('description');
  const [completed, setCompleted] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [comments, setComments] = useState(sampleComments[lessonId || ''] || []);
  const [newComment, setNewComment] = useState('');

  // Find lesson and series
  let lesson = null;
  let series = null;
  let lessonIndex = 0;

  for (const s of sampleSeries) {
    const l = s.lessons.find(l => l.id === lessonId);
    if (l) {
      lesson = l;
      series = s;
      lessonIndex = s.lessons.indexOf(l);
      break;
    }
  }

  if (!lesson || !series) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">الدرس غير موجود</h2>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const nextLesson = series.lessons[lessonIndex + 1];
  const prevLesson = series.lessons[lessonIndex - 1];

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `c${Date.now()}`,
        userName: 'ضيف',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        content: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-emerald-600 font-mono text-sm">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4"><code>$2</code></pre>')
      .replace(/^- (.*$)/gm, '<li class="text-gray-600 ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="text-gray-600 ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-gray-600 mb-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/series/${series.id}`} className="hover:text-emerald-600 transition-colors">{series.title}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </nav>

      {/* Video Player */}
      <div className="bg-black rounded-2xl overflow-hidden mb-6">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
            title={lesson.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompleted(!completed)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              completed
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {completed ? 'مكتمل' : 'تحديد كمكتمل'}
          </button>
          {lesson.hasAttachments && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition-colors">
              <Download className="w-5 h-5" />
              تحميل المرفقات
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'description', icon: FileText, label: 'الشرح' },
            { id: 'code', icon: Code, label: 'الكود' },
            { id: 'sandbox', icon: Play, label: 'التجربة' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{lesson.title}</h1>

        {activeTab === 'description' && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.description) }}
          />
        )}

        {activeTab === 'code' && (
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-gray-100 font-mono text-sm leading-relaxed">
              <code>{lesson.code}</code>
            </pre>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">بيئة التجربة التفاعلية</h3>
              <button
                onClick={() => setShowFullscreen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                ملء الشاشة
              </button>
            </div>
            {/* Sandbox Preview - عرض النتيجة فقط */}
            <div className="border-4 border-gray-900 rounded-xl overflow-hidden min-h-[400px]">
              <iframe
                srcDoc={lesson.sandboxCode}
                className="w-full h-full min-h-[400px]"
                title="Sandbox"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-12">
        {prevLesson ? (
          <Link
            to={`/lesson/${prevLesson.id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>الدرس السابق: {prevLesson.title}</span>
          </Link>
        ) : <div />}
        {nextLesson && (
          <Link
            to={`/lesson/${nextLesson.id}`}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <span>الدرس التالي: {nextLesson.title}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          التعليقات ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAddComment}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              إضافة تعليق
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{comment.userName}</span>
                  <span className="text-sm text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-900">
            <h3 className="text-white font-semibold">بيئة التجربة التفاعلية</h3>
            <button
              onClick={() => setShowFullscreen(false)}
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              إغلاق
            </button>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={lesson.sandboxCode}
              className="w-full h-full"
              title="Sandbox"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      )}
    </div>
  );
}
