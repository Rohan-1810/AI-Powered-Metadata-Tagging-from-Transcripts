const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const transcriptRoutes = require('./routes/transcript.routes');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and Root routes
app.get('/', (req, res) => {
  res.json({
    service: 'MetaMind AI - API Gateway',
    status: 'online',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcripts', transcriptRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection & Server initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/metamind_ai';

let server = null;

const initializeDatabaseAndStartServer = async () => {
  try {
    // Attempt connecting to configured Mongo URI with a short 3s timeout
    console.log(`[MongoDB] Connecting to ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not reach external MongoDB (${err.message}).`);
    console.log('[MongoDB] Starting embedded MongoDB engine for instant local operation...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Embedded MongoDB ready and connected at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Embedded MongoDB startup error:', memErr.message);
    }
  }

  server = app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`[MetaMind Server] API running on http://localhost:${PORT}`);
    console.log(`[MetaMind Server] Health: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  initializeDatabaseAndStartServer();
}

module.exports = { app, server };
