/* Simple static server for local testing */
const express = require('express');
const path = require('path');

const app = express();
app.disable('x-powered-by');
const DEFAULT_PORT = 5183;
const PORT_MAX = 5200;
let port = Number(process.env.PORT || DEFAULT_PORT);
const root = path.resolve(__dirname, '..');

// Global basic headers for local dev (not production security hardening)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  // Help browsers avoid MIME sniffing warnings in the Issues panel
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const start = () => {
  const server = app.listen(port, () => {
    console.log(`Static site available at http://localhost:${port}`);
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
