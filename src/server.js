const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Data directory for persistent storage
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database file paths
const DB_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  tasks: path.join(DATA_DIR, 'tasks.json'),
  items: path.join(DATA_DIR, 'items.json'),
  notes: path.join(DATA_DIR, 'notes.json'),
  labels: path.join(DATA_DIR, 'labels.json'),
  invites: path.join(DATA_DIR, 'invites.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
};

// Initialize database files
Object.entries(DB_FILES).forEach(([key, filepath]) => {
  if (!fs.existsSync(filepath)) {
    const initialData = key === 'settings' ? {} : [];
    fs.writeFileSync(filepath, JSON.stringify(initialData, null, 2));
  }
});

// Helper functions
const readDB = (file) => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return Array.isArray(DB_FILES[file]) ? [] : {};
  }
};

const writeDB = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
// Users
app.get('/api/users', (req, res) => {
  const users = readDB(DB_FILES.users);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const users = readDB(DB_FILES.users);
  const newUser = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeDB(DB_FILES.users, users);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const users = readDB(DB_FILES.users);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  users[index] = { ...users[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(DB_FILES.users, users);
  res.json(users[index]);
});

app.delete('/api/users/:id', (req, res) => {
  const users = readDB(DB_FILES.users);
  const filtered = users.filter(u => u.id !== req.params.id);
  writeDB(DB_FILES.users, filtered);
  res.status(204).send();
});

// Tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readDB(DB_FILES.tasks);
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const tasks = readDB(DB_FILES.tasks);
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeDB(DB_FILES.tasks, tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readDB(DB_FILES.tasks);
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(DB_FILES.tasks, tasks);
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readDB(DB_FILES.tasks);
  const filtered = tasks.filter(t => t.id !== req.params.id);
  writeDB(DB_FILES.tasks, filtered);
  res.status(204).send();
});

// Items
app.get('/api/items', (req, res) => {
  const items = readDB(DB_FILES.items);
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const items = readDB(DB_FILES.items);
  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeDB(DB_FILES.items, items);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const items = readDB(DB_FILES.items);
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found' });
  
  items[index] = { ...items[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(DB_FILES.items, items);
  res.json(items[index]);
});

app.delete('/api/items/:id', (req, res) => {
  const items = readDB(DB_FILES.items);
  const filtered = items.filter(i => i.id !== req.params.id);
  writeDB(DB_FILES.items, filtered);
  res.status(204).send();
});

// Notes
app.get('/api/notes', (req, res) => {
  const notes = readDB(DB_FILES.notes);
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const notes = readDB(DB_FILES.notes);
  const newNote = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  notes.push(newNote);
  writeDB(DB_FILES.notes, notes);
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
  const notes = readDB(DB_FILES.notes);
  const index = notes.findIndex(n => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Note not found' });
  
  notes[index] = { ...notes[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(DB_FILES.notes, notes);
  res.json(notes[index]);
});

app.delete('/api/notes/:id', (req, res) => {
  const notes = readDB(DB_FILES.notes);
  const filtered = notes.filter(n => n.id !== req.params.id);
  writeDB(DB_FILES.notes, filtered);
  res.status(204).send();
});

// Labels
app.get('/api/labels', (req, res) => {
  const labels = readDB(DB_FILES.labels);
  res.json(labels);
});

app.post('/api/labels', (req, res) => {
  const labels = readDB(DB_FILES.labels);
  const newLabel = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  labels.push(newLabel);
  writeDB(DB_FILES.labels, labels);
  res.status(201).json(newLabel);
});

app.put('/api/labels/:id', (req, res) => {
  const labels = readDB(DB_FILES.labels);
  const index = labels.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Label not found' });
  
  labels[index] = { ...labels[index], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(DB_FILES.labels, labels);
  res.json(labels[index]);
});

app.delete('/api/labels/:id', (req, res) => {
  const labels = readDB(DB_FILES.labels);
  const filtered = labels.filter(l => l.id !== req.params.id);
  writeDB(DB_FILES.labels, filtered);
  res.status(204).send();
});

// Invites
app.get('/api/invites', (req, res) => {
  const invites = readDB(DB_FILES.invites);
  res.json(invites);
});

app.post('/api/invites', (req, res) => {
  const invites = readDB(DB_FILES.invites);
  const newInvite = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  invites.push(newInvite);
  writeDB(DB_FILES.invites, invites);
  res.status(201).json(newInvite);
});

app.delete('/api/invites/:id', (req, res) => {
  const invites = readDB(DB_FILES.invites);
  const filtered = invites.filter(i => i.id !== req.params.id);
  writeDB(DB_FILES.invites, filtered);
  res.status(204).send();
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = readDB(DB_FILES.settings);
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  writeDB(DB_FILES.settings, req.body);
  res.json(req.body);
});

// Bulk operations
app.post('/api/tasks/bulk', (req, res) => {
  const tasks = readDB(DB_FILES.tasks);
  const { action, taskIds, updates } = req.body;
  
  if (action === 'update') {
    taskIds.forEach(id => {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      }
    });
    writeDB(DB_FILES.tasks, tasks);
    res.json({ success: true, updated: taskIds.length });
  } else if (action === 'delete') {
    const filtered = tasks.filter(t => !taskIds.includes(t.id));
    writeDB(DB_FILES.tasks, filtered);
    res.json({ success: true, deleted: taskIds.length });
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Todoless-ngx server running on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});