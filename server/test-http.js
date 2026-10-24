// Live HTTP Smoke Test Suite for Curriculum Continuity Pass (CCP)
// Starts an in-process Express server, validates actual HTTP requests via fetch,
// and restores the database backup after completion.

import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';

import { getDb } from './db/schema.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import studentRoutes from './routes/student.js';
import teacherRoutes from './routes/teacher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'db', 'ccp-data.json');
const clientBuildPath = join(__dirname, '..', 'client', 'dist');

// Backup database
let dbBackup = null;
if (fs.existsSync(DB_FILE)) {
  dbBackup = fs.readFileSync(DB_FILE, 'utf-8');
}

function restoreDb() {
  if (dbBackup !== null) {
    try {
      fs.writeFileSync(DB_FILE, dbBackup, 'utf-8');
      const db = getDb();
      db.load();
      console.log('📦 Database snapshot successfully restored.');
    } catch (err) {
      console.error('Failed to restore database backup:', err);
    }
  }
}

// Build Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(clientBuildPath));

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Curriculum Continuity Pass' });
});

app.get('*', (req, res) => {
  const indexPath = join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ message: 'Client dist not found' });
  }
});

async function runHttpTests() {
  console.log('🌐 Starting CCP Live HTTP Verification Suite...\n');

  // Start on an ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`  🚀 HTTP test server listening on ${baseUrl}\n`);

  let passed = 0;
  let total = 0;

  async function check(name, testFn) {
    total++;
    const start = Date.now();
    try {
      await testFn();
      const elapsed = Date.now() - start;
      console.log(`  ✅ PASS: ${name} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.error(`  ❌ FAIL: ${name} (${elapsed}ms) - ${err.message}`);
    }
  }

  try {
    // 1. Health check
    await check('GET /api/health returns 200 OK and status ok', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(`Expected status: 'ok', got: ${data.status}`);
    });

    // 2. Teacher login
    let teacherData = null;
    await check('POST /api/auth/teacher/login with TEACH2026', async () => {
      const res = await fetch(`${baseUrl}/api/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TEACH2026' })
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      teacherData = await res.json();
      if (teacherData.teacher.name !== 'Mrs. Sharma') throw new Error(`Unexpected teacher name: ${teacherData.teacher.name}`);
      if (!Array.isArray(teacherData.classrooms) || teacherData.classrooms.length < 2) {
        throw new Error(`Expected at least 2 classrooms`);
      }
    });

    // 3. Student login
    let studentData = null;
    await check('POST /api/auth/student/login for Sneha Rao in Class 8-B', async () => {
      const res = await fetch(`${baseUrl}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sneha Rao', joinCode: 'JOIN8B' })
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      studentData = await res.json();
      if (studentData.student.name !== 'Sneha Rao') throw new Error(`Unexpected student name: ${studentData.student.name}`);
      if (studentData.classroom.classLevel !== 8) throw new Error(`Expected classLevel 8`);
    });

    // 4. Teacher class heatmap overview
    await check('GET /api/teacher/class/:id/overview returns student matrix', async () => {
      const classId = teacherData.classrooms[0].id;
      const res = await fetch(`${baseUrl}/api/teacher/class/${classId}/overview`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.students) || data.students.length === 0) throw new Error('Empty students array');
      if (!Array.isArray(data.nodes) || data.nodes.length !== 31) throw new Error(`Expected 31 nodes, got ${data.nodes?.length}`);
    });

    // 5. Teacher knowledge graph
    await check('GET /api/teacher/knowledge-graph returns 31 nodes and 37 edges', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/knowledge-graph`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.nodes.length !== 31) throw new Error(`Expected 31 nodes, got ${data.nodes.length}`);
      if (data.edges.length !== 37) throw new Error(`Expected 37 edges, got ${data.edges.length}`);
    });

    // 6. Student topics endpoint
    await check('GET /api/student/topics/:studentId returns curriculum topics', async () => {
      const res = await fetch(`${baseUrl}/api/student/topics/${studentData.student.id}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.allTopics) || data.allTopics.length === 0) throw new Error('Missing allTopics');
      if (!data.topicsByClass) throw new Error('Missing topicsByClass');
    });

    // 7. Student gap trace endpoint
    await check('GET /api/student/trace/:studentId/:nodeId traces root gap to Fractions', async () => {
      const res = await fetch(`${baseUrl}/api/student/trace/${studentData.student.id}/8_rational_numbers_adv`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.rootGaps) || data.rootGaps.length === 0) throw new Error('No root gaps returned');
      const rootLabels = data.rootGaps.map(g => g.label);
      if (!rootLabels.includes('Fractions')) throw new Error(`Expected Fractions in root gaps, got: ${rootLabels.join(', ')}`);
    });

    // 8. Learning content endpoint
    await check('GET /api/student/learn/6_fractions returns NCERT explanations & formulas', async () => {
      const res = await fetch(`${baseUrl}/api/student/learn/6_fractions`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.content || !data.content.explanation) throw new Error('Missing content.explanation');
      if (!Array.isArray(data.content.keyFormulas)) throw new Error('Missing keyFormulas array');
    });

    // 9. Quiz generation endpoint
    await check('GET /api/quiz/generate/6_fractions returns 5 sanitized questions', async () => {
      const res = await fetch(`${baseUrl}/api/quiz/generate/6_fractions?type=diagnostic`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.questions.length !== 5) throw new Error(`Expected 5 questions, got ${data.questions.length}`);
      // Ensure answers are NOT leaked to client
      if (data.questions[0].answer !== undefined) throw new Error('Answer was leaked in quiz payload!');
    });

    // 10. Seeded learner receives the parallel Form B from the real API route
    await check('GET /api/quiz/generate/6_fractions for seeded Sneha returns Form B only', async () => {
      const res = await fetch(baseUrl + '/api/quiz/generate/6_fractions?type=mastery&studentId=10');
      if (res.status !== 200) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.isReassessment || !data.isParallelForm || !data.form.startsWith('B')) {
        throw new Error('Expected a parallel Form B reassessment, got ' + data.form);
      }
      if (data.questions.length !== 5 || !data.questions.every(q => q.form === 'B')) {
        throw new Error('Expected exactly five Form B questions');
      }
    });

    // 11. Static production client index.html serving
    await check('GET / serves production index.html', async () => {
      const res = await fetch(`${baseUrl}/`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes('<title>KakshaSignal')) throw new Error('HTML does not contain the KakshaSignal title');
      if (!text.includes('Curriculum Continuity Pass engine')) throw new Error('HTML does not identify the CCP engine');
    });

  } finally {
    await new Promise(resolve => server.close(resolve));
    console.log(`\n  🛑 HTTP test server stopped.`);
    restoreDb();
  }

  console.log(`\n========================================`);
  console.log(`HTTP Verification: ${passed} / ${total} endpoints passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('🎉 All HTTP endpoints verified successfully!');
    process.exit(0);
  } else {
    console.error('❌ Some HTTP endpoint checks failed.');
    process.exit(1);
  }
}

runHttpTests().catch(err => {
  console.error('Fatal test error:', err);
  restoreDb();
  process.exit(1);
});
