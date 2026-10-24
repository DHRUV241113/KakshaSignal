// Zero-dependency In-Memory Rate Limiting Middleware
// Protects authentication and registration endpoints against brute-force and resource flooding.

const ipBuckets = new Map();
const CLEANUP_INTERVAL_MS = 60000; // Clean every minute

// Periodic background cleanup of expired buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipBuckets.entries()) {
    if (now - record.resetTime > 0) {
      ipBuckets.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS).unref(); // unref so timer doesn't prevent Node process exit

/**
 * Safely extracts client IP address.
 * Does NOT trust x-forwarded-for unless TRUST_PROXY is explicitly configured,
 * preventing spoofed header rate-limiting bypass.
 */
export function getClientIp(req) {
  const trustProxy = process.env.TRUST_PROXY === 'true' || Boolean(req.app && req.app.get('trust proxy'));
  
  if (trustProxy && req.headers['x-forwarded-for']) {
    const raw = String(req.headers['x-forwarded-for']);
    const firstIp = raw.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Creates a rate limiter middleware for Express.
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests allowed in the window
 * @param {string} options.message - Error message returned on 429
 */
export function createRateLimiter({ windowMs = 60000, max = 30, message = 'Too many requests, please try again later.' }) {
  return function rateLimiter(req, res, next) {
    const ip = getClientIp(req);
    const key = `${req.baseUrl || ''}${req.path}:${ip}`;
    const now = Date.now();

    let record = ipBuckets.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipBuckets.set(key, record);
      return next();
    }

    record.count++;
    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSec
      });
    }

    next();
  };
}

// Pre-configured rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.'
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: 'Too many account creation requests from this IP. Please wait before creating more students.'
});
