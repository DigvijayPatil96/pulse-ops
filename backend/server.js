require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { startVitalsSimulation } = require('./services/vitalsSimulationService');
const { startResourceOptimizer } = require('./services/resourceOptimizerService');
const memoryStore = require('./services/memoryStore');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const triageRoutes = require('./routes/triageRoutes');
const bedRoutes = require('./routes/bedRoutes');
const taskRoutes = require('./routes/taskRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Real-Time Socket.io Gateway
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

initSocket(io);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Smart Hospital Command Center API',
    databaseMode: mongoose.connection.readyState === 1 ? 'MongoDB (Live)' : 'In-Memory Clinical Store',
    geminiAiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
  });
});

// Mount Clinical & Operational Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/alerts', alertRoutes);

// Catch-all 404 for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Database
const startServer = async () => {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      console.log('[Hospital Server] Live MongoDB not detected; initializing resilient in-memory clinical database...');
      await memoryStore.init();
    }

    server.listen(PORT, () => {
      console.log(`[Hospital Server] API & WebSocket Gateway running on port ${PORT}`);
      console.log(`[Hospital Server] Health status: http://localhost:${PORT}/api/health`);

      // Launch automated real-time background engines
      startVitalsSimulation(3000);
      startResourceOptimizer(20000);
    });
  } catch (error) {
    console.error('[Hospital Server] Startup failure:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle graceful termination
process.on('SIGINT', () => {
  console.log('[Hospital Server] Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = { app, server };
