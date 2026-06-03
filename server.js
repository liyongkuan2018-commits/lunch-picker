const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const RECIPES_FILE = path.join(__dirname, 'recipes.json');

// CORS - allow all origins for the web app
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '1mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ---- API Routes ----

// GET /api/recipes - get all recipes
app.get('/api/recipes', (req, res) => {
  try {
    const data = fs.readFileSync(RECIPES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// PUT /api/recipes - update entire recipe database
app.put('/api/recipes', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.lunch || !data.dinner) {
      return res.status(400).json({ error: '数据格式错误' });
    }
    // Atomic write
    const tmpFile = RECIPES_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, RECIPES_FILE);
    res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: '保存失败' });
  }
});

// Catch-all: serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`今天吃什么 server running on port ${PORT}`);
});
