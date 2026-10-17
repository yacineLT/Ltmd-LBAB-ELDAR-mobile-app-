import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { config, validateServerConfig } from './server/config';

async function startServer(): Promise<void> {
  const app = createApp();
  const PORT = config.port;

  validateServerConfig();

  // In development, integrate Vite middleware for seamless HMR and asset serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve pre-compiled frontend assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LBAB ELDAR] Full-Stack server running on http://0.0.0.0:${PORT}`);
    console.log(`[LBAB ELDAR] API Health: http://localhost:${PORT}/api/health`);
    console.log(`[LBAB ELDAR] Payment Status: http://localhost:${PORT}/api/payments/status`);
  });
}

startServer().catch((err) => {
  console.error('[LBAB ELDAR] Failed to start server:', err);
  process.exit(1);
});
