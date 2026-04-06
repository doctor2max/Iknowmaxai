import { useState, useEffect } from 'react';
import {
  BookOpen,
  Mail,
  Image,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { academyInfo as initialInfo } from '../data/sampleData';

interface AcademyInfo {
  name: string;
  tagline: string;
  coverImage: string;
  email: string;
}

export default function AdminSettings() {
  const [info, setInfo] = useState<AcademyInfo>(() => {
    const saved = localStorage.getItem('academyInfo');
    return saved ? JSON.parse(saved) : initialInfo;
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = () => {
    // Validate
    const newErrors: { [key: string]: string } = {};

    if (!info.name.trim()) {
      newErrors.name = 'اسم الأكاديمية مطلوب';
    }
    if (!info.email.trim()) {
      newErrors.email = 'بريد التواصل مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (info.coverImage && !/^https?:\/\/.+\..+/.test(info.coverImage)) {
      newErrors.coverImage = 'رابط الصورة غير صحيح';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to localStorage
    localStorage.setItem('academyInfo', JSON.stringify(info));
    setSaved(true);
    setErrors({});

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">إعدادات الأكاديمية</h1>

      <div className="max-w-2xl">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <Check className="w-5 h-5" />
            تم حفظ التغييرات بنجاح
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Academy Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline ml-1" />
              اسم الأكاديمية
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              placeholder="أدخل اسم الأكاديمية"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار الأكاديمية (شعار قصير)
            </label>
            <input
              type="text"
              value={info.tagline}
              onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
              placeholder="مثال: تعلم التقنية بسهولة"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline ml-1" />
              بريد التواصل
            </label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              placeholder="contact@example.com"
              dir="ltr"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline ml-1" />
              رابط صورة الغلاف الرئيسية
            </label>
            <input
              type="url"
              value={info.coverImage}
              onChange={(e) => setInfo({ ...info, coverImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.coverImage ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.coverImage && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.coverImage}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {info.coverImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معاينة صورة الغلاف
              </label>
              <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={info.coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              حفظ التغييرات
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">ملاحظة</h3>
          <p className="text-sm text-blue-700">
            يتم حفظ الإعدادات في المتصفح المحلي. إذا أردت الاحتفاظ بالإعدادات بشكل دائم،
            يجب ربط الموقع بقاعدة بيانات.
          </p>
        </div>
      </div>
    </div>
  );
}
