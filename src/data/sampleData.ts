export interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  code: string;
  sandboxCode: string;
  completed: boolean;
  hasAttachments: boolean;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  image: string;
  lessons: Lesson[];
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  date: string;
}

export const sampleSeries: Series[] = [
  {
    id: 'python-basics',
    title: 'دورة بايثون للمبتدئين',
    description: 'تعلم أساسيات لغة بايثون من الصفر',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    lessons: [
      {
        id: 'py-intro',
        title: 'المقدمة والتثبيت',
        youtubeId: 'kqtD5dpn9C8',
        description: `# مرحباً بك في دورة بايثون

في هذا الدرس ستتعلم:
- ما هي لغة بايثون
- كيفية تثبيت بايثون على جهازك
- إعداد بيئة التطوير

## ما هي بايثون؟

بايثون هي لغة برمجة عالية المستوى، سهلة التعلم، ومجانية. تستخدم في:
- تطوير الويب
- الذكاء الاصطناعي
- تحليل البيانات
- الأتمتة

## خطوات التثبيت

1. قم بتحميل بايثون من python.org
2. شغّل برنامج التثبيت
3. تأكد من إضافة بايثون لـ PATH`,
        code: `print("مرحباً بالعالم!")
name = input("ما اسمك؟ ")
print(f"أهلاً {name}")`,
        sandboxCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f0f0f0;
        }
        .card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 { color: #10b981; }
        .btn {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn:hover { background: #059669; }
    </style>
</head>
<body>
    <div class="card">
        <h1>مرحباً بك في بايثون!</h1>
        <p>هذه بيئة تجربة تفاعلية</p>
        <button class="btn" onclick="sayHello()">اضغط هنا</button>
    </div>
    <script>
        function sayHello() {
            alert("مرحباً! أنت جاهز لتعلم بايثون");
        }
    </script>
</body>
</html>`,
        completed: false,
        hasAttachments: true
      },
      {
        id: 'py-variables',
        title: 'المتغيرات وأنواع البيانات',
        youtubeId: 'JJmcL1N2KAo',
        description: `# المتغيرات وأنواع البيانات

المتغير هو حاوية لتخزين البيانات.

## أنواع البيانات الأساسية:

### 1. الأرقام (Numbers)
\`\`\`python
age = 25
price = 19.99
\`\`\`

### 2. النصوص (Strings)
\`\`\`python
name = "أحمد"
message = 'مرحباً'
\`\`\`

### 3. القوائم (Lists)
\`\`\`python
fruits = ["تفاح", "موز", "برتقالة"]
\`\`\``,
        code: `# أمثلة على المتغيرات
name = "أحمد"
age = 25
height = 1.75
is_student = True
skills = ["بايثون", "جافا", "جافاسكريبت"]

print(f"الاسم: {name}")
print(f"العمر: {age}")
print(f"المهارات: {skills}")`,
        sandboxCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 15px;
        }
        .label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
        }
        .value {
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="label">الاسم</div>
            <div class="value">أحمد</div>
        </div>
        <div class="card">
            <div class="label">العمر</div>
            <div class="value">25 سنة</div>
        </div>
        <div class="card">
            <div class="label">المهارات</div>
            <div class="value">بايثون، جافا، جافاسكريبت</div>
        </div>
    </div>
</body>
</html>`,
        completed: false,
        hasAttachments: false
      },
      {
        id: 'py-conditions',
        title: 'الجمل الشرطية',
        youtubeId: 'DZwmZ8Usvnk',
        description: `# الجمل الشرطية

تستخدم الجمل الشرطية لاتخاذ قرارات في البرنامج.

## if / elif / else

\`\`\`python
age = 18

if age < 13:
    print("طفل")
elif age < 20:
    print("مراهق")
else:
    print("بالغ")
\`\`\``,
        code: `grade = 85

if grade >= 90:
    print("ممتاز")
elif grade >= 80:
    print("جيد جداً")
elif grade >= 70:
    print("جيد")
elif grade >= 60:
    print("مقبول")
else:
    print("راسب")`,
        sandboxCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f0f0f0;
        }
        .calculator {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 18px;
            margin-bottom: 15px;
            box-sizing: border-box;
        }
        button {
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover { background: #059669; }
        .result {
            margin-top: 20px;
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h2>حاسبة الدرجات</h2>
        <input type="number" id="gradeInput" placeholder="أدخل الدرجة (0-100)" min="0" max="100">
        <button onclick="checkGrade()">تحقق من الدرجة</button>
        <div class="result" id="result"></div>
    </div>
    <script>
        function checkGrade() {
            const grade = parseInt(document.getElementById('gradeInput').value);
            let result = '';
            if (grade >= 90) result = 'ممتاز!';
            else if (grade >= 80) result = 'جيد جداً';
            else if (grade >= 70) result = 'جيد';
            else if (grade >= 60) result = 'مقبول';
            else result = 'راسب';
            document.getElementById('result').textContent = result;
        }
    </script>
</body>
</html>`,
        completed: false,
        hasAttachments: true
      }
    ]
  },
  {
    id: 'web-development',
    title: 'تطوير الويب',
    description: 'تعلم HTML, CSS, JavaScript',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    lessons: [
      {
        id: 'html-intro',
        title: 'مقدمة في HTML',
        youtubeId: 'qz0aGYrrlhU',
        description: `# ما هو HTML؟

HTML هي لغة ترميز لإنشاء صفحات الويب.

## الهيكل الأساسي:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>صفحتي</title>
</head>
<body>
    <h1>مرحباً</h1>
</body>
</html>
\`\`\``,
        code: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>صفحتي الأولى</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            padding: 20px;
        }
        h1 { color: #2c3e50; }
    </style>
</head>
<body>
    <h1>مرحباً بالعالم!</h1>
    <p>هذه صفحتي الأولى</p>
</body>
</html>`,
        sandboxCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>صفحتي الأولى</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        h1 { color: #667eea; margin-bottom: 10px; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎉 مرحباً!</h1>
        <p>هذه صفحتي الأولى باستخدام HTML و CSS</p>
    </div>
</body>
</html>`,
        completed: false,
        hasAttachments: false
      },
      {
        id: 'css-basics',
        title: 'أساسيات CSS',
        youtubeId: '1PnVor36_40',
        description: `# CSS - تنسيق صفحات الويب

CSS تسمح بتنسيق مظهر صفحات HTML.

## المحددات (Selectors):

\`\`\`css
/* تحديد العنصر */
p { color: blue; }

/* تحديد الكلاس */
.highlight { background: yellow; }

/* تحديد المعرف */
#header { height: 80px; }
\`\`\``,
        code: `<!DOCTYPE html>
<html>
<head>
    <style>
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px;
        }
        .card h2 { color: #10b981; }
        .btn {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>بطاقة جميلة</h2>
        <p>هذا نص داخل بطاقة منسقة بـ CSS</p>
        <button class="btn">اضغط هنا</button>
    </div>
</body>
</html>`,
        sandboxCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background: #f0f0f0; padding: 20px; }
        .card {
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card h2 { color: #10b981; text-align: center; }
        .btn {
            width: 100%;
            padding: 15px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 15px;
        }
        .btn:hover { background: #059669; }
        .btn-secondary {
            background: #6b7280;
        }
        .btn-secondary:hover { background: #4b5563; }
    </style>
</head>
<body>
    <div class="card">
        <h2>🌟 بطاقة تفاعلية</h2>
        <p style="color:#666;text-align:center;">هذه بطاقة منسقة بـ CSS</p>
        <button class="btn" onclick="alert('مرحباً!')">زر أساسي</button>
        <button class="btn btn-secondary">زر ثانوي</button>
    </div>
</body>
</html>`,
        completed: false,
        hasAttachments: false
      }
    ]
  },
  {
    id: 'javascript-advanced',
    title: 'جافاسكريبت متقدم',
    description: 'تقنيات متقدمة في JavaScript',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    lessons: [
      {
        id: 'js-async',
        title: 'البرمجة غير المتزامنة',
        youtubeId: 'PoRJizFvM7s',
        description: `# Promises و Async/Await

البرمجة غير المتزامنة تسمح بالتعامل مع العمليات التي تستغرق وقتاً.

## Promise:

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("تم!"), 1000);
});
\`\`\`

## Async/Await:

\`\`\`javascript
async function fetchData() {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
\`\`\``,
        code: `// مثال على Async/Await
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchUserData() {
    console.log("جاري التحميل...");

    await delay(1000);
    const user = { name: "أحمد", age: 25 };

    await delay(500);
    console.log("تم تحميل البيانات:", user);

    return user;
}

fetchUserData();`,
        sandboxCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f0f0f0;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            min-width: 300px;
        }
        .spinner {
            border: 4px solid #e5e7eb;
            border-top: 4px solid #10b981;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .hidden { display: none; }
        .result {
            background: #d1fae5;
            color: #065f46;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        button {
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 15px;
        }
        button:hover { background: #059669; }
    </style>
</head>
<body>
    <div class="card">
        <div id="loading">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
        </div>
        <div id="content" class="hidden">
            <h2>✓ تم!</h2>
            <p>تم تحميل البيانات بنجاح</p>
            <div class="result" id="result"></div>
        </div>
        <button onclick="loadData()">تحميل البيانات</button>
    </div>
    <script>
        function loadData() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const result = document.getElementById('result');

            loading.classList.remove('hidden');
            content.classList.add('hidden');

            setTimeout(() => {
                loading.classList.add('hidden');
                content.classList.remove('hidden');
                result.textContent = 'الاسم: أحمد | العمر: 25 سنة';
            }, 2000);
        }
    </script>
</body>
</html>`,
        completed: false,
        hasAttachments: true
      }
    ]
  }
];

export const sampleComments: Record<string, Comment[]> = {
  'py-intro': [
    {
      id: 'c1',
      userName: 'سارة محمد',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content: 'شرح رائع ومبسط! شكراً جزيلاً',
      date: '2024-01-15'
    },
    {
      id: 'c2',
      userName: 'خالد علي',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled',
      content: 'هل يمكن إضافة جزء عن تثبيت PyCharm؟',
      date: '2024-01-16'
    }
  ],
  'py-variables': [
    {
      id: 'c3',
      userName: 'نورة أحمد',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noura',
      content: 'الدرس واضح جداً، أتمنى المزيد من الأمثلة',
      date: '2024-01-17'
    }
  ]
};

export const academyInfo = {
  name: 'أكاديمية التقنية',
  tagline: 'تعلم التقنية بسهولة',
  coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600',
  email: 'contact@techacademy.com',
  stats: {
    students: 1250,
    lessons: 48,
    completedLessons: 3200,
    mostViewed: 'المقدمة والتثبيت'
  }
};
