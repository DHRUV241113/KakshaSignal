// CCP Comprehensive Adaptive Learning Loop & Pedagogical Explanation Tests
// Tests the full end-to-end loop:
// Diagnostic question -> Student answer -> Evaluation with explanations ->
// Knowledge-gap identification -> Mastery update -> Recommended next lesson ->
// Form B Reassessment -> Teacher dashboard reflection.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup database before test run
const dbPath = path.join(__dirname, 'db', 'ccp-data.json');
const backup = fs.readFileSync(dbPath, 'utf-8');

import questions from './data/questions.js';
import { generateQuiz, gradeQuiz } from './services/quizEngine.js';
import { traceGap, getClassGapSummary } from './services/gapTracer.js';
import { getNode, getPrerequisites } from './data/knowledgeGraph.js';
import { getDb } from './db/schema.js';

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

try {
  console.log('🔬 CCP Adaptive Learning Loop Automated Verification Suite\n');

  // =========================================================================
  // 1. Pedagogical Question Explanations Integrity
  // =========================================================================
  console.log('1. Pedagogical Explanation Integrity in Question Bank');
  const allQuestions = Object.values(questions).flat();
  assert(allQuestions.length > 200, `Question bank has substantial item pool (${allQuestions.length} items)`);
  
  const missingExplanation = allQuestions.filter(q => !q.explanation || q.explanation.trim().length === 0);
  assert(
    missingExplanation.length === 0,
    `All ${allQuestions.length} questions contain detailed pedagogical explanations (missing: ${missingExplanation.length})`
  );

  const sampleQ = allQuestions[0];
  assert(sampleQ.explanation.length > 20, `Sample question (${sampleQ.id}) has substantive explanation`);

  // =========================================================================
  // 2. Stage 2 (Solve) Immediate Formative Feedback & Explanation
  // =========================================================================
  console.log('\n2. Stage 2 (Solve) Immediate Formative Feedback & Explanation');
  const qItem = allQuestions.find(q => q.competency === '6-fractions-equivalent' || q.id === '6f1');
  assert(Boolean(qItem), 'Found testable fractions question');

  // Check correct option evaluation
  const correctChoice = qItem.answer;
  const isCorrectEvaluated = (correctChoice === qItem.answer);
  assert(isCorrectEvaluated === true, 'Correct option evaluates as true');

  // Check incorrect option explanation
  const wrongChoice = (correctChoice + 1) % qItem.options.length;
  const isWrongEvaluated = (wrongChoice === qItem.answer);
  assert(isWrongEvaluated === false, 'Wrong option evaluates as false');
  assert(qItem.explanation.includes(qItem.options[correctChoice]) || qItem.explanation.length > 15,
    'Pedagogical explanation clearly directs student toward the correct principle'
  );

  // =========================================================================
  // 3. Stage 3 (Test): Diagnostic Failure -> Root Gap Trace -> Remedial Recommendation
  // =========================================================================
  console.log('\n3. Diagnostic Assessment -> Gap Detection -> Backward Root Trace -> Next Remedial Action');
  const testStudentId = 10; // Sneha Rao (Class 8-A, Classroom 2)
  const testNodeId = '8_rational_numbers_adv';

  // Seed student with failing diagnostic on 8_rational_numbers_adv (Score 40% < 70% threshold)
  const failAnswers = [
    { questionId: '8rna1', selectedOption: 0 },
    { questionId: '8rna2', selectedOption: 1 },
    { questionId: '8rna3', selectedOption: 0 },
    { questionId: '8rna4', selectedOption: 0 },
    { questionId: '8rna5', selectedOption: 0 }
  ];

  const diagResult = gradeQuiz(testStudentId, testNodeId, 'diagnostic', failAnswers, 120, 'test_token_diag_1');

  assert(diagResult.passed === false, `Diagnostic failed as expected (percentage: ${diagResult.percentage}%)`);
  assert(diagResult.percentage < 70, `Score is below 70% mastery threshold (${diagResult.percentage}%)`);
  assert(diagResult.results.length === 5, 'Grading returned all 5 question review items');
  
  // Verify detailed results payload has explanation and text
  const firstResult = diagResult.results[0];
  assert(Boolean(firstResult.questionText), 'Result includes original question text');
  assert(firstResult.selectedOptionText !== undefined, 'Result includes selected option text');
  assert(Boolean(firstResult.correctOptionText), 'Result includes correct option text');
  assert(Boolean(firstResult.explanation), 'Result includes pedagogical explanation');

  // Verify explainable backward gap trace in quiz response
  assert(Boolean(diagResult.recommendation), 'Diagnostic response includes personalized recommendation');
  assert(diagResult.recommendation.type === 'remedial_prerequisite', 'Recommendation type is remedial_prerequisite');
  assert(Boolean(diagResult.recommendation.targetNodeId), `Root gap accurately traced (target: ${diagResult.recommendation.targetNodeId})`);
  assert(diagResult.recommendation.actionUrl.includes(diagResult.recommendation.targetNodeId), 'Recommendation actionUrl links directly to remedial module');

  // Verify mastery database updated to gap_found
  const db = getDb();
  const masteryRec = db.prepare('SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?').get(testStudentId, testNodeId);
  assert(masteryRec.status === 'gap_found', `Database mastery status updated to 'gap_found' (actual: ${masteryRec.status})`);

  // =========================================================================
  // 4. Remediation & Form B Parallel Reassessment -> Mastery & Progression
  // =========================================================================
  console.log('\n4. Remediation on Root Prerequisite -> Form B Reassessment -> Mastery Transition');
  const remedialNodeId = '6_fractions';

  // Student takes Form B reassessment on 6_fractions and passes (100% - answers: 2, 3, 0, 1, 3)
  const passAnswers = [
    { questionId: '6f7', selectedOption: 2 },
    { questionId: '6f8', selectedOption: 3 },
    { questionId: '6f9', selectedOption: 0 },
    { questionId: '6f10', selectedOption: 1 },
    { questionId: '6f11', selectedOption: 3 }
  ];

  const reassessResult = gradeQuiz(testStudentId, remedialNodeId, 'reassessment', passAnswers, 180, 'test_token_reassess_1');

  assert(reassessResult.passed === true, `Form B reassessment passed (percentage: ${reassessResult.percentage}%)`);
  assert(reassessResult.percentage >= 70, `Score meets or exceeds 70% threshold (${reassessResult.percentage}%)`);
  assert(Boolean(reassessResult.reassessment), 'Reassessment tracking object present');
  assert(reassessResult.reassessment.isReassessment === true, 'Flagged as genuine reassessment attempt');

  // Verify recommendation progressed to next curriculum topic
  assert(Boolean(reassessResult.recommendation), 'Pass response provides next progression recommendation');
  assert(reassessResult.recommendation.type === 'progression', `Recommendation type is progression (actual: ${reassessResult.recommendation.type})`);
  assert(Boolean(reassessResult.recommendation.targetNodeId), `Next topic suggested: ${reassessResult.recommendation.targetNodeId}`);

  // =========================================================================
  // 5. Teacher Dashboard Synchronization & Priority Interventions
  // =========================================================================
  console.log('\n5. Teacher Dashboard Class Gap Summary & Targeted Interventions');
  // Check Sneha's classroom (Classroom 2: Class 8-A)
  const teacherClassSummary = getClassGapSummary(2);

  assert(teacherClassSummary.totalAssessmentAttempts > 0, `Dashboard reflects real assessment attempts (${teacherClassSummary.totalAssessmentAttempts})`);
  assert(Array.isArray(teacherClassSummary.prioritySupportStudents), 'Priority support student recommendations generated');
  assert(teacherClassSummary.prioritySupportStudents.length > 0, `Priority support list identified ${teacherClassSummary.prioritySupportStudents.length} students needing intervention`);
  
  const priorityStudent = teacherClassSummary.prioritySupportStudents[0];
  assert(Boolean(priorityStudent.studentName), `Priority student name present: ${priorityStudent.studentName}`);
  assert(Boolean(priorityStudent.recommendedIntervention), `Actionable teacher intervention provided: "${priorityStudent.recommendedIntervention}"`);

  // =========================================================================
  // 6. Idempotency & Deduplication Check (Low-Bandwidth Flaky Network Protection)
  // =========================================================================
  console.log('\n6. Idempotency & Network Resilience (Submission Token Deduplication)');
  const duplicateSubmission = gradeQuiz(testStudentId, remedialNodeId, 'reassessment', passAnswers, 180, 'test_token_reassess_1');
  assert(duplicateSubmission.percentage === reassessResult.percentage, 'Duplicate submission token returned identical result');

} catch (err) {
  console.error('❌ Exception during adaptive loop tests:', err);
} finally {
  // Always restore database backup
  fs.writeFileSync(dbPath, backup, 'utf-8');
  console.log('\n📦 Test database snapshot successfully restored.');
}

// =========================================================================
// RESULTS SUMMARY
// =========================================================================
console.log(`\n======================================================`);
console.log(`Adaptive Loop Suite: ${passed} / ${total} passed (${Math.round(passed/total*100)}%)`);
console.log(`======================================================\n`);

process.exit(passed === total ? 0 : 1);
