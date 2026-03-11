import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Upload,
  BarChart3,
  Users as UsersIcon,
  CheckCircle,
  Search,
  Home
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'series' | 'lessons' | 'settings'>('stats');
  const [stats, setStats] = useState<any>({});
  const [series, setSeries] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({ series_id: 0, title: '', slug: '', youtube_id: '', markdown_summary: '', python_code: '', custom_html: '', download_url: '', order_index: 0 });

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [seriesForm, setSeriesForm] = useState({ title: '', description: '', order_index: 0 });

  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'series' | 'lesson', id: number} | null>(null);
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
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ts = new Date().getTime();
      if (activeTab === 'stats') {
        const res = await fetchWithAuth(`/api/admin/stats?t=${ts}`);
        setStats(await res.json());
      } else if (activeTab === 'series') {
        const res = await fetchWithAuth(`/api/series?t=${ts}`);
        setSeries(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetchWithAuth(`/api/settings?t=${ts}`);
        setSettings(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Series Handlers ---
  const openAddSeriesModal = () => {
    setEditingSeries(null);
    setSeriesForm({ title: '', description: '', order_index: series.length });
    setIsSeriesModalOpen(true);
  };

  const openEditSeriesModal = (s: any) => {
    setEditingSeries(s);
    setSeriesForm({ title: s.title, description: s.description || '', order_index: s.order_index || 0 });
    setIsSeriesModalOpen(true);
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesForm.title.trim()) {
      showToast('يرجى إدخال اسم السلسلة', 'error');
      return;
    }
    const method = editingSeries ? 'PUT' : 'POST';
    const url = editingSeries ? `/api/admin/series/${editingSeries.id}` : '/api/admin/series';
    
    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesForm)
      });
      
      if (!res.ok) {
        const err = await res.json();
        showToast('حدث خطأ: ' + (err.error || 'فشل الحفظ'), 'error');
        return;
      }
      
      setIsSeriesModalOpen(false);
      showToast('تم حفظ السلسلة بنجاح');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleDeleteSeries = (id: number) => {
    setDeleteConfirm({ type: 'series', id });
  };

  // --- Lesson Handlers ---
  const openAddLessonModal = (seriesId: number) => {
    setEditingLesson(null);
    setLessonForm({ series_id: seriesId, title: '', slug: '', youtube_id: '', markdown_summary: '', python_code: '', custom_html: '', download_url: '', order_index: 0 });
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = async (lesson: any) => {
    setEditingLesson(lesson);
    try {
      const res = await fetchWithAuth(`/api/lessons/${lesson.slug}`);
      if (res.ok) {
        const fullLesson = await res.json();
        setLessonForm({
          series_id: fullLesson.series_id || lesson.series_id,
          title: fullLesson.title || '',
          slug: fullLesson.slug || '',
          youtube_id: fullLesson.youtube_id || '',
          markdown_summary: fullLesson.markdown_summary || '',
          python_code: fullLesson.python_code || '',
          custom_html: fullLesson.custom_html || '',
          download_url: fullLesson.download_url || '',
          order_index: fullLesson.order_index || 0
        });
      } else {
        setLessonForm({ ...lesson, youtube_id: '', markdown_summary: '', python_code: '', custom_html: '', download_url: '', order_index: lesson.order_index || 0 });
      }
    } catch (err) {
      setLessonForm({ ...lesson, youtube_id: '', markdown_summary: '', python_code: '', custom_html: '', download_url: '', order_index: lesson.order_index || 0 });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      showToast('يرجى إدخال عنوان الدرس', 'error');
      return;
    }
    const method = editingLesson ? 'PUT' : 'POST';
    const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : '/api/admin/lessons';
    
    // Extract YouTube ID if a full URL was pasted
    let finalYoutubeId = lessonForm.youtube_id;
    if (finalYoutubeId) {
      const match = finalYoutubeId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        finalYoutubeId = match[1];
      }
    }

    // Auto-generate slug if empty
    const dataToSave = { ...lessonForm, youtube_id: finalYoutubeId };
    if (!dataToSave.slug) {
      const baseSlug = dataToSave.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');
      dataToSave.slug = baseSlug ? `${baseSlug}-${Date.now()}` : `lesson-${Date.now()}`;
    }

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      
      if (!res.ok) {
        const err = await res.json();
        showToast('حدث خطأ: ' + (err.error || 'فشل الحفظ'), 'error');
        return;
      }
      
      setIsLessonModalOpen(false);
      showToast('تم حفظ الدرس بنجاح');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleDeleteLesson = (id: number) => {
    setDeleteConfirm({ type: 'lesson', id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'series') {
        await fetchWithAuth(`/api/admin/series/${deleteConfirm.id}`, { method: 'DELETE' });
      } else {
        await fetchWithAuth(`/api/admin/lessons/${deleteConfirm.id}`, { method: 'DELETE' });
      }
      setDeleteConfirm(null);
      showToast('تم الحذف بنجاح');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحذف', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل الحفظ');
      }
      showToast('تم حفظ الإعدادات بنجاح');
    } catch (err: any) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ الإعدادات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetchWithAuth('/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      setSettings({ ...settings, home_image_url: data.url });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-xl transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-l border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">A</div>
            <div>
              <div className="font-bold text-neutral-900">المدير</div>
              <div className="text-xs text-neutral-400">لوحة التحكم</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-all mb-4"
          >
            <Home size={18} /> العودة للرئيسية
          </Link>
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", activeTab === 'stats' ? "bg-neutral-900 text-white shadow-lg" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <BarChart3 size={18} /> الإحصائيات
          </button>
          <button 
            onClick={() => setActiveTab('series')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", activeTab === 'series' ? "bg-neutral-900 text-white shadow-lg" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <BookOpen size={18} /> السلاسل والدروس
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", activeTab === 'settings' ? "bg-neutral-900 text-white shadow-lg" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <SettingsIcon size={18} /> الإعدادات
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'stats' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">الإحصائيات العامة</h1>
              <div className="text-sm text-neutral-400 font-medium">آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UsersIcon size={24} />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.users || 0}</div>
                <div className="text-neutral-500 font-medium">مستخدم مسجل</div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.lessons || 0}</div>
                <div className="text-neutral-500 font-medium">درس تعليمي</div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.totalCompletions || 0}</div>
                <div className="text-neutral-500 font-medium">إنجاز مكتمل</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="font-bold text-neutral-900">أكثر الدروس مشاهدة</h2>
                <BarChart3 size={18} className="text-neutral-400" />
              </div>
              <div className="divide-y divide-neutral-50">
                {stats.popularLessons?.map((l: any, i: number) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">{i + 1}</div>
                      <span className="font-medium text-neutral-900">{l.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span className="font-bold text-neutral-900">{l.completions}</span> إكمال
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'series' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">إدارة المحتوى</h1>
              <button onClick={openAddSeriesModal} className="px-6 py-3 bg-neutral-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg active:scale-95">
                <Plus size={20} /> إضافة سلسلة جديدة
              </button>
            </div>

            <div className="grid gap-6">
              {series.map(s => (
                <div key={s.id} className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{s.title}</h3>
                        <p className="text-xs text-neutral-500">{s.lessons.length} دروس</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditSeriesModal(s)} className="p-2 hover:bg-white rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteSeries(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {s.lessons.map((l: any) => (
                      <div key={l.id} className="group flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-neutral-300" />
                          <span className="text-sm font-medium text-neutral-700">{l.title}</span>
                        </div>
                        <div className="flex items-center gap-2 transition-opacity">
                          <button onClick={() => openEditLessonModal(l)} className="p-1.5 text-neutral-400 hover:text-neutral-900 bg-white rounded shadow-sm border border-neutral-200"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteLesson(l.id)} className="p-1.5 text-neutral-400 hover:text-red-500 bg-white rounded shadow-sm border border-neutral-200"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => openAddLessonModal(s.id)} className="w-full py-3 border-2 border-dashed border-neutral-100 rounded-xl text-xs font-bold text-neutral-400 hover:border-neutral-200 hover:text-neutral-600 transition-all">
                      + إضافة درس لهذه السلسلة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-10">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">إعدادات الأكاديمية</h1>
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-neutral-700">عنوان الأكاديمية</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:border-neutral-900 outline-none transition-all"
                  value={settings.academy_title || ''}
                  onChange={(e) => setSettings({ ...settings, academy_title: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-neutral-700">صورة الصفحة الرئيسية</label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-20 rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200">
                    <img src={settings.home_image_url} alt="Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-900 rounded-xl font-bold cursor-pointer hover:bg-neutral-200 transition-all">
                      <Upload size={18} /> رفع صورة جديدة
                      <input type="file" className="hidden" onChange={handleUpload} />
                    </label>
                    <p className="text-xs text-neutral-400 mt-2">يفضل استخدام صورة بأبعاد 21:9 وبجودة عالية</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-neutral-700">بريد التواصل</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:border-neutral-900 outline-none transition-all"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <button onClick={handleSaveSettings} disabled={loading} className="px-10 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 shadow-xl active:scale-95 transition-all disabled:opacity-50">
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-neutral-900">{editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}</h2>
              <button onClick={() => setIsLessonModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveLesson} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">السلسلة</label>
                <select
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none"
                  value={lessonForm.series_id}
                  onChange={e => setLessonForm({...lessonForm, series_id: Number(e.target.value)})}
                >
                  {series.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">عنوان الدرس</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none"
                  value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">الرابط (Slug) - اختياري</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none"
                  value={lessonForm.slug} onChange={e => setLessonForm({...lessonForm, slug: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">رابط يوتيوب أو المعرف (YouTube URL or ID)</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none text-left"
                  dir="ltr"
                  placeholder="https://youtu.be/..."
                  value={lessonForm.youtube_id} onChange={e => setLessonForm({...lessonForm, youtube_id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">محتوى الدرس (Markdown)</label>
                <textarea 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none min-h-[150px]"
                  value={lessonForm.markdown_summary} onChange={e => setLessonForm({...lessonForm, markdown_summary: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">كود بايثون (اختياري)</label>
                <textarea 
                  dir="ltr"
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none font-mono text-left"
                  value={lessonForm.python_code} onChange={e => setLessonForm({...lessonForm, python_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">كود HTML للتجربة (اختياري)</label>
                <textarea 
                  dir="ltr"
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none font-mono text-left"
                  value={lessonForm.custom_html} onChange={e => setLessonForm({...lessonForm, custom_html: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200">
                  إلغاء
                </button>
                <button type="submit" className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800">
                  حفظ الدرس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Series Modal */}
      {isSeriesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-neutral-900">{editingSeries ? 'تعديل السلسلة' : 'إضافة سلسلة جديدة'}</h2>
              <button onClick={() => setIsSeriesModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSeries} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">اسم السلسلة</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none"
                  value={seriesForm.title} onChange={e => setSeriesForm({...seriesForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">وصف السلسلة (اختياري)</label>
                <textarea 
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 outline-none min-h-[100px]"
                  value={seriesForm.description} onChange={e => setSeriesForm({...seriesForm, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSeriesModalOpen(false)} className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200">
                  إلغاء
                </button>
                <button type="submit" className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800">
                  حفظ السلسلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">تأكيد الحذف</h2>
            <p className="text-neutral-500">
              {deleteConfirm.type === 'series' 
                ? 'هل أنت متأكد من حذف هذه السلسلة؟ سيتم حذف جميع الدروس المرتبطة بها نهائياً.' 
                : 'هل أنت متأكد من حذف هذا الدرس نهائياً؟'}
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200">
                إلغاء
              </button>
              <button onClick={confirmDelete} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30">
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
