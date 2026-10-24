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

// Middleware
app.use(cors());
app.use(express.json());

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

// Initialize DB and start
getDb();
app.listen(PORT, () => {
  console.log(`\n🎓 Curriculum Continuity Pass — Server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
  console.log(`   Ready for connections.\n`);
});
