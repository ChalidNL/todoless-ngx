const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const { pool, initialize, setupNotifications } = require('./database');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const itemsRoutes = require('./routes/items');
const notesRoutes = require('./routes/notes');
const labelsRoutes = require('./routes/labels');
const shopsRoutes = require('./routes/shops');
const sprintsRoutes = require('./routes/sprints');
const calendarRoutes = require('./routes/calendar');
const settingsRoutes = require('./routes/settings');
const invitesRoutes = require('./routes/invites');
const usersRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// Create WebSocket server with noServer option
const wss = new WebSocket.Server({ noServer: true });

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Handle WebSocket upgrade requests on /ws path
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function for real-time updates
global.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Setup PostgreSQL LISTEN for real-time notifications
const setupRealtimeListener = async () => {
  const client = await pool.connect();
  
  await client.query('LISTEN data_change');
  
  client.on('notification', (msg) => {
    if (msg.channel === 'data_change') {
      try {
        const payload = JSON.parse(msg.payload);
        global.broadcast({
          type: 'data_change',
          ...payload
        });
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    }
  });

  console.log('✅ Real-time listener active');
};

// Initialize database and start server
(async () => {
  try {
    await initialize();
    await setupNotifications();
    await setupRealtimeListener();

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected',
        websocket: 'enabled',
        clients: wss.clients.size
      });
    });

    // Debug endpoint
    app.get('/api/debug', (req, res) => {
      res.json({
        status: 'Backend is running',
        port: PORT,
        routes: ['/api/health', '/api/auth', '/api/tasks', '/api/items', '/api/notes'],
        websocket: {
          path: '/ws',
          clients: wss.clients.size
        }
      });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', tasksRoutes);
    app.use('/api/items', itemsRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/labels', labelsRoutes);
    app.use('/api/shops', shopsRoutes);
    app.use('/api/sprints', sprintsRoutes);
    app.use('/api/calendar', calendarRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/invites', invitesRoutes);
    app.use('/api/users', usersRoutes);

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Todoless-ngx backend running on port ${PORT}`);
      console.log(`📦 Database: PostgreSQL`);
      console.log(`🔄 Real-time updates: enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});