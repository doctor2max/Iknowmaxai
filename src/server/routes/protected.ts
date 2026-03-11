import { Router } from 'express';
import db from '../../lib/db.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = Router();

router.post('/progress/:lessonId', authenticate, (req: any, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO user_progress (user_id, lesson_id) VALUES (?, ?)').run(req.user.id, req.params.lessonId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

router.post('/comments/:lessonId', authenticate, (req: any, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  db.prepare('INSERT INTO comments (user_id, lesson_id, content) VALUES (?, ?, ?)').run(req.user.id, req.params.lessonId, content);
  res.json({ success: true });
});

export default router;
