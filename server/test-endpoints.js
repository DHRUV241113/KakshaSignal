// Service and data assertion suite for Curriculum Continuity Pass (CCP)
// Tests graph, JSON store, tracer, quiz engine, and heatmap helpers; it does not start or call HTTP endpoints.
// Automatically backs up and restores the JSON demo database around the test run.

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDb } from './db/schema.js';
import { traceGap, getClassGapSummary } from './services/gapTracer.js';
import { generateQuiz, gradeQuiz } from './services/quizEngine.js';
import knowledgeGraph from './data/knowledgeGraph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'db', 'ccp-data.json');

// Back up JSON database before test mutations
let dbBackup = null;
if (fs.existsSync(DB_FILE)) {
  dbBackup = fs.readFileSync(DB_FILE, 'utf-8');
}

console.log('🧪 Starting CCP Automated Validation Suite...\n');

let passedTests = 0;
let totalTests = 0;

function restoreBackup() {
  if (dbBackup !== null) {
    try {
      fs.writeFileSync(DB_FILE, dbBackup, 'utf-8');
      const db = getDb();
      db.load();
      console.log('📦 Database snapshot successfully restored (test mutations rolled back).');
    } catch (err) {
      console.error('Failed to restore database backup:', err);
    }
  }
}

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

// TEST 1: Knowledge Graph Integrity
console.log('1. Knowledge Graph Verification');
assert(knowledgeGraph.nodes.length >= 25, `Graph contains at least 25 nodes (Actual: ${knowledgeGraph.nodes.length})`);
assert(knowledgeGraph.edges.length >= 20, `Graph contains at least 20 prerequisite edges (Actual: ${knowledgeGraph.edges.length})`);

// Ensure DAG (no cycles)
function hasCycle() {
  const adj = {};
  for (const n of knowledgeGraph.nodes) adj[n.id] = [];
  for (const [p, d] of knowledgeGraph.edges) adj[p].push(d);

  const visited = {};
  const recStack = {};

  function isCyclic(v) {
    if (!visited[v]) {
      visited[v] = true;
      recStack[v] = true;
      for (const neighbor of (adj[v] || [])) {
        if (!visited[neighbor] && isCyclic(neighbor)) return true;
        else if (recStack[neighbor]) return true;
      }
    }
    recStack[v] = false;
    return false;
  }

  for (const n of knowledgeGraph.nodes) {
    if (isCyclic(n.id)) return true;
  }
  return false;
}
assert(!hasCycle(), 'Knowledge graph is a valid Directed Acyclic Graph (DAG) with no circular dependencies');

// TEST 2: Database Store & Seed Data
console.log('\n2. Database Store Verification');
const db = getDb();
const teacher = db.prepare('SELECT * FROM teachers WHERE code = ?').get('TEACH2026');
assert(teacher !== null, 'Teacher TEACH2026 exists in DB');
assert(teacher?.name === 'Mrs. Sharma', 'Teacher name is Mrs. Sharma');

const classrooms = db.prepare('SELECT * FROM classrooms WHERE teacher_id = ?').all(teacher.id);
assert(classrooms.length >= 2, `Teacher has classrooms (Actual: ${classrooms.length})`);

const students = db.prepare('SELECT * FROM students WHERE classroom_id = ?').all(classrooms[0].id);
assert(students.length >= 5, `Classroom 1 has students (Actual: ${students.length})`);

// TEST 3: Deterministic Backward Gap Tracer
console.log('\n3. Deterministic Backward Gap Tracer Verification');
// Find Sneha Rao (Class 8 student who has a gap)
const sneha = db.prepare('SELECT * FROM students WHERE name = ? AND classroom_id = ?').get('Sneha Rao', classrooms[1]?.id || classrooms[0].id);
if (sneha) {
  const trace = traceGap(sneha.id, '8_rational_numbers_adv');
  assert(trace !== null, 'Gap trace returns non-null result');
  assert(trace.rootGaps.length > 0, `Backward tracer identified root cause gaps (Found: ${trace.rootGaps.map(g => g.label).join(', ')})`);
  assert(trace.recommendedPath.length > 0, `Topological remediation path generated (Steps: ${trace.recommendedPath.length})`);
} else {
  console.log('  ⚠️ Sneha Rao record not found for gap trace test');
}

// TEST 4: Quiz Engine Generation & Scoring
console.log('\n4. Quiz Engine Verification');
const quiz = generateQuiz('6_fractions', 'diagnostic');
assert(quiz.questions.length === 5, 'Generated diagnostic quiz has 5 questions');
assert(quiz.questions[0].options.length === 4, 'Quiz questions have 4 options');

// Submit quiz answers using each question's actual correct answer index
import questions from './data/questions.js';
const questionBank = questions['6_fractions'];
const answers = quiz.questions.map(q => {
  const bankQ = questionBank.find(bq => bq.id === q.id);
  return { questionId: q.id, selectedOption: bankQ ? bankQ.answer : 0 };
});
const gradeResult = gradeQuiz(1, '6_fractions', 'diagnostic', answers);
assert(gradeResult.passed === true, 'All correct answers marks quiz as passed');
assert(gradeResult.score === 1.0, 'Score is 100%');

// Test failing quiz (all wrong — pick an option that is NOT the correct answer)
const wrongAnswers = quiz.questions.map(q => {
  const bankQ = questionBank.find(bq => bq.id === q.id);
  const wrongOption = bankQ && bankQ.answer === 3 ? 1 : 3;
  return { questionId: q.id, selectedOption: wrongOption };
});
const failResult = gradeQuiz(1, '6_fractions', 'diagnostic', wrongAnswers);
assert(failResult.passed === false, 'Wrong answers correctly fail passing threshold');

// TEST 5: Class Gap Summary for Heatmap
console.log('\n5. Class Gap Heatmap Summary');
const summary = getClassGapSummary(classrooms[0].id);
assert(summary.students.length > 0, `Summary contains student rows (Actual: ${summary.students.length})`);
assert(summary.nodes.length > 0, `Summary contains competency columns (Actual: ${summary.nodes.length})`);

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  console.log('🎉 All service and data assertions passed.');
  restoreBackup();
  process.exit(0);
} else {
  console.error('❌ Some tests failed.');
  restoreBackup();
  process.exit(1);
}
