require('dotenv').config();              // loads .env into process.env (local dev only)

const express = require('express');
const { randomBytes } = require('node:crypto');

const app   = express();
const PORT  = process.env.PORT || 3000;
const store = new Map();                // in-memory — fine for now

app.use(express.json());

// POST /api/shorten  { url } -> { code }
app.post('/api/shorten', (req, res) => {
  const { url } = req.body || {};
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'invalid url' });
  }
  const code = randomBytes(4).toString('base64url');
  store.set(code, url);
  res.status(201).json({ code });
});

// GET /api/r/:code -> 302 redirect or 404
//app.get('/api/r/:code', (req, res) => {
//  const url = store.get(req.params.code);
//  if (!url) return res.status(404).json({ error: 'not found' });
// res.redirect(302, url);
//});

// GET /api/r/:code -> deliberately broken to see CI fail
app.get('/api/r/:code', (req, res) => {
  res.status(500).send('oops');
});


// Health check — pipelines will hit this later
app.get('/health', (_req, res) => res.json({ ok: true }));

// Only start the server if this file is run directly.
// (Tests in Lesson 3 will import `app` without binding a port.)
if (require.main === module) {
  app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
}

module.exports = app;
