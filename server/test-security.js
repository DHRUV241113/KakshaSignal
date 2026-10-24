// Security Regression Test Suite for KakshaSignal
// Validates SEC-01 through SEC-05 and AUD-01 through AUD-05 fixes against real HTTP requests:
// 1. Teacher Authentication & Authorization (SEC-01 & AUD-01)
// 2. Student Name Validation & Join Code Integrity (SEC-02)
// 3. Request Payload Limits (SEC-04)
// 4. Formative Practice Correctness & Anti-Bias (SEC-05)
// 5. Student Progress Protection & Cross-Student IDOR (AUD-05)
// 6. Token Tampering, Expiry & Key Invalidation (AUD-02)
// 7. Rate Limiter IP Spoofing Protection (AUD-03)
// 8. Strict CORS Origin Allowlist (AUD-04)

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
import {
  generateTeacherToken,
  generateStudentToken,
  verifyTeacherToken,
  verifyStudentToken,
  _setSessionSecretForTesting,
  _resetSessionSecretForTesting
} from './services/authService.js';
import { createRateLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'db', 'ccp-data.json');

// Preserve database snapshot
let dbSnapshot = null;
if (fs.existsSync(DB_FILE)) {
  dbSnapshot = fs.readFileSync(DB_FILE, 'utf-8');
}

function restoreDb() {
  if (dbSnapshot !== null) {
    try {
      fs.writeFileSync(DB_FILE, dbSnapshot, 'utf-8');
      const db = getDb();
      db.load();
      console.log('📦 Database snapshot successfully restored.');
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
    }
  }
}

// Build Express test server with exact production security middleware & allowlist
const app = express();

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://dhruv241113.github.io'
];
const allowedOriginsSet = new Set(defaultOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOriginsSet.has(origin)) return callback(null, true);
    return callback(new Error('CORS request blocked: Origin not allowed'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-teacher-token', 'x-student-token']
}));

app.use(express.json({ limit: '64kb' }));

// Dedicated test rate limiter for testing spoofing
const testIpLimiter = createRateLimiter({
  windowMs: 10000,
  max: 3,
  message: 'Test rate limit reached'
});
app.get('/api/test-rate-limit', testIpLimiter, (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: 'Payload too large: Request body must be under 64KB' });
  }
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'Forbidden: Origin blocked by CORS policy' });
  }
  res.status(500).json({ error: err.message || 'Internal error' });
});

let server = null;
let baseUrl = '';

async function runSecuritySuite() {
  console.log('🛡️ Starting KakshaSignal Comprehensive Security Verification Suite...\n');
  let passedCount = 0;
  let totalCount = 0;

  async function check(desc, fn) {
    totalCount++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${desc}`);
      passedCount++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${desc}`);
      console.error(`     Reason: ${err.message}`);
    }
  }

  try {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`  🚀 Security test server listening on ${baseUrl}\n`);
        resolve();
      });
    });

    console.log('--- 1. SEC-01 & AUD-01: Teacher Authentication, Authorization & Overview ---');

    // 1.1 Unauthenticated mutation rejected
    await check('Unauthenticated POST /api/teacher/assign returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 10,
          nodeId: '6_fractions',
          action: 'skip'
        })
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
      const data = await res.json();
      if (!data.error) throw new Error('Expected error message in response');
    });

    // 1.2 Malformed token rejected
    await check('Malformed Bearer token in POST /api/teacher/assign returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer forged-invalid-token-12345'
        },
        body: JSON.stringify({
          studentId: 10,
          nodeId: '6_fractions',
          action: 'skip'
        })
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
    });

    // 1.3 Valid teacher login yields authentic token
    let validTeacherToken = null;
    await check('POST /api/auth/teacher/login returns cryptographic token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TEACH2026' })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (!data.token || typeof data.token !== 'string') throw new Error('Missing token in response');
      validTeacherToken = data.token;
    });

    // 1.4 AUD-01: Authenticated teacher overview loads cleanly without HTTP 500
    await check('AUD-01: GET /api/teacher/class/:id/overview with Bearer token returns 200 OK without 500 error', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/class/1/overview`, {
        headers: {
          'Authorization': `Bearer ${validTeacherToken}`
        }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.students) || data.students.length === 0) throw new Error('Expected student list');
      if (!Array.isArray(data.nodes) || data.nodes.length !== 31) throw new Error('Expected 31 curriculum nodes');
    });

    // 1.5 AUD-01: Invalid token on overview endpoint is rejected with 401
    await check('AUD-01: GET /api/teacher/class/:id/overview with invalid token returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/class/1/overview`, {
        headers: {
          'Authorization': 'Bearer invalid-teacher-token-xyz'
        }
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
    });

    // 1.6 Authenticated teacher can perform authorized override
    await check('Authenticated teacher can successfully override student mastery (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/api/teacher/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validTeacherToken}`
        },
        body: JSON.stringify({
          studentId: 10, // Sneha Rao belongs to Class 8-B (Mrs. Sharma's class)
          nodeId: '6_fractions',
          action: 'skip',
          note: 'Security test verified override'
        })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error('Action was not marked successful');
      if (data.authorizedTeacherId !== 1) throw new Error('Server did not record verified teacher ID');
    });

    // 1.7 IDOR protection: Teacher cannot modify students outside their classroom
    await check('Teacher cannot modify student outside authorized classroom (403 Forbidden)', async () => {
      const rogueToken = generateTeacherToken(999);
      const res = await fetch(`${baseUrl}/api/teacher/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rogueToken}`
        },
        body: JSON.stringify({
          studentId: 10,
          nodeId: '6_fractions',
          action: 'skip'
        })
      });
      if (res.status !== 401 && res.status !== 403) {
        throw new Error(`Expected HTTP 401 or 403, got ${res.status}`);
      }
    });

    console.log('\n--- 2. SEC-02: Student Name Validation & Join Code Integrity ---');

    // 2.1 Invalid student names rejected
    await check('Single-character name "A" is rejected (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'A', joinCode: 'JOIN8B' })
      });
      if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    });

    await check('XSS injection script in student name is rejected (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '<script>alert(1)</script>', joinCode: 'JOIN8B' })
      });
      if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    });

    // 2.2 Valid Indian multilingual names accepted with token returned
    let validStudentToken = null;
    let loggedInStudentId = null;
    await check('Multilingual Indian student name in Devanagari is accepted with session token (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'स्नेहा राव', joinCode: 'JOIN8B' })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (data.student.name !== 'स्नेहा राव') throw new Error(`Expected name preserved, got ${data.student.name}`);
      if (!data.token) throw new Error('Expected student token in response');
      validStudentToken = data.token;
      loggedInStudentId = data.student.id;
    });

    // 2.3 Unknown join code rejected
    await check('Unknown classroom join code "INVALID99" is rejected (401 Unauthorized)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Aditya Verma', joinCode: 'INVALID99' })
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
    });

    console.log('\n--- 3. AUD-05: Protected Student Progress Endpoints & IDOR Isolation ---');

    // 3.1 Unauthenticated request to student topics is rejected
    await check('Unauthenticated GET /api/student/topics/:id returns 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/api/student/topics/${loggedInStudentId}`);
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
    });

    // 3.2 Student accessing own topics with valid token succeeds
    await check('Student accessing own topics with valid token returns 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/student/topics/${loggedInStudentId}`, {
        headers: { 'Authorization': `Bearer ${validStudentToken}` }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.allTopics)) throw new Error('Expected allTopics array');
    });

    // 3.3 Student A accessing Student B records is rejected (IDOR check)
    await check('Student A accessing Student B records returns 403 Forbidden', async () => {
      const otherStudentId = loggedInStudentId === 10 ? 2 : 10;
      const res = await fetch(`${baseUrl}/api/student/topics/${otherStudentId}`, {
        headers: { 'Authorization': `Bearer ${validStudentToken}` }
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
    });

    // 3.4 Authenticated teacher can access assigned student's gap trace
    await check('Authenticated teacher can view assigned student gap trace (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/api/student/trace/10/8_rational_numbers_adv`, {
        headers: { 'Authorization': `Bearer ${validTeacherToken}` }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.rootGaps)) throw new Error('Expected rootGaps array');
    });

    // 3.5 Teacher cannot view student outside their classroom
    await check('Teacher cannot view student outside authorized classroom (403 Forbidden)', async () => {
      // Teacher 999 token
      const rogueToken = generateTeacherToken(999);
      const res = await fetch(`${baseUrl}/api/student/topics/10`, {
        headers: { 'Authorization': `Bearer ${rogueToken}` }
      });
      if (res.status !== 401 && res.status !== 403) {
        throw new Error(`Expected HTTP 401 or 403, got ${res.status}`);
      }
    });

    console.log('\n--- 4. AUD-02: Cryptographic Token Tampering & Key Invalidation ---');

    // 4.1 Tampered token signature fails verification
    await check('Tampered token signature fails verification', async () => {
      const tampered = validTeacherToken.slice(0, -6) + 'abcdef';
      const verified = verifyTeacherToken(tampered);
      if (verified !== null) throw new Error('Expected tampered token to fail verification');
    });

    // 4.2 Rotating signing key invalidates previously issued tokens
    await check('Changing session secret invalidates previously issued tokens', async () => {
      const testToken = generateTeacherToken(1);
      if (!verifyTeacherToken(testToken)) throw new Error('Token should initially be valid');
      
      // Simulate secret rotation
      _setSessionSecretForTesting('brand-new-different-secret-key-32chars!');
      const verifiedAfterRotation = verifyTeacherToken(testToken);
      _resetSessionSecretForTesting(); // restore
      
      if (verifiedAfterRotation !== null) {
        throw new Error('Expected token to fail verification after secret rotation');
      }
    });

    console.log('\n--- 5. AUD-03: Rate Limiter IP Spoofing Prevention ---');

    // 5.1 Spoofed x-forwarded-for header does NOT bypass rate limit
    await check('Changing x-forwarded-for header does not bypass connection-based rate limit', async () => {
      // Send 3 requests (limit is 3)
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`${baseUrl}/api/test-rate-limit`, {
          headers: { 'X-Forwarded-For': `192.168.1.${i}` }
        });
        if (res.status !== 200) throw new Error(`Expected HTTP 200 on request ${i + 1}`);
      }
      
      // 4th request with a different spoofed IP MUST be rejected (429)
      const res4 = await fetch(`${baseUrl}/api/test-rate-limit`, {
        headers: { 'X-Forwarded-For': '10.99.88.77' }
      });
      if (res4.status !== 429) {
        throw new Error(`Expected HTTP 429, got ${res4.status} (spoofed IP bypassed rate limit!)`);
      }
    });

    console.log('\n--- 6. AUD-04: Strict CORS Origin Allowlist ---');

    // 6.1 Explicit allowed origin is accepted
    await check('Explicit demonstration origin https://dhruv241113.github.io is permitted by CORS', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { 'Origin': 'https://dhruv241113.github.io' }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const allowHeader = res.headers.get('access-control-allow-origin');
      if (allowHeader !== 'https://dhruv241113.github.io') {
        throw new Error(`Expected Access-Control-Allow-Origin header, got ${allowHeader}`);
      }
    });

    // 6.2 Arbitrary attacker github.io origin is blocked by CORS policy
    await check('Arbitrary https://attacker.github.io is blocked by CORS policy (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { 'Origin': 'https://attacker.github.io' }
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
    });

    // 6.3 Arbitrary attacker trycloudflare.com origin is blocked by CORS policy
    await check('Arbitrary https://attacker.trycloudflare.com is blocked by CORS policy (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { 'Origin': 'https://attacker.trycloudflare.com' }
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
    });

    console.log('\n--- 7. SEC-04 & SEC-05: Payload Limits & Question Anti-Bias ---');

    // 7.1 Oversized JSON payload rejected
    await check('Oversized JSON payload (>64KB) is rejected (413 Payload Too Large)', async () => {
      const hugeString = 'X'.repeat(70 * 1024); // 70 KB
      const res = await fetch(`${baseUrl}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 10,
          nodeId: '6_fractions',
          quizType: 'diagnostic',
          answers: [],
          overflow: hugeString
        })
      });
      if (res.status !== 413) throw new Error(`Expected HTTP 413, got ${res.status}`);
    });

    // 7.2 Formative practice checked from trusted question bank
    await check('POST /api/quiz/check-practice correctly evaluates answer against question bank', async () => {
      const res = await fetch(`${baseUrl}/api/quiz/check-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: '6_fractions',
          questionId: '6f1',
          selectedOption: 0
        })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (data.isCorrect !== true) throw new Error('Expected option 0 to be graded correctly for 6f1');
    });

    // 7.3 Formative practice check rejects incorrect option
    await check('POST /api/quiz/check-practice identifies incorrect answer', async () => {
      const res = await fetch(`${baseUrl}/api/quiz/check-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: '6_fractions',
          questionId: '6f1',
          selectedOption: 2
        })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (data.isCorrect !== false) throw new Error('Expected option 2 to be marked false for 6f1');
    });

    // 7.4 Text-based comparison is immune to option index shuffling
    await check('POST /api/quiz/check-practice verifies option text directly (shuffling-immune)', async () => {
      const res = await fetch(`${baseUrl}/api/quiz/check-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: '6_fractions',
          questionId: '6f1',
          selectedOptionText: 'Improper fraction'
        })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data = await res.json();
      if (data.isCorrect !== true) throw new Error('Expected text "Improper fraction" to be recognized as correct');
    });

  } finally {
    if (server) {
      server.close();
      console.log('\n  🛑 Security test server stopped.');
    }
    restoreDb();
  }

  console.log('\n========================================');
  console.log(`Security Test Results: ${passedCount} / ${totalCount} passed (${Math.round((passedCount/totalCount)*100)}%)`);
  console.log('========================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runSecuritySuite().catch(err => {
  console.error('Fatal security test execution failure:', err);
  restoreDb();
  process.exit(1);
});
