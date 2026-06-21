const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Rate limit exceeded.' },
});

module.exports = { generalLimiter, authLimiter, strictLimiter };
