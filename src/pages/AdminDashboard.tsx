import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Award,
  Eye,
  TrendingUp,
  Plus,
  Trash2,
  Settings,
  FileText
} from 'lucide-react';
import { academyInfo, sampleSeries } from '../data/sampleData';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: academyInfo.stats.students,
    lessons: academyInfo.stats.lessons,
    completedLessons: academyInfo.stats.completedLessons,
    mostViewed: academyInfo.stats.mostViewed
  });

  // Calculate actual stats from data
  useEffect(() => {
    const totalLessons = sampleSeries.reduce((acc, s) => acc + s.lessons.length, 0);
    setStats(prev => ({
      ...prev,
      lessons: totalLessons
    }));
  }, []);

  const handleDeleteSeries = (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف "${title}"؟`)) {
      alert('تم الحذف (تجريبي - سيتم الحذف من قاعدة البيانات في الإنتاج)');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.students.toLocaleString()}</div>
          <div className="text-gray-500 mt-1">إجمالي الطلاب</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.lessons}</div>
          <div className="text-gray-500 mt-1">إجمالي الدروس</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.completedLessons.toLocaleString()}</div>
          <div className="text-gray-500 mt-1">الدروس المكتملة</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 truncate">{stats.mostViewed}</div>
          <div className="text-gray-500 mt-1">الأكثر مشاهدة</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/series"
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="font-semibold">إضافة سلسلة جديدة</div>
            <div className="text-sm opacity-80">إنشاء دورة تعليمية</div>
          </div>
        </Link>

        <Link
          to="/admin/lessons"
          className="bg-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">إدارة الدروس</div>
            <div className="text-sm text-gray-500">تعديل أو حذف الدروس</div>
          </div>
        </Link>

        <Link
          to="/admin/settings"
          className="bg-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">الإعدادات</div>
            <div className="text-sm text-gray-500">تخصيص الموقع</div>
          </div>
        </Link>
      </div>

      {/* Series Management */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">الدورات الحالية</h2>
          <Link
            to="/admin/series"
            className="text-emerald-600 hover:underline text-sm font-medium"
          >
            عرض الكل +
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الصورة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">العنوان</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">عدد الدروس</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">المكتملة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleSeries.map((series) => (
                <tr key={series.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={series.image}
                      alt={series.title}
                      className="w-16 h-10 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{series.title}</div>
                    <div className="text-sm text-gray-500">{series.description}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{series.lessons.length}</td>
                  <td className="px-6 py-4 text-emerald-600">
                    {series.lessons.filter(l => l.completed).length}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/series/${series.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/admin/lessons"
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="إدارة الدروس"
                      >
                        <FileText className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteSeries(series.id, series.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">إعدادات سريعة</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/settings"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">تغيير اسم الأكاديمية</div>
              <div className="text-sm text-gray-500">"{academyInfo.name}"</div>
            </div>
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">الإعدادات العامة</div>
              <div className="text-sm text-gray-500">تخصيص الموقع</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
