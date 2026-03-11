# البنية المعمارية للمشروع (Architecture)

تم تصميم هذا المشروع ليكون قابلاً للتوسع والصيانة بسهولة، معتمداً على مبادئ **فصل الاهتمامات (Separation of Concerns)** و **التجريد (Abstraction)**.

## الهيكل العام (Directory Structure)

```text
/
├── server.ts                 # نقطة الدخول الرئيسية للخادم (Express + Vite)
├── src/
│   ├── server/               # منطق الخادم (Backend)
│   │   ├── routes/           # مسارات API مقسمة حسب المجال (auth, admin, public)
│   │   ├── middlewares/      # طبقات وسيطة (Authentication, Authorization)
│   │   └── db/               # إعدادات قاعدة البيانات (SQLite)
│   ├── features/             # ميزات التطبيق (Frontend) - كل ميزة في مجلد مستقل
│   │   ├── admin/            # ميزة لوحة التحكم
│   │   ├── auth/             # ميزة المصادقة
│   │   ├── home/             # ميزة الصفحة الرئيسية
│   │   └── lesson/           # ميزة عرض الدروس
│   ├── components/           # مكونات واجهة المستخدم المشتركة (Layout, UI elements)
│   ├── lib/                  # أدوات مساعدة (Utils, API clients)
│   ├── types/                # تعريفات الأنواع (TypeScript Interfaces)
│   ├── App.tsx               # المكون الجذري للتطبيق (Routing & Context)
│   └── main.tsx              # نقطة دخول React
```

## مبادئ التصميم (Design Principles)

1. **الميزات المستقلة (Feature-Sliced Design):**
   - كل ميزة (Feature) تحتوي على مكوناتها (components)، خطافاتها (hooks)، وخدماتها (services) الخاصة بها.
   - هذا يمنع تداخل الكود ويسهل تعديل ميزة معينة دون التأثير على الباقي.

2. **الخادم المعياري (Modular Backend):**
   - تم تقسيم `server.ts` الضخم إلى مسارات (Routes) منفصلة.
   - يتم حقن قاعدة البيانات والطبقات الوسيطة (Middlewares) بشكل نظيف.

3. **سهولة التوسع (Extensibility):**
   - لإضافة ميزة جديدة في الواجهة الأمامية: قم بإنشاء مجلد جديد تحت `src/features/`.
   - لإضافة مسار API جديد: قم بإنشاء ملف جديد تحت `src/server/routes/` واربطه في `server.ts`.

## كيفية إضافة ميزات مستقبلية

1. **إضافة جدول جديد لقاعدة البيانات:**
   - قم بتحديث `src/server/db/index.ts` لإضافة استعلام `CREATE TABLE`.
2. **إضافة مسار API:**
   - أضف المسار في `src/server/routes/` واستخدم `router.get` أو `router.post`.
3. **إضافة صفحة جديدة:**
   - قم بإنشاء المكون في `src/features/` أو `src/pages/`.
   - أضف المسار في `src/App.tsx`.
