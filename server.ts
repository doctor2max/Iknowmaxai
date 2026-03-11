import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { initDb } from './src/lib/db.ts';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/server/routes/auth.ts';
import publicRoutes from './src/server/routes/public.ts';
import protectedRoutes from './src/server/routes/protected.ts';
import adminRoutes from './src/server/routes/admin.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  initDb();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', protectedRoutes);
  app.use('/api/admin', adminRoutes);

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
