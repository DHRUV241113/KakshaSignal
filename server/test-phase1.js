// Phase 1 Regression & Feature Verification Suite for KakshaSignal
// Verifies:
// 1. Dual-Persona Launchers & State Isolation (Priya Singh Class 7 vs Sneha Rao Class 8)
// 2. Verified NCERT Edge Attribution & Pedagogical Rationales in traceGap
// 3. Form A vs Form B Distinction and Score Progression
// 4. Offline Service Worker Asset Verification

import { traceGap } from './services/gapTracer.js';
import { generateQuiz, gradeQuiz } from './services/quizEngine.js';
import allQuestions from './data/questions.js';
import { getDb } from './db/schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('🚀 Running KakshaSignal Phase 1 Regression Suite...\n');

// Snapshot DB to ensure zero permanent test mutations
const dbFile = path.join(__dirname, 'db', 'ccp-data.json');
let snapshot = null;
if (fs.existsSync(dbFile)) {
  snapshot = fs.readFileSync(dbFile, 'utf8');
}

try {
  const db = getDb();

  // ==========================================
  // Section 1: Dual-Persona Launchers & Student Isolation
  // ==========================================
  console.log('1. Dual-Persona Launchers & Student Isolation');

  // Verify Priya Singh (Class 7-A Decode Proposal)
  const priya = db.prepare('SELECT * FROM students WHERE id = ?').get(2);
  assert(priya !== null && priya.name === 'Priya Singh', 'Priya Singh exists in DB (ID: 2)');
  const priyaClass = db.prepare('SELECT * FROM classrooms WHERE id = ?').get(priya.classroom_id);
  assert(priyaClass !== null && priyaClass.join_code === 'JOIN7A', 'Priya belongs to Class 7-A with join code JOIN7A');

  // Verify Sneha Rao (Class 8-B Flagship)
  const sneha = db.prepare('SELECT * FROM students WHERE id = ?').get(10);
  assert(sneha !== null && sneha.name === 'Sneha Rao', 'Sneha Rao exists in DB (ID: 10)');
  const snehaClass = db.prepare('SELECT * FROM classrooms WHERE id = ?').get(sneha.classroom_id);
  assert(snehaClass !== null && snehaClass.join_code === 'JOIN8B', 'Sneha belongs to Class 8-B with join code JOIN8B');

  // Distinct trace behaviors without collision
  const priyaTrace = traceGap(2, '7_fractions_decimals');
  const snehaTrace = traceGap(10, '8_rational_numbers_adv');

  assert(priyaTrace.failedNode === '7_fractions_decimals', 'Priya target node is 7_fractions_decimals');
  assert(priyaTrace.rootGaps.length === 2, 'Priya traces to 2 root foundational gaps (Fractions & Decimals)');
  assert(priyaTrace.rootGaps.map(r => r.id).includes('6_fractions'), 'Priya root gap includes 6_fractions');
  assert(priyaTrace.rootGaps.map(r => r.id).includes('6_decimals'), 'Priya root gap includes 6_decimals');

  assert(snehaTrace.failedNode === '8_rational_numbers_adv', 'Sneha target node is 8_rational_numbers_adv');
  assert(snehaTrace.rootGaps.length === 1 && snehaTrace.rootGaps[0].id === '6_fractions', 'Sneha traces to 6_fractions root');
  assert(snehaTrace.recommendedPath.length === 3, 'Sneha has 3-step cross-grade path (6_fractions -> 7_rational_numbers -> 8_rational_numbers_adv)');

  // ==========================================
  // Section 2: Verified NCERT Attribution & Rationales
  // ==========================================
  console.log('\n2. Verified NCERT Attribution & Step Rationales');

  // Verify Sneha's path contains verified NCERT edge connections
  const step1 = snehaTrace.recommendedPath[0];
  assert(step1.id === '6_fractions', 'Sneha step 1 is 6_fractions');
  assert(step1.edgeToNext !== null && step1.edgeToNext.toNodeId === '7_rational_numbers', 'Step 1 connects to 7_rational_numbers');
  assert(step1.edgeToNext.ncertSource === 'NCERT Class 6 Ch 7 -> Class 7 Ch 9', 'Verified NCERT source: Class 6 Ch 7 -> Class 7 Ch 9');
  assert(typeof step1.edgeToNext.rationale === 'string' && step1.edgeToNext.rationale.length > 10, 'Step 1 edge rationale present');

  const step2 = snehaTrace.recommendedPath[1];
  assert(step2.id === '7_rational_numbers', 'Sneha step 2 is 7_rational_numbers');
  assert(step2.edgeToNext !== null && step2.edgeToNext.toNodeId === '8_rational_numbers_adv', 'Step 2 connects to 8_rational_numbers_adv');
  assert(step2.edgeToNext.ncertSource === 'NCERT Class 7 Ch 9 -> Class 8 Ch 1', 'Verified NCERT source: Class 7 Ch 9 -> Class 8 Ch 1');

  // Verify Priya's trace contains verified NCERT edges
  assert(priyaTrace.traceEdges.length >= 2, 'Priya trace edges populated');
  const priyaFractionsEdge = priyaTrace.traceEdges.find(e => e.from === '6_fractions' && e.to === '7_fractions_decimals');
  assert(priyaFractionsEdge && priyaFractionsEdge.ncertSource === 'NCERT Class 6 Ch 7 -> Class 7 Ch 2', 'Priya edge has NCERT Class 6 Ch 7 -> Class 7 Ch 2');

  // ==========================================
  // Section 3: Assessment Form Distinction & Score Progression
  // ==========================================
  console.log('\n3. Assessment Form Distinction & Score Progression');

  // Form A diagnostic
  const formA = generateQuiz('6_fractions', 'diagnostic');
  assert(formA.form.includes('A'), 'Baseline diagnostic is Form A');
  assert(!formA.isReassessment, 'Baseline diagnostic is not flagged as reassessment');

  // Form B parallel reassessment
  const formB = generateQuiz('6_fractions', 'reassessment');
  assert(formB.form.includes('B'), 'Post-remediation quiz is Form B');
  assert(formB.isReassessment === true, 'Post-remediation quiz is flagged as reassessment');

  // Grade Form B submission for student 10 with correct answers
  const nodeQs = allQuestions['6_fractions'];
  const answersB = formB.questions.map(q => {
    const fullQ = nodeQs.find(item => item.id === q.id);
    return { questionId: q.id, selectedOption: fullQ ? fullQ.answer : 0 };
  });
  const gradeResultB = gradeQuiz(10, '6_fractions', 'mastery', answersB);
  assert(gradeResultB.reassessment.isReassessment === true, 'Grade result confirms reassessment');
  assert(gradeResultB.reassessment.beforePercentage !== null, 'Before score recorded from actual prior baseline');
  assert(gradeResultB.reassessment.afterPercentage === 100, 'After score reflects actual 100% correct answers');
  assert(gradeResultB.reassessment.scoreDelta > 0, 'Score delta is positive and empirically computed');

  // ==========================================
  // Section 4: Offline Service Worker Shell Verification
  // ==========================================
  console.log('\n4. Offline Service Worker Asset Verification');

  const swSource = path.join(__dirname, '..', 'client', 'public', 'sw.js');
  assert(fs.existsSync(swSource), 'sw.js exists in client/public/');
  const swContent = fs.readFileSync(swSource, 'utf8');
  assert(swContent.includes('/api/'), 'Service worker explicitly ignores /api/ requests to preserve dynamic grading');
  assert(swContent.includes('kakshasignal-static-v1'), 'Service worker uses versioned cache key');
  assert(swContent.includes('navigate'), 'Service worker provides SPA navigation fallback');

  const distSw = path.join(__dirname, '..', 'client', 'dist', 'sw.js');
  assert(fs.existsSync(distSw), 'sw.js successfully bundled into client/dist/ for production');

} finally {
  if (snapshot) {
    fs.writeFileSync(dbFile, snapshot);
    console.log('\n📦 Database snapshot successfully restored.');
  }
}

console.log(`\n========================================`);
console.log(`Phase 1 Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log(`========================================\n`);

if (passed === total) {
  console.log('🎉 All Phase 1 feature and regression assertions passed!');
  process.exit(0);
} else {
  console.error('❌ Some Phase 1 assertions failed.');
  process.exit(1);
}
