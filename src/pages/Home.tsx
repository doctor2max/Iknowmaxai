import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Award, Eye } from 'lucide-react';
import { academyInfo, sampleSeries } from '../data/sampleData';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={academyInfo.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{academyInfo.name}</h1>
            <p className="text-2xl text-gray-300 mb-8">{academyInfo.tagline}</p>
            <Link
              to={`/series/${sampleSeries[0].id}`}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/30"
            >
              <ArrowLeft className="w-5 h-5" />
              ابدأ التعلم
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-600">{academyInfo.stats.students.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">طالب</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-emerald-600">{academyInfo.stats.lessons}</div>
              <div className="text-gray-600 mt-1">درس</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-600">{academyInfo.stats.completedLessons.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">درس مكتمل</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
              <Eye className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-lg font-bold text-orange-600 truncate px-2" title={academyInfo.stats.mostViewed}>
                {academyInfo.stats.mostViewed}
              </div>
              <div className="text-gray-600 mt-1">الأكثر مشاهدة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Series Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الدورات المتاحة</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اختر من دوراتنا المتنوعة وابدأ رحلتك في عالم التقنية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleSeries.map((series) => (
              <Link
                key={series.id}
                to={`/series/${series.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={series.image}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="bg-emerald-500 text-sm px-3 py-1 rounded-full">
                      {series.lessons.length} دروس
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {series.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{series.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {series.lessons.filter(l => l.completed).length} / {series.lessons.length} مكتمل
                    </span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      ابدأ الآن
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
