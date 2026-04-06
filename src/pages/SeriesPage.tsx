import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle, FileText, Download } from 'lucide-react';
import { sampleSeries } from '../data/sampleData';
import { useState } from 'react';

export default function SeriesPage() {
  const { seriesId } = useParams();
  const series = sampleSeries.find(s => s.id === seriesId);
  const [completedLessons, setCompletedLessons] = useState<string[]>(
    sampleSeries.flatMap(s => s.lessons.filter(l => l.completed).map(l => l.id))
  );

  if (!series) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">السلسلة غير موجودة</h2>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{series.title}</span>
      </nav>

      {/* Series Header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={series.image}
              alt={series.title}
              className="w-full h-full object-cover min-h-[250px]"
            />
          </div>
          <div className="md:w-2/3 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{series.title}</h1>
            <p className="text-gray-600 mb-6">{series.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Play className="w-4 h-4" />
                {series.lessons.length} دروس
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <CheckCircle className="w-4 h-4" />
                {completedLessons.filter(id => series.lessons.some(l => l.id === id)).length} مكتمل
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">التقدم</span>
                <span className="font-medium text-emerald-600">
                  {Math.round((completedLessons.filter(id => series.lessons.some(l => l.id === id)).length / series.lessons.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedLessons.filter(id => series.lessons.some(l => l.id === id)).length / series.lessons.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">الدروس</h2>
      <div className="space-y-4">
        {series.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-6">
              {/* Lesson Number */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                completedLessons.includes(lesson.id)
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {completedLessons.includes(lesson.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1">
                <Link
                  to={`/lesson/${lesson.id}`}
                  className="text-xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                >
                  {lesson.title}
                </Link>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    فيديو
                  </span>
                  {lesson.hasAttachments && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      مرفقات
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(lesson.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    completedLessons.includes(lesson.id)
                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {completedLessons.includes(lesson.id) ? 'مكتمل' : 'تحديد كمكتمل'}
                </button>
                <Link
                  to={`/lesson/${lesson.id}`}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  مشاهدة
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
