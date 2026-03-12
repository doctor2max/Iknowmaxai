import { useOutletContext } from "react-router-dom";

export function HomePage() {
  const { settings } = useOutletContext<{ settings: Record<string, string> }>();
  
  // If settings are not yet loaded, show a simple loader or nothing
  if (!settings || Object.keys(settings).length === 0) {
    return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;
  }

  const academyTitle = settings.academy_title || "أكاديمية الكود";
  const homeImageUrl = settings.home_image_url || "https://picsum.photos/seed/academy/1200/600";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">{academyTitle}</h1>
        <p className="text-lg text-slate-600">مرحباً بك في الأكاديمية. اختر درساً من القائمة الجانبية للبدء في رحلتك التعليمية.</p>
      </div>
      
      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 min-h-[200px] flex items-center justify-center">
        <img 
          key={homeImageUrl} // Force re-render if URL changes
          src={homeImageUrl} 
          alt={academyTitle} 
          className="w-full h-auto object-cover max-h-[500px] transition-opacity duration-500"
          referrerPolicy="no-referrer"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
          style={{ opacity: 0 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">تعلم البرمجة</h3>
          <p className="text-slate-600">نقدم دروساً مبسطة وعملية لمساعدتك على إتقان لغات البرمجة المختلفة، مع التركيز بشكل خاص على لغة بايثون.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">تطبيق عملي</h3>
          <p className="text-slate-600">كل درس يتضمن كوداً برمجياً يمكنك تجربته وتعديله مباشرة في البيئة التفاعلية المدمجة.</p>
        </div>
      </div>
    </div>
  );
}
