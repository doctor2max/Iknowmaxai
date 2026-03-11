import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import db from '../../lib/db.ts';
import { authenticate, isAdmin } from '../middlewares/auth.ts';

const router = Router();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'academy-uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

const upload = multer({ storage });

router.use(authenticate, isAdmin);

router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  const lessonCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as any;
  const progressCount = db.prepare('SELECT COUNT(*) as count FROM user_progress').get() as any;
  
  const popularLessons = db.prepare(`
    SELECT l.title, COUNT(up.user_id) as completions
    FROM lessons l
    LEFT JOIN user_progress up ON l.id = up.lesson_id
    GROUP BY l.id
    ORDER BY completions DESC
    LIMIT 5
  `).all();

  res.json({
    users: userCount.count,
    lessons: lessonCount.count,
    totalCompletions: progressCount.count,
    popularLessons
  });
});

router.post('/upload', upload.single('image'), (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: (req.file as any).path });
});

router.post('/series', (req, res) => {
  try {
    const { title, description = null, order_index = 0 } = req.body;
    const result = db.prepare('INSERT INTO series (title, description, order_index) VALUES (?, ?, ?)').run(title, description, order_index);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/series/:id', (req, res) => {
  try {
    const { title, description = null, order_index = 0 } = req.body;
    db.prepare('UPDATE series SET title = ?, description = ?, order_index = ? WHERE id = ?').run(title, description, order_index, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/series/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM series WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/lessons', (req, res) => {
  try {
    const { series_id, title, slug, youtube_id = null, markdown_summary = null, python_code = null, custom_html = null, download_url = null, order_index = 0 } = req.body;
    const result = db.prepare(`
      INSERT INTO lessons (series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/lessons/:id', (req, res) => {
  try {
    const { series_id, title, slug, youtube_id = null, markdown_summary = null, python_code = null, custom_html = null, download_url = null, order_index = 0 } = req.body;
    db.prepare(`
      UPDATE lessons SET series_id = ?, title = ?, slug = ?, youtube_id = ?, markdown_summary = ?, python_code = ?, custom_html = ?, download_url = ?, order_index = ?
      WHERE id = ?
    `).run(series_id, title, slug, youtube_id, markdown_summary, python_code, custom_html, download_url, order_index, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/lessons/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/settings', (req, res) => {
  try {
    const settings = req.body;
    const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        insertSetting.run(key, value as string);
      }
    });
    
    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
