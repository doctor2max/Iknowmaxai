import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Video,
  Code,
  FileText,
  Eye,
  ChevronDown,
  Play
} from 'lucide-react';
import { sampleSeries, Lesson, Series } from '../data/sampleData';

export default function AdminLessons() {
  const [series, setSeries] = useState<Series[]>(sampleSeries);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(series[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeId: '',
    description: '',
    code: '',
    sandboxCode: ''
  });

  const selectedSeries = series.find(s => s.id === selectedSeriesId);

  const handleSubmit = () => {
    if (!selectedSeries) return;

    if (editingLesson) {
      setSeries(prev =>
        prev.map(s =>
          s.id === selectedSeriesId
            ? {
                ...s,
                lessons: s.lessons.map(l =>
                  l.id === editingLesson.id
                    ? { ...l, ...formData }
                    : l
                )
              }
            : s
        )
      );
    } else {
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        ...formData,
        completed: false,
        hasAttachments: false
      };
      setSeries(prev =>
        prev.map(s =>
          s.id === selectedSeriesId
            ? { ...s, lessons: [...s.lessons, newLesson] }
            : s
        )
      );
    }
    closeModal();
  };

  const handleDelete = (lessonId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      setSeries(prev =>
        prev.map(s =>
          s.id === selectedSeriesId
            ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
            : s
        )
      );
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      youtubeId: lesson.youtubeId,
      description: lesson.description,
      code: lesson.code,
      sandboxCode: lesson.sandboxCode || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
    setFormData({ title: '', youtubeId: '', description: '', code: '', sandboxCode: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الدروس</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedSeries}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          إضافة درس جديد
        </button>
      </div>

      {/* Series Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر الدورة
        </label>
        <div className="relative">
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
          >
            {series.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.lessons.length} دروس)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lessons List */}
      {selectedSeries && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">{selectedSeries.title}</h2>
            <p className="text-sm text-gray-500">{selectedSeries.description}</p>
          </div>

          {selectedSeries.lessons.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد دروس في هذه الدورة</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-emerald-600 hover:underline"
              >
                إضافة أول درس
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedSeries.lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          فيديو
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          وصف
                        </span>
                        <span className="flex items-center gap-1">
                          <Code className="w-4 h-4" />
                          كود
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          تجربة
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الدرس
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: المقدمة والتثبيت"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معرف فيديو اليوتيوب
                </label>
                <input
                  type="text"
                  value={formData.youtubeId}
                  onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                  placeholder="مثال: kqtD5dpn9C8"
                  dir="ltr"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  معرف الفيديو هو النص الموجود بعد v= في رابط اليوتيوب
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشرح النصي (Markdown)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="# العنوان&#10;&#10;محتوى الدرس..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكود البرمجي
                </label>
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="print('مرحباً')"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm bg-gray-900 text-gray-100"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Play className="w-4 h-4 inline ml-1" />
                  كود HTML لبيئة التجربة
                </label>
                <textarea
                  value={formData.sandboxCode}
                  onChange={(e) => setFormData({ ...formData, sandboxCode: e.target.value })}
                  placeholder={`<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; }
    </style>
</head>
<body>
    <h1>مرحباً!</h1>
</body>
</html>`}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm bg-gray-900 text-gray-100"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  أدخل كود HTML/CSS/JS لعرضه في بيئة التجربة التفاعلية
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl shrink-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.youtubeId}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingLesson ? 'حفظ التغييرات' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
