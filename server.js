const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload and data directories exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
const dataDir = path.join(__dirname, 'data');
const episodesFile = path.join(dataDir, 'episodes.json');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(episodesFile)) fs.writeFileSync(episodesFile, '[]');

// Multer config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files allowed'), false);
    }
  }
});

// Helper to read/write episodes
const readEpisodes = () => JSON.parse(fs.readFileSync(episodesFile, 'utf8'));
const writeEpisodes = (episodes) => fs.writeFileSync(episodesFile, JSON.stringify(episodes, null, 2));

// Admin credentials (change these!)
const ADMIN_PASSWORD = 'jmc2024';
const creators = [
  { username: 'admin', password: ADMIN_PASSWORD, role: 'staff' }
];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Player page (students)
app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

// Admin page (creators)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = creators.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.status(401).json({ error: 'Incorrect username or password.' });
  }
});

// Get all episodes
app.get('/api/episodes', (req, res) => {
  const episodes = readEpisodes();
  res.json(episodes);
});

// Upload new episode
app.post('/api/episodes/upload', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { title, description, date, creator } = req.body;
  const episodes = readEpisodes();

  const newEpisode = {
    id: uuidv4(),
    title: title || 'Untitled',
    description: description || '',
    date: date || new Date().toISOString().split('T')[0],
    creator: creator || 'Anonymous Creator',
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`
  };

  episodes.push(newEpisode);
  writeEpisodes(episodes);
  res.status(201).json(newEpisode);
});

// Delete episode
app.delete('/api/episodes/:id', (req, res) => {
  const episodes = readEpisodes();
  const id = req.params.id;
  const index = episodes.findIndex(e => e.id === id);

  if (index === -1) return res.status(404).json({ error: 'Episode not found' });

  const deleted = episodes.splice(index, 1)[0];
  writeEpisodes(episodes);

  // Delete file
  const filePath = path.join(uploadDir, deleted.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  res.json({ message: 'Deleted', episode: deleted });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`JMC Radio server running on port ${PORT}`);
});
