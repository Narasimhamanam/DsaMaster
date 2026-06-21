require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { initSocket } = require('./config/socket');
const { generalLimiter } = require('./middleware/rateLimiter');
const { scheduleContestCreation } = require('./jobs/contestJob');
const { scheduleEmailJobs } = require('./jobs/emailJob');
const { scheduleRevisionJobs } = require('./jobs/revisionJob');

// Initialize Firebase Admin
initFirebase();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// ─── Middleware ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/revisions', require('./routes/revisions'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/announcements', require('./routes/announcements'));

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start Cron Jobs ─────────────────────────────────────
scheduleContestCreation();
scheduleEmailJobs();
scheduleRevisionJobs();
console.log('⏰ Cron jobs scheduled');

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 DSAMASTER Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = { app, server };
