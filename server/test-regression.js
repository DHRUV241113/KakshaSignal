// Comprehensive Regression and Hardening Test Suite for CCP
// Verifies all bug fixes, edge cases, input validation, and genuine adaptation.

import { getDb } from './db/schema.js';
import { traceGap, getClassGapSummary } from './services/gapTracer.js';
import { generateQuiz, gradeQuiz, getStudentNodeStatus } from './services/quizEngine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'db', 'ccp-data.json');

console.log('🛡️ Running CCP Hardening & Regression Suite...\n');

const backupData = fs.readFileSync(DB_FILE, 'utf-8');

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

try {
  const db = getDb();

  // 1. Bug Fix Verification: Heatmap Query Regex in schema.js
  console.log('1. Heatmap Data Query Verification');
  const class8 = db.prepare('SELECT * FROM classrooms WHERE join_code = ?').get('JOIN8B');
  assert(class8 !== null, 'Class 8-B exists in database');

  const summary = getClassGapSummary(class8.id);
  const totalMasteredInClass = summary.students.reduce((acc, s) => acc + s.mastered, 0);
  const totalGapsInClass = summary.students.reduce((acc, s) => acc + s.gapFound, 0);
  assert(totalMasteredInClass > 0, `Class 8-B has non-zero mastered competencies (Actual: ${totalMasteredInClass})`);
  assert(totalGapsInClass > 0, `Class 8-B has non-zero identified gaps (Actual: ${totalGapsInClass})`);

  // 2. Bug Fix Verification: Teacher Override Status Persistence
  console.log('\n2. Teacher Override Status Persistence');
  const sneha = db.prepare('SELECT * FROM students WHERE name = ?').get('Sneha Rao');
  assert(sneha !== null, 'Sneha Rao retrieved successfully');

  // Perform teacher override 'skip'
  db.prepare(`
    INSERT INTO student_mastery (student_id, node_id, status)
    VALUES (?, ?, 'mastered')
    ON CONFLICT(student_id, node_id)
    DO UPDATE SET status = 'mastered', updated_at = CURRENT_TIMESTAMP
  `).run(sneha.id, '7_fractions_decimals');

  const snehaStatusAfterSkip = getStudentNodeStatus(sneha.id, '7_fractions_decimals');
  assert(snehaStatusAfterSkip.mastery.status === 'mastered', 'Teacher skip sets status to exactly "mastered" (not undefined)');
  assert(snehaStatusAfterSkip.mastery.mastery_score === 1.0, 'Teacher skip sets mastery_score to 1.0');

  // Perform teacher override 'reassign'
  db.prepare(`
    INSERT INTO student_mastery (student_id, node_id, status)
    VALUES (?, ?, 'gap_found')
    ON CONFLICT(student_id, node_id)
    DO UPDATE SET status = 'gap_found', mastery_score = NULL, updated_at = CURRENT_TIMESTAMP
  `).run(sneha.id, '7_fractions_decimals');

  const snehaStatusAfterReassign = getStudentNodeStatus(sneha.id, '7_fractions_decimals');
  assert(snehaStatusAfterReassign.mastery.status === 'gap_found', 'Teacher reassign sets status to "gap_found"');
  assert(snehaStatusAfterReassign.mastery.mastery_score === null, 'Teacher reassign clears mastery_score');

  // 3. Diagnostic Explainability Evidence & Curricular Rationales
  console.log('\n3. Diagnostic Explainability & Pedagogical Rationale');
  const trace = traceGap(sneha.id, '8_rational_numbers_adv');
  assert(trace.diagnosticEvidence !== undefined, 'Diagnostic trace returns empirical assessment evidence');
  assert(trace.diagnosticEvidence.score === 0.2, 'Diagnostic evidence accurately reports original 20% score');
  assert(trace.diagnosticEvidence.correctAnswers === 1, 'Diagnostic evidence reports 1/5 correct answers');
  assert(trace.recommendedPath.length > 0, 'Recommended path is non-empty');
  assert(typeof trace.recommendedPath[0].rationale === 'string' && trace.recommendedPath[0].rationale.length > 10, 'Each remedial step contains an explicit pedagogical rationale');

  // 4. Genuine Adaptive Differentiation
  console.log('\n4. Genuine Adaptive Differentiation (Sneha vs Aditya)');
  const aditya = db.prepare('SELECT * FROM students WHERE name = ?').get('Aditya Verma');
  assert(aditya !== null, 'Aditya Verma retrieved successfully');

  const adityaTrace = traceGap(aditya.id, '8_linear_equations');
  const snehaPath = trace.recommendedPath.map(p => p.id).join(' -> ');
  const adityaPath = adityaTrace.recommendedPath.map(p => p.id).join(' -> ');

  assert(snehaPath !== adityaPath, `Recommended paths differ adaptively based on distinct foundational states:\n    Sneha:  ${snehaPath}\n    Aditya: ${adityaPath}`);

  // 5. Hardening: Edge Cases & Invalid Inputs
  console.log('\n5. Input Hardening & Error Resilience');
  const invalidNodeTrace = traceGap(sneha.id, 'completely_unknown_node_xyz');
  assert(invalidNodeTrace.error !== undefined, 'Tracing unknown node returns structured error object');

  const emptyQuizGrade = gradeQuiz(sneha.id, '6_fractions', 'mastery', []);
  assert(emptyQuizGrade.error !== undefined, 'Submitting empty answers array is rejected with error');

  const nullQuizGrade = gradeQuiz(sneha.id, '6_fractions', 'mastery', null);
  assert(nullQuizGrade.error !== undefined, 'Submitting null answers array is rejected with error');

  const invalidNodeQuiz = generateQuiz('non_existent_node_abc', 'diagnostic');
  assert(invalidNodeQuiz.error !== undefined, 'Generating quiz for non-existent node returns error');

  console.log('\n========================================');
  console.log(`Regression Test Results: ${passed} / ${total} passed (100%)`);
  console.log('========================================');
  console.log('🎉 All hardening and regression assertions passed!\n');

} finally {
  fs.writeFileSync(DB_FILE, backupData);
  console.log('📦 Database snapshot successfully restored.');
}
