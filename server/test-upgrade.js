// CCP Upgrade Regression Tests — Parallel Reassessment, Edge Metadata, Before/After Scores
// Tests for features added in the Code Kernel '26 Upgrade pass.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup database before tests
const dbPath = path.join(__dirname, 'db', 'ccp-data.json');
const backup = fs.readFileSync(dbPath, 'utf-8');

import { generateQuiz, gradeQuiz } from './services/quizEngine.js';
import { getEdgeMetadata, getAllEdges, getAllNodes, getNode } from './data/knowledgeGraph.js';
import { traceGap } from './services/gapTracer.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('🔬 Running CCP Upgrade Regression Suite...\n');

// ========== 1. Parallel Assessment Form Generation ==========
console.log('1. Parallel Assessment Form (Form A vs Form B)');
const quizA = generateQuiz('6_fractions', 'diagnostic');
assert(!quizA.error, 'Form A diagnostic quiz generates without error');
assert(quizA.questions.length === 5, `Form A diagnostic has 5 questions (actual: ${quizA.questions.length})`);

assert(quizA.questions.every(q => q.form === 'A'), 'Initial diagnostic contains Form A items only');

const quizReassess = generateQuiz('6_fractions', 'reassessment');
assert(!quizReassess.error, 'Form B reassessment quiz generates without error');
assert(quizReassess.questions.length === 5, `Form B reassessment has 5 questions (actual: ${quizReassess.questions.length})`);
assert(quizReassess.isReassessment === true, 'Form B quiz flagged as reassessment');

// Check that Form B uses different question IDs from a standard Form A set
const formBIds = quizReassess.questions.map(q => q.id);
const hasFormBItems = formBIds.some(id => id.match(/6f[7-9]|6f1[01]/));
assert(hasFormBItems, 'Form B quiz contains parallel items (6f7-6f11)');

// Sneha's seeded diagnostic is stored in student_mastery, without a raw quiz_attempt row.
const seededReassessment = generateQuiz('6_fractions', 'mastery', 10);
assert(seededReassessment.isReassessment === true, 'Seeded baseline mastery record triggers reassessment');
assert(seededReassessment.isParallelForm === true, 'Seeded reassessment uses a complete parallel form');
assert(seededReassessment.questions.every(q => q.form === 'B'), 'Seeded reassessment contains Form B items only');

// ========== 2. Before/After Score Tracking ==========
console.log('\n2. Before/After Score Progression in Grade Results');

// First: a diagnostic attempt that fails (establishes baseline)
import questions from './data/questions.js';
const fracQs = questions['6_fractions'];
const diagQuiz = generateQuiz('6_fractions', 'diagnostic');
const wrongAnswers = diagQuiz.questions.map(q => {
  const bankQ = fracQs.find(bq => bq.id === q.id);
  const wrong = bankQ && bankQ.answer === 3 ? 1 : 3;
  return { questionId: q.id, selectedOption: wrong };
});
const failResult = gradeQuiz(999, '6_fractions', 'diagnostic', wrongAnswers);
assert(failResult.passed === false, 'Baseline diagnostic correctly fails');
assert(failResult.reassessment !== undefined, 'Grade result contains reassessment block');

// Second: a mastery attempt with correct answers (post-remediation)
const masteryQuiz = generateQuiz('6_fractions', 'mastery', 999);
const correctAnswers = masteryQuiz.questions.map(q => {
  const bankQ = fracQs.find(bq => bq.id === q.id);
  return { questionId: q.id, selectedOption: bankQ ? bankQ.answer : 0 };
});
const passResult = gradeQuiz(999, '6_fractions', 'mastery', correctAnswers);
assert(passResult.passed === true, 'Post-remediation mastery quiz passes');
assert(passResult.reassessment.isReassessment === true, 'Post-remediation flagged as reassessment');
assert(passResult.reassessment.beforeScore !== null, `Before score recorded (${passResult.reassessment.beforeScore})`);
assert(passResult.reassessment.afterPercentage === 100, `After score is 100% (actual: ${passResult.reassessment.afterPercentage})`);
assert(passResult.reassessment.scoreDelta !== null, `Score delta computed (${passResult.reassessment.scoreDelta})`);
assert(passResult.reassessment.statusTransition.from === 'gap_found', `Status transitioned from gap_found (actual: ${passResult.reassessment.statusTransition.from})`);
assert(passResult.reassessment.statusTransition.to === 'mastered', `Status transitioned to mastered (actual: ${passResult.reassessment.statusTransition.to})`);
assert(typeof passResult.reassessment.disclaimer === 'string' && passResult.reassessment.disclaimer.length > 10, 'Disclaimer present (no false learning gain claims)');

// ========== 3. Edge Metadata & NCERT Source Attribution ==========
console.log('\n3. Edge Metadata & NCERT Source Attribution');
const allEdges = getAllEdges();
assert(allEdges.length === 37, `Graph has 37 edges (actual: ${allEdges.length})`);

const meta1 = getEdgeMetadata('6_fractions', '7_fractions_decimals');
assert(meta1.type === 'direct_ncert_dependency', 'Fractions→Fractions&Decimals classified as direct NCERT dependency');
assert(meta1.ncertSource && meta1.ncertSource.length > 5, `NCERT source string present: "${meta1.ncertSource}"`);
assert(meta1.rationale && meta1.rationale.length > 10, 'Pedagogical rationale provided');

const meta2 = getEdgeMetadata('7_simple_equations', '8_algebraic_expressions');
assert(meta2.type === 'pedagogical_assumption', '7_simple_equations→8_algebraic_expressions classified as pedagogical assumption');

const meta3 = getEdgeMetadata('7_ratio_proportion_adv', '8_data_handling');
assert(meta3.type === 'pedagogical_assumption', '7_ratio_proportion_adv→8_data_handling classified as pedagogical assumption');

// Count: exactly 2 pedagogical assumptions, 35 direct
let directCount = 0;
let pedagogicalCount = 0;
for (const [prereq, dep] of allEdges) {
  const m = getEdgeMetadata(prereq, dep);
  if (m.type === 'direct_ncert_dependency') directCount++;
  else if (m.type === 'pedagogical_assumption') pedagogicalCount++;
}
assert(directCount === 35, `35 direct NCERT dependencies (actual: ${directCount})`);
assert(pedagogicalCount === 2, `2 pedagogical assumptions (actual: ${pedagogicalCount})`);

// ========== 4. Node NCERT Book & Chapter Attribution ==========
console.log('\n4. Node NCERT Book & Chapter Attribution');
const allNodes = getAllNodes();
let nodesWithNCERT = 0;
for (const n of allNodes) {
  if (n.ncertBook && n.ncertChapter) nodesWithNCERT++;
}
assert(nodesWithNCERT === 31, `All 31 nodes have ncertBook and ncertChapter (actual: ${nodesWithNCERT})`);

const sampleNode = getNode('8_rational_numbers_adv');
assert(sampleNode.ncertBook === 'NCERT Mathematics Class VIII', `8_rational_numbers_adv ncertBook correct`);
assert(sampleNode.ncertChapter.includes('Chapter 1'), `8_rational_numbers_adv ncertChapter includes Chapter 1`);

// ========== 5. Student-Aware Quiz Generation (Unseen Items) ==========
console.log('\n5. Student-Aware Quiz Generation for Reassessment');
// Student 999 already took a diagnostic quiz. New generation should prefer unseen items.
const quizForStudent = generateQuiz('6_fractions', 'mastery', 999);
assert(!quizForStudent.error, 'Quiz generates successfully for student with prior attempts');
assert(quizForStudent.questions.length === 5, `5 questions generated (actual: ${quizForStudent.questions.length})`);

// ========== RESULTS ==========
console.log(`\n========================================`);
console.log(`Upgrade Regression Results: ${passed} / ${total} passed (${Math.round(passed/total*100)}%)`);
console.log(`========================================`);

if (passed === total) {
  console.log('🎉 All upgrade regression assertions passed!\n');
} else {
  console.error('❌ Some upgrade tests failed.\n');
}

// Restore database
fs.writeFileSync(dbPath, backup, 'utf-8');
console.log('📦 Database snapshot successfully restored.');

process.exit(passed === total ? 0 : 1);
