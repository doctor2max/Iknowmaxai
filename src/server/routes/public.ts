import { Router } from 'express';
import db from '../../lib/db.ts';

const router = Router();

router.get('/series', (req, res) => {
  const series = db.prepare('SELECT * FROM series ORDER BY order_index ASC').all();
  const lessons = db.prepare('SELECT id, series_id, title, slug, order_index FROM lessons ORDER BY order_index ASC').all();
  
  const result = series.map((s: any) => ({
    ...s,
    lessons: lessons.filter((l: any) => l.series_id === s.id)
  }));
  
  res.json(result);
});

router.get('/lessons/latest', (req, res) => {
  const lessons = db.prepare(`
    SELECT l.*, s.title as series_title 
    FROM lessons l 
    JOIN series s ON l.series_id = s.id 
    ORDER BY l.id DESC 
    LIMIT 4
  `).all();
  res.json(lessons);
});

router.get('/lessons/:slug', (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE slug = ?').get(req.params.slug);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json(lesson);
});

router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all() as any[];
  const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  res.json(settings);
});

router.get('/search', (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.json([]);
  
  const results = db.prepare(`
    SELECT id, title, slug, 'lesson' as type FROM lessons 
    WHERE title LIKE ? OR markdown_summary LIKE ?
    UNION
    SELECT id, title, NULL as slug, 'series' as type FROM series
    WHERE title LIKE ? OR description LIKE ?
  `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
  
  res.json(results);
});

router.get('/comments/:lessonId', (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.lesson_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.lessonId);
  res.json(comments);
});

router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  const lessonCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as any;
  const progressCount = db.prepare('SELECT COUNT(*) as count FROM user_progress').get() as any;
  
  res.json({
    users: userCount.count,
    lessons: lessonCount.count,
    totalCompletions: progressCount.count
  });
});

export default router;
