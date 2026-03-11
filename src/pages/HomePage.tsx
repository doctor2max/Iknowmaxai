import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BookOpen, Users, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [settings, setSettings] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [latestLessons, setLatestLessons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/stats').then(res => res.ok ? res.json() : {}).then(setStats);
    fetch('/api/lessons/latest').then(res => res.ok ? res.json() : []).then(setLatestLessons);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Helmet>
        <title>{settings.academy_title || 'Academy'} - الرئيسية</title>
        <meta name="description" content="منصة تعليمية متطورة لتعلم البرمجة والتقنية" />
      </Helmet>

      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] mb-12 shadow-2xl group">
        <img 
          src={settings.home_image_url || 'https://picsum.photos/seed/academy/1200/600'} 
          alt="Academy Hero" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
            {settings.academy_title || 'أكاديمية المستقبل'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mb-8 leading-relaxed">
            ابدأ رحلتك في تعلم البرمجة والتقنية مع أفضل الدورات التعليمية المصممة بعناية لتناسب احتياجاتك.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="px-8 py-4 bg-white text-neutral-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl active:scale-95">
              ابدأ التعلم الآن <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
            <BookOpen size={24} />
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.lessons || '10+'}</div>
          <div className="text-neutral-500 font-medium">درس تعليمي</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
            <Users size={24} />
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.users || '100+'}</div>
          <div className="text-neutral-500 font-medium">طالب مسجل</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
            <Play size={24} />
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.totalCompletions || '500+'}</div>
          <div className="text-neutral-500 font-medium">إنجاز مكتمل</div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-neutral-900 rounded-full" />
          أحدث الدروس
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {latestLessons.length > 0 ? latestLessons.map((lesson: any) => (
            <Link to={`/lesson/${lesson.slug}`} key={lesson.id} className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all block">
              <div className="aspect-video bg-neutral-100 relative">
                <img src={`https://picsum.photos/seed/lesson${lesson.id}/600/400`} alt={lesson.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
              <div className="p-6">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-2 tracking-wider">{lesson.series_title}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Play size={14} /> ابدأ الدرس
                  </div>
                  <button className="p-3 bg-neutral-100 rounded-xl text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </Link>
          )) : (
            <div className="col-span-2 text-center py-12 text-neutral-500">لا توجد دروس متاحة حالياً.</div>
          )}
        </div>
      </section>
    </div>
  );
}
