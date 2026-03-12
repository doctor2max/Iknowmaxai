import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";

const db = new Database("academy.db");

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );

  CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER,
    title TEXT,
    slug TEXT UNIQUE,
    youtube_id TEXT,
    markdown_summary TEXT,
    python_code TEXT,
    custom_html TEXT,
    download_url TEXT,
    order_index INTEGER,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default settings if they don't exist
const defaultSettings = [
  { key: 'academy_title', value: 'أكاديمية بايثون' },
  { key: 'social_facebook', value: '' },
  { key: 'social_twitter', value: '' },
  { key: 'social_youtube', value: '' },
  { key: 'social_github', value: '' },
  { key: 'contact_email', value: '' },
  { key: 'home_image_url', value: 'https://picsum.photos/seed/academy/1200/600' }
];

const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
for (const setting of defaultSettings) {
  insertSetting.run(setting.key, setting.value);
}

// Create default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("admin", hash);
}

// Fix empty slugs
const lessonsWithEmptySlug = db.prepare("SELECT id, title FROM lessons WHERE slug IS NULL OR slug = ''").all() as {id: number, title: string}[];
for (const l of lessonsWithEmptySlug) {
  const newSlug = l.title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4) + '-' + l.id;
  db.prepare("UPDATE lessons SET slug = ? WHERE id = ?").run(newSlug, l.id);
}

// Create default series and lesson if empty
const seriesCount = db.prepare("SELECT COUNT(*) as count FROM series").get() as { count: number };
if (seriesCount.count === 0) {
  const insertSeries = db.prepare("INSERT INTO series (title, description, order_index) VALUES (?, ?, ?)");
  const info = insertSeries.run("مقدمة في بايثون", "دورة شاملة لتعلم أساسيات لغة بايثون", 1);
  const seriesId = info.lastInsertRowid;

  const insertLesson = db.prepare(`
    INSERT INTO lessons (series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLesson.run(
    seriesId,
    "الدرس الأول: المتغيرات",
    "lesson-1-variables",
    "kqtD5dpn9C8",
    "في هذا الدرس سنتعلم عن المتغيرات في بايثون وكيفية استخدامها.",
    "name = 'أحمد'\\nprint(f'مرحباً {name}')",
    "<div style='padding: 20px; background: #f0f0f0; border-radius: 8px; text-align: center;'><h3>مثال تفاعلي</h3><button onclick='alert(\"مرحباً بك في الأكاديمية!\")'>اضغط هنا</button></div>",
    "https://example.com/download",
    1
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  const apiRouter = express.Router();

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  apiRouter.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

    if (user && bcrypt.compareSync(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  apiRouter.post("/logout", (req, res) => {
    res.json({ success: true });
  });

  apiRouter.get("/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  apiRouter.post("/change-password", authenticateToken, (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;

    if (user && bcrypt.compareSync(currentPassword, user.password_hash)) {
      const hash = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, req.user.id);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid current password" });
    }
  });

  // Public Routes
  apiRouter.get("/series", (req, res) => {
    const series = db.prepare("SELECT * FROM series ORDER BY order_index ASC").all();
    const lessons = db.prepare("SELECT id, series_id, title, slug, order_index FROM lessons ORDER BY order_index ASC").all();
    
    const result = series.map((s: any) => ({
      ...s,
      lessons: lessons.filter((l: any) => l.series_id === s.id)
    }));
    
    res.json(result);
  });

  apiRouter.get("/lessons/:slug", (req, res) => {
    const lesson = db.prepare("SELECT * FROM lessons WHERE slug = ?").get(req.params.slug);
    if (lesson) {
      res.json(lesson);
    } else {
      res.status(404).json({ error: "Lesson not found" });
    }
  });

  apiRouter.get("/sandbox/:slug", (req, res) => {
    const lesson = db.prepare("SELECT custom_html FROM lessons WHERE slug = ?").get(req.params.slug) as any;
    if (lesson && lesson.custom_html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(lesson.custom_html);
    } else {
      res.status(404).send("Not found");
    }
  });

  apiRouter.get("/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as {key: string, value: string}[];
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json(settingsObj);
  });

  // Admin Routes (Protected)
  apiRouter.get("/admin/series", authenticateToken, (req, res) => {
    const series = db.prepare("SELECT * FROM series ORDER BY order_index ASC").all();
    res.json(series);
  });

  apiRouter.post("/admin/series", authenticateToken, (req, res) => {
    const { title, description, order_index } = req.body;
    const info = db.prepare("INSERT INTO series (title, description, order_index) VALUES (?, ?, ?)").run(title, description, order_index);
    res.json({ id: info.lastInsertRowid });
  });

  apiRouter.put("/admin/series/:id", authenticateToken, (req, res) => {
    const { title, description, order_index } = req.body;
    db.prepare("UPDATE series SET title = ?, description = ?, order_index = ? WHERE id = ?").run(title, description, order_index, req.params.id);
    res.json({ success: true });
  });

  apiRouter.delete("/admin/series/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM series WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  apiRouter.get("/admin/lessons", authenticateToken, (req, res) => {
    const lessons = db.prepare("SELECT * FROM lessons ORDER BY order_index ASC").all();
    res.json(lessons);
  });

  apiRouter.post("/admin/lessons", authenticateToken, (req, res) => {
    const { series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO lessons (series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  apiRouter.put("/admin/lessons/:id", authenticateToken, (req, res) => {
    const { series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index } = req.body;
    try {
      db.prepare(`
        UPDATE lessons SET series_id = ?, title = ?, slug = ?, youtube_id = ?, markdown_summary = ?, python_code = ?, custom_html = ?, download_url = ?, order_index = ?
        WHERE id = ?
      `).run(series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  apiRouter.delete("/admin/lessons/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM lessons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  apiRouter.post("/admin/settings", authenticateToken, (req, res) => {
    const settings = req.body;
    const updateSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    
    db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        updateSetting.run(key, String(value));
      }
    })();
    
    res.json({ success: true });
  });

  apiRouter.post("/admin/credentials", authenticateToken, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
    }
    
    try {
      const hash = bcrypt.hashSync(password, 10);
      // We assume there's only one admin user for now, so we just update the first one
      const adminUser = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
      if (adminUser) {
        db.prepare("UPDATE users SET username = ?, password_hash = ? WHERE id = ?").run(username, hash, adminUser.id);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "لم يتم العثور على مستخدم" });
      }
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  apiRouter.post("/admin/upload", authenticateToken, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  });

  app.use("/api", apiRouter);
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
