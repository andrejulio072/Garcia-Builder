/* Simple static server for local testing */
const express = require('express');
const path = require('path');

const app = express();
let port = Number(process.env.PORT || 5173);
const root = path.resolve(__dirname, '..');

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(express.static(root));

app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const start = () => {
  const server = app.listen(port, () => {
    console.log(`Static site available at http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (port < 5190) {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port += 1;
        start();
      } else {
        console.error('No free port found between 5173-5190. Set PORT env var and retry.');
        process.exit(1);
      }
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

start();
