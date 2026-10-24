// Curriculum Continuity Pass — Server
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDb } from './db/schema.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import studentRoutes from './routes/student.js';
import teacherRoutes from './routes/teacher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// --- SEC-03 & AUD-04: Strict CORS Configuration with Explicit Origin Allowlist ---
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://dhruv241113.github.io'
];

let envOrigins = [];
if (process.env.ALLOWED_ORIGINS) {
  try {
    envOrigins = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
  } catch (_) {
    envOrigins = [];
  }
}

const allowedOriginsSet = new Set([...defaultOrigins, ...envOrigins]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents (curl, server-to-server, test scripts) where origin is undefined
    if (!origin) return callback(null, true);

    // Exact match in explicit allowlist (no wildcard suffix matching)
    if (allowedOriginsSet.has(origin)) return callback(null, true);

    return callback(new Error('CORS request blocked: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-teacher-token', 'x-student-token', 'x-teacher-code']
};

app.use(cors(corsOptions));

// --- SEC-04: Explicit Request Body Size Limit (64 KB) ---
app.use(express.json({ limit: '64kb' }));

// Serve static client build if it exists
const clientBuildPath = join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Curriculum Continuity Pass' });
});

// Catch-all: serve React app for client-side routing
app.get('*', (req, res) => {
  const indexPath = join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).json({ message: 'CCP API is running. Client not built yet — run: cd client && npm run build' });
    }
  });
});

// Global Error Handler (Sanitizes stack traces and handles payload/CORS errors)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: 'Payload too large: Request body must be under 64KB' });
  }
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'Forbidden: Origin blocked by CORS policy' });
  }
  console.error('API Error:', err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB and start
getDb();
app.listen(PORT, () => {
  console.log(`\n🎓 Curriculum Continuity Pass — Server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
  console.log(`   Ready for connections.\n`);
});
