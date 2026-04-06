import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Image,
  Video
} from 'lucide-react';
import { sampleSeries, Series } from '../data/sampleData';

export default function AdminSeries() {
  const [series, setSeries] = useState<Series[]>(sampleSeries);
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });

  const handleSubmit = () => {
    if (editingSeries) {
      // Update existing
      setSeries(prev =>
        prev.map(s =>
          s.id === editingSeries.id
            ? { ...s, ...formData }
            : s
        )
      );
    } else {
      // Add new
      const newSeries: Series = {
        id: `series-${Date.now()}`,
        ...formData,
        lessons: []
      };
      setSeries(prev => [...prev, newSeries]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه السلسلة؟')) {
      setSeries(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEdit = (item: Series) => {
    setEditingSeries(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSeries(null);
    setFormData({ title: '', description: '', image: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الدورات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة دورة جديدة
        </button>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-40">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                {item.lessons.length} دروس
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.description}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSeries ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الدورة
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: دورة بايثون للمبتدئين"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للدورة..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.description}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSeries ? 'حفظ التغييرات' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
