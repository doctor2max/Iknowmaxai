import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Edit2, Trash2, Save, X, BookOpen, Layers, Settings, Upload } from "lucide-react";
import { cn } from "../lib/utils";

type Series = { id: number; title: string; description: string; order_index: number };
type Lesson = { id: number; series_id: number; title: string; slug: string; youtube_id: string; markdown_summary: string; python_code: string; custom_html: string; download_url: string; order_index: number };

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"series" | "lessons" | "settings">("series");
  const [series, setSeries] = useState<Series[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [editingSeries, setEditingSeries] = useState<Partial<Series> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [seriesRes, lessonsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/series", { headers }),
        fetch("/api/admin/lessons", { headers }),
        fetch(`/api/settings?t=${Date.now()}`)
      ]);

      if (seriesRes.status === 401 || seriesRes.status === 403) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
        return;
      }

      setSeries(await seriesRes.json());
      setLessons(await lessonsRes.json());
      setSettings(await settingsRes.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("تم حفظ الإعدادات بنجاح");
        fetchData();
      } else {
        alert("حدث خطأ أثناء حفظ الإعدادات");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setSettings({ ...settings, home_image_url: data.url });
        alert("تم رفع الصورة بنجاح. لا تنسَ الضغط على حفظ الإعدادات.");
      } else {
        alert("فشل رفع الصورة");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  const saveCredentials = async () => {
    if (!credentials.username || !credentials.password) {
      alert("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        alert("تم تحديث بيانات الدخول بنجاح. يرجى تسجيل الدخول مرة أخرى.");
        handleLogout();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ أثناء التحديث");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const saveSeries = async () => {
    if (!editingSeries) return;
    const token = localStorage.getItem("admin_token");
    const method = editingSeries.id ? "PUT" : "POST";
    const url = editingSeries.id ? `/api/admin/series/${editingSeries.id}` : "/api/admin/series";
    
    await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingSeries)
    });
    setEditingSeries(null);
    fetchData();
  };

  const deleteSeries = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه السلسلة؟ سيتم حذف جميع الدروس المرتبطة بها.")) return;
    const token = localStorage.getItem("admin_token");
    await fetch(`/api/admin/series/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchData();
  };

  const saveLesson = async () => {
    if (!editingLesson) return;
    
    // Auto-generate slug if empty
    const lessonToSave = { ...editingLesson };
    if (!lessonToSave.slug && lessonToSave.title) {
      lessonToSave.slug = lessonToSave.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    const token = localStorage.getItem("admin_token");
    const method = lessonToSave.id ? "PUT" : "POST";
    const url = lessonToSave.id ? `/api/admin/lessons/${lessonToSave.id}` : "/api/admin/lessons";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(lessonToSave)
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "حدث خطأ أثناء الحفظ");
        return;
      }
      
      setEditingLesson(null);
      fetchData();
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    const token = localStorage.getItem("admin_token");
    await fetch(`/api/admin/lessons/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              معاينة الموقع
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("series")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                activeTab === "series" 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Layers className={cn("w-5 h-5", activeTab === "series" ? "text-indigo-600" : "text-slate-400")} />
              إدارة السلاسل
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                activeTab === "lessons" 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <BookOpen className={cn("w-5 h-5", activeTab === "lessons" ? "text-indigo-600" : "text-slate-400")} />
              إدارة الدروس
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                activeTab === "settings" 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Settings className={cn("w-5 h-5", activeTab === "settings" ? "text-indigo-600" : "text-slate-400")} />
              إعدادات الأكاديمية
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === "series" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">السلاسل التعليمية</h2>
                <button
                  onClick={() => setEditingSeries({ title: "", description: "", order_index: series.length + 1 })}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة سلسلة
                </button>
              </div>

              {editingSeries && (
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                  <h3 className="text-md font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                    {editingSeries.id ? "تعديل السلسلة" : "سلسلة جديدة"}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                      <input
                        type="text"
                        value={editingSeries.title || ""}
                        onChange={(e) => setEditingSeries({ ...editingSeries, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                      <textarea
                        value={editingSeries.description || ""}
                        onChange={(e) => setEditingSeries({ ...editingSeries, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">الترتيب</label>
                      <input
                        type="number"
                        value={editingSeries.order_index || 0}
                        onChange={(e) => setEditingSeries({ ...editingSeries, order_index: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setEditingSeries(null)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveSeries}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">الترتيب</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">العنوان</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">الوصف</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {series.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-500">{s.order_index}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{s.title}</td>
                        <td className="py-3 px-4 text-sm text-slate-500 truncate max-w-xs">{s.description}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingSeries(s)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSeries(s.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {series.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-slate-500">لا توجد سلاسل حالياً</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">الدروس</h2>
                <button
                  onClick={() => setEditingLesson({ 
                    series_id: series[0]?.id || 0, 
                    title: "", slug: "", youtube_id: "", markdown_summary: "", 
                    python_code: "", custom_html: "", download_url: "", 
                    order_index: lessons.length + 1 
                  })}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة درس
                </button>
              </div>

              {editingLesson && (
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                  <h3 className="text-md font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex justify-between items-center">
                    <span>{editingLesson.id ? "تعديل الدرس" : "درس جديد"}</span>
                    <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">السلسلة</label>
                        <select
                          value={editingLesson.series_id || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, series_id: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="" disabled>اختر سلسلة</option>
                          {series.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                        <input
                          type="text"
                          value={editingLesson.title || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الرابط (Slug)</label>
                        <input
                          type="text"
                          value={editingLesson.slug || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="lesson-1-intro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">معرف يوتيوب (Video ID)</label>
                        <input
                          type="text"
                          value={editingLesson.youtube_id || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, youtube_id: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="مثال: 6P3lzSl78m0 أو رابط كامل https://youtu.be/6P3lzSl78m0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">رابط التحميل (اختياري)</label>
                        <input
                          type="url"
                          value={editingLesson.download_url || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, download_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الترتيب</label>
                        <input
                          type="number"
                          value={editingLesson.order_index || 0}
                          onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ملخص الدرس (Markdown)</label>
                        <textarea
                          value={editingLesson.markdown_summary || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, markdown_summary: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] font-mono text-sm"
                          dir="auto"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">كود بايثون (اختياري)</label>
                        <textarea
                          value={editingLesson.python_code || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, python_code: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] font-mono text-sm text-left"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">كود HTML/JS تفاعلي (اختياري)</label>
                        <textarea
                          value={editingLesson.custom_html || ""}
                          onChange={(e) => setEditingLesson({ ...editingLesson, custom_html: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] font-mono text-sm text-left"
                          dir="ltr"
                          placeholder="<button onclick='alert(&quot;Hi&quot;)'>Click</button>"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveLesson}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">السلسلة</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">الترتيب</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">العنوان</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600">الرابط</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {series.find(s => s.id === l.series_id)?.title || "غير معروف"}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{l.order_index}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{l.title}</td>
                        <td className="py-3 px-4 text-sm text-slate-500 font-mono" dir="ltr">{l.slug}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingLesson(l)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLesson(l.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {lessons.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-slate-500">لا توجد دروس حالياً</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">إعدادات الأكاديمية</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-md font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">الإعدادات العامة</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">اسم الأكاديمية</label>
                        <input
                          type="text"
                          value={settings.academy_title || ""}
                          onChange={(e) => setSettings({ ...settings, academy_title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني للتواصل</label>
                        <input
                          type="email"
                          value={settings.contact_email || ""}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">رابط صورة الصفحة الرئيسية</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="url"
                            value={settings.home_image_url || ""}
                            onChange={(e) => setSettings({ ...settings, home_image_url: e.target.value })}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                            dir="ltr"
                            placeholder="https://example.com/image.jpg"
                          />
                          <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-300 whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            {uploading ? "جاري الرفع..." : "رفع من الجهاز"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                        {settings.home_image_url && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-white">
                            <p className="text-[10px] text-slate-400 p-1 bg-slate-50 border-b border-slate-100">معاينة الصورة:</p>
                            <img 
                              src={settings.home_image_url} 
                              alt="Preview" 
                              className="w-full h-32 object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.src = "https://placehold.co/600x300?text=Invalid+Image+URL")}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-md font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">روابط التواصل الاجتماعي</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">فيسبوك</label>
                        <input
                          type="url"
                          value={settings.social_facebook || ""}
                          onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">تويتر / X</label>
                        <input
                          type="url"
                          value={settings.social_twitter || ""}
                          onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">يوتيوب</label>
                        <input
                          type="url"
                          value={settings.social_youtube || ""}
                          onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">جيت هب (GitHub)</label>
                        <input
                          type="url"
                          value={settings.social_github || ""}
                          onChange={(e) => setSettings({ ...settings, social_github: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    حفظ الإعدادات
                  </button>
                </div>

                {/* Admin Credentials */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-md font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">تغيير بيانات الدخول</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      قم بتغيير اسم المستخدم وكلمة المرور الخاصة بمدير النظام. سيتم تسجيل خروجك بعد التغيير.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم الجديد</label>
                        <input
                          type="text"
                          value={credentials.username}
                          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          value={credentials.password}
                          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
                          dir="ltr"
                        />
                      </div>
                      <button
                        onClick={saveCredentials}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm mt-4"
                      >
                        <Save className="w-4 h-4" />
                        تحديث بيانات الدخول
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
