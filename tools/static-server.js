/* Simple static server for local testing */
const express = require('express');
const path = require('path');
const explicitPort = process.env.PORT;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.disable('x-powered-by');
const DEFAULT_PORT = 5183;
const PORT_MAX = 5200;
let port = Number(explicitPort || process.env.STATIC_SERVER_PORT || DEFAULT_PORT);
const projectRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(projectRoot, 'public');
const serveProjectRoot = String(process.env.SERVE_PROJECT_ROOT || '').toLowerCase() === 'true';
const root = !serveProjectRoot && require('fs').existsSync(publicRoot) ? publicRoot : projectRoot;
const fs = require('fs');

app.use(express.json({ limit: '120kb' }));

// Global basic headers for local dev (not production security hardening)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  // Help browsers avoid MIME sniffing warnings in the Issues panel
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

function adaptServerlessHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`[static-server] API handler failed for ${req.path}`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Local API handler failed.' });
      }
    }
  };
}

const starterSubmitHandler = require('../api/starter-assessment-submit.js');
const starterResultHandler = require('../api/starter-assessment-result.js');
const starterEventHandler = require('../api/starter-assessment-event.js');

app.post('/api/starter-assessment/submit', adaptServerlessHandler(starterSubmitHandler));
app.get('/api/starter-assessment/result/:token', (req, res, next) => {
  req.query = { ...(req.query || {}), token: req.params.token };
  return adaptServerlessHandler(starterResultHandler)(req, res, next);
});
app.post('/api/starter-assessment/event', adaptServerlessHandler(starterEventHandler));

// Serve static with content-type tweaks for some assets
app.use(express.static(root, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    // Ensure correct mime types for common fonts on older environments
    if (ext === '.woff2') res.setHeader('Content-Type', 'font/woff2');
    else if (ext === '.woff') res.setHeader('Content-Type', 'font/woff');
    else if (ext === '.ttf') res.setHeader('Content-Type', 'font/ttf');
    else if (ext === '.otf') res.setHeader('Content-Type', 'font/otf');
    // Be explicit for CSS/JS
    else if (ext === '.css') res.setHeader('Content-Type', 'text/css; charset=utf-8');
    else if (ext === '.js') res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    else if (ext === '.svg') res.setHeader('Content-Type', 'image/svg+xml');
  }
}));

const publicPageAliases = {
  '/lead-magnet.html': 'lead-magnet.html',
  '/thanks-ebook.html': 'thanks-ebook.html',
  '/first-workout.html': 'first-workout.html'
};

app.get(Object.keys(publicPageAliases), (req, res) => {
  res.sendFile(path.join(projectRoot, 'pages', 'public', publicPageAliases[req.path]));
});

app.get('/go/card', (req, res) => {
  res.redirect(302, '/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment');
});

app.get('/start/result/:token', (req, res) => {
  res.sendFile(path.join(root, 'start-result.html'));
});

app.get('*', (req, res) => {
  const requestPath = decodeURIComponent(req.path).replace(/\\/g, '/');
  const basename = path.basename(requestPath);

  if (path.extname(requestPath)) {
    const rootLevelCandidate = path.join(root, basename);
    if (basename !== requestPath.replace(/^\/+/, '') && fs.existsSync(rootLevelCandidate)) {
      res.redirect(302, `/${basename}`);
      return;
    }

    res.status(404).type('text/plain').send('Not found');
    return;
  }

  const cleanPath = requestPath.replace(/^\/+|\/+$/g, '');
  if (cleanPath) {
    const htmlCandidate = path.join(root, `${cleanPath}.html`);
    if (fs.existsSync(htmlCandidate)) {
      res.sendFile(htmlCandidate);
      return;
    }

    const indexCandidate = path.join(root, cleanPath, 'index.html');
    if (fs.existsSync(indexCandidate)) {
      res.sendFile(indexCandidate);
      return;
    }
  }

  const home = path.join(root, 'index.html');
  if (fs.existsSync(home)) {
    res.sendFile(home);
    return;
  }

  if (path.extname(req.path)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }
  res.status(404).type('text/plain').send('Not found');
});

const start = () => {
  const server = app.listen(port, () => {
    console.log(`Static site available at http://localhost:${port}`);
    console.log(`Serving ${root}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (port < PORT_MAX) {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port += 1;
        start();
      } else {
        console.error(`No free port found between ${DEFAULT_PORT}-${PORT_MAX}. Set PORT env var and retry.`);
        process.exit(1);
      }
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

start();
