import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'academy.db');
const db = new Database(dbPath);

// Initialize Schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      youtube_id TEXT,
      markdown_summary TEXT,
      python_code TEXT,
      custom_html TEXT,
      download_url TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- New Tables for Progress and Comments
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );
  `);

  // Default Admin if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    // Note: Password should be changed on first login or via dashboard
    // Default: admin / admin123 (hashed)
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  }

  // Default Settings
  const settings = [
    ['academy_title', 'أكاديمية البرمجة'],
    ['home_image_url', 'https://picsum.photos/seed/programming/1200/600'],
    ['contact_email', 'admin@example.com']
  ];
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  settings.forEach(s => insertSetting.run(s[0], s[1]));

  // Seed Data for Series and Lessons
  const seriesCount = db.prepare('SELECT COUNT(*) as count FROM series').get() as any;
  if (seriesCount.count === 0) {
    const insertSeries = db.prepare('INSERT INTO series (title, description, order_index) VALUES (?, ?, ?)');
    const insertLesson = db.prepare('INSERT INTO lessons (series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    // Series 1: Python Basics
    const s1 = insertSeries.run('أساسيات بايثون', 'تعلم لغة بايثون من الصفر حتى الاحتراف', 0);
    insertLesson.run(s1.lastInsertRowid, 'مقدمة في بايثون', 'python-intro', 'kqtD5dpn9C8', '# مقدمة في بايثون\nبايثون هي لغة برمجة قوية وسهلة التعلم.', 'print("Hello World!")', '', 0);
    insertLesson.run(s1.lastInsertRowid, 'المتغيرات وأنواع البيانات', 'python-variables', 'kqtD5dpn9C8', '# المتغيرات\nكيفية تعريف المتغيرات في بايثون.', 'name = "Ali"\nage = 25\nprint(name, age)', '', 1);

    // Series 2: Web Development
    const s2 = insertSeries.run('تطوير الويب', 'أساسيات بناء مواقع الويب باستخدام HTML و CSS', 1);
    insertLesson.run(s2.lastInsertRowid, 'مقدمة في HTML', 'html-intro', 'qz0aGYrrlhU', '# مقدمة في HTML\nلغة بناء هيكل صفحات الويب.', '', '<h1>مرحبا بك في تطوير الويب</h1>\n<p>هذا نص تجريبي.</p>', 0);
  }
}

export default db;
