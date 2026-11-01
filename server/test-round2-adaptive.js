// KakshaSignal Round 2 — Phase 1: Core Learning Engine Automated Verification Suite
// Verifies:
// 1. Correct and incorrect answers grading & scoring
// 2. Misconception identification from student distractors
// 3. Prerequisite tracing linking misconceptions to root causes in the knowledge graph
// 4. Adaptive question selection and difficulty calibration (stepping up/down)
// 5. Question repetition prevention across adaptive sessions
// 6. Progressive hint sequence (Level 1 -> Level 2 -> Level 3 -> Full Explanation)
// 7. Mastery updates after reassessment and reflection on teacher dashboard
// 8. Insufficient diagnostic evidence handling (1 ambiguous mistake = suspected, 2+ = confirmed)

import { traceGap, analyzeMisconception, traceRootGapFromMisconceptions, getClassGapSummary } from './services/gapTracer.js';
import { generateQuiz, gradeQuiz, getQuestionHint, getNextAdaptiveQuestion } from './services/quizEngine.js';
import questions from './data/questions.js';
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

console.log('🔬 Starting KakshaSignal Round 2 Phase 1 Adaptive Engine Verification Suite...\n');

// Snapshot DB to guarantee zero permanent mutations
const dbFile = path.join(__dirname, 'db', 'ccp-data.json');
let snapshot = null;
if (fs.existsSync(dbFile)) {
  snapshot = fs.readFileSync(dbFile, 'utf8');
}

try {
  const db = getDb();

  // ==========================================
  // Section 1: Correct and Incorrect Answers
  // ==========================================
  console.log('1. Correct & Incorrect Answer Evaluation');
  {
    // Generate diagnostic quiz for 8_rational_numbers_adv
    const quiz = generateQuiz('8_rational_numbers_adv', 'diagnostic');
    assert(quiz && Array.isArray(quiz.questions) && quiz.questions.length === 5, 'Generated diagnostic quiz has 5 questions');

    // Submit all correct answers
    const allCorrectAnswers = quiz.questions.map(q => {
      const fullQ = questions['8_rational_numbers_adv'].find(item => item.id === q.id);
      return { questionId: q.id, selectedOption: fullQ.answer };
    });

    // Use isolated evaluation student ID so Sneha's baseline graph state remains pristine
    const evalStudentId = 999;
    const perfectGrade = gradeQuiz(evalStudentId, '8_rational_numbers_adv', 'diagnostic', allCorrectAnswers);
    assert(perfectGrade.passed === true, '100% correct answers passes mastery threshold');
    assert(perfectGrade.score === 1.0, 'Perfect score evaluates to 1.0 (100%)');
    assert(perfectGrade.correct === 5, 'Reports 5/5 correct answers');
    assert(perfectGrade.errorCount === 0, 'Zero errors recorded on perfect submission');

    // Submit mixed answers (3 correct, 2 incorrect = 60%, below 70% threshold)
    const mixedAnswers = quiz.questions.map((q, idx) => {
      const fullQ = questions['8_rational_numbers_adv'].find(item => item.id === q.id);
      return {
        questionId: q.id,
        selectedOption: idx < 3 ? fullQ.answer : (fullQ.answer + 1) % 4
      };
    });

    const failGrade = gradeQuiz(evalStudentId, '8_rational_numbers_adv', 'diagnostic', mixedAnswers);
    assert(failGrade.passed === false, 'Sub-70% score fails mastery threshold');
    assert(failGrade.score === 0.6, 'Evaluates to 60% score');
    assert(failGrade.correct === 3, 'Reports 3/5 correct answers');
    assert(failGrade.errorCount === 2, 'Reports 2 incorrect answers');
    assert(failGrade.results.length === 5, 'Results include itemized review for all 5 questions');
  }

  // ==========================================
  // Section 2: Misconception Identification
  // ==========================================
  console.log('\n2. Misconception Identification from Distractors');
  {
    // Test multiplicative inverse distractor analysis on 8rna2:
    // Option 0 is "2/3" (opposite sign) instead of correct option 1 "-3/2"
    const misc1 = analyzeMisconception('8rna2', 0, '8_rational_numbers_adv');
    assert(misc1.isCorrect === false, 'Incorrect distractor correctly flagged as not correct');
    assert(misc1.label === 'Additive Inverse Sign Confusion', 'Identified misconception: Additive Inverse Sign Confusion');
    assert(misc1.prerequisiteNodeId === '6_integers', 'Traced sign confusion to prerequisite node 6_integers');
    assert(misc1.prerequisiteLabel === 'Integers', 'Prerequisite label clearly identified as Integers');
    assert(typeof misc1.rationale === 'string' && misc1.rationale.length > 10, 'Includes explicit pedagogical rationale for misconception');

    // Test fraction mean distractor analysis on 8rna3:
    // Option 1 is "2/5" (Freshman Sum Fallacy (1+1)/(3+2))
    const misc2 = analyzeMisconception('8rna3', 1, '8_rational_numbers_adv');
    assert(misc2.isCorrect === false, 'Freshman sum distractor flagged as not correct');
    assert(misc2.label === 'Freshman Sum Fallacy', 'Identified misconception: Freshman Sum Fallacy');
    assert(misc2.prerequisiteNodeId === '6_fractions', 'Traced freshman sum to prerequisite node 6_fractions');

    // Test fraction classification distractor analysis on 6f1:
    // Option 1 is "Proper fraction" for 7/3 (numerator > denominator)
    const misc3 = analyzeMisconception('6f1', 1, '6_fractions');
    assert(misc3.isCorrect === false, 'Fraction classification distractor flagged as not correct');
    assert(misc3.label === 'Proper / Improper Inversion', 'Identified misconception: Proper / Improper Inversion');
    assert(misc3.prerequisiteNodeId === '6_fractions', 'Traced to foundational fractions competency');
  }

  // ==========================================
  // Section 3: Prerequisite Tracing via Knowledge Graph
  // ==========================================
  console.log('\n3. Prerequisite Tracing via Knowledge Graph');
  {
    // Trace Sneha Rao (ID 10) who failed 8_rational_numbers_adv
    const trace = traceGap(10, '8_rational_numbers_adv');
    assert(trace.failedNode === '8_rational_numbers_adv', 'Failed node correctly recorded');
    assert(Array.isArray(trace.rootGaps) && trace.rootGaps.length > 0, 'Root gaps populated');
    assert(trace.rootGaps[0].id === '6_fractions', 'Root gap isolated as 6_fractions (Grade 6 Fractions)');
    assert(trace.rootGaps[0].class === 6, 'Root gap confirmed at Class 6 level');
    assert(Array.isArray(trace.recommendedPath) && trace.recommendedPath.length === 3, 'Topological recommended path has 3 steps');
    assert(trace.recommendedPath[0].id === '6_fractions', 'Recommended path step 1 is 6_fractions');
    assert(trace.recommendedPath[1].id === '7_rational_numbers', 'Recommended path step 2 is 7_rational_numbers');
    assert(trace.recommendedPath[2].id === '8_rational_numbers_adv', 'Recommended path step 3 is 8_rational_numbers_adv');
    assert(Array.isArray(trace.traceEdges) && trace.traceEdges.length >= 2, 'Trace edges connect prerequisites across grades');
  }

  // ==========================================
  // Section 4: Adaptive Question Selection & Difficulty Dynamics
  // ==========================================
  console.log('\n4. Adaptive Question Selection & Difficulty Dynamics');
  {
    // Step 1: Initial Question (empty history) -> Starts at medium difficulty
    const step1 = getNextAdaptiveQuestion({
      studentId: 10,
      nodeId: '8_rational_numbers_adv',
      history: []
    });
    assert(step1.shouldStop === false, 'Initial step does not stop');
    assert(step1.nextQuestion !== null, 'Initial question selected');
    assert(step1.currentDifficulty === 'medium', 'Initial question calibrated at medium difficulty');
    assert(step1.sessionStats.totalQuestions === 0, 'History counter initialized to 0');

    // Step 2: Answer Step 1 correctly -> Stepping up difficulty to hard
    const historyStep1 = [
      {
        questionId: step1.nextQuestion.id,
        selectedOption: 0,
        isCorrect: true,
        difficulty: 'medium',
        competency: step1.nextQuestion.competency
      }
    ];

    const step2 = getNextAdaptiveQuestion({
      studentId: 10,
      nodeId: '8_rational_numbers_adv',
      history: historyStep1
    });
    assert(step2.shouldStop === false, 'Continues after 1 correct answer');
    assert(step2.currentDifficulty === 'hard', 'Stepped up difficulty from medium to hard after correct answer');
    assert(step2.adaptationRationale.includes('Stepping up difficulty to hard'), 'Adaptation rationale notes upward difficulty adjustment');
    assert(step2.nextQuestion.id !== step1.nextQuestion.id, 'Next question is distinct from initial question');

    // Step 3: Answer Step 2 incorrectly (distractor indicating sign confusion) -> Step down & probe prerequisite
    const historyStep2 = [
      ...historyStep1,
      {
        questionId: '8rna2',
        selectedOption: 0, // Additive inverse sign confusion
        isCorrect: false,
        difficulty: 'hard',
        competency: 'multiplicative-inverse'
      }
    ];

    const step3 = getNextAdaptiveQuestion({
      studentId: 10,
      nodeId: '8_rational_numbers_adv',
      history: historyStep2
    });
    assert(step3.shouldStop === false, 'Continues diagnostic probing after single error');
    assert(step3.currentDifficulty === 'medium', 'Stepped down difficulty from hard to medium after error');
    assert(step3.suspectedGap !== null, 'Identified suspected learning gap from misconception');
    assert(step3.suspectedGap.nodeId === '6_integers', 'Identified suspected gap in 6_integers from sign confusion');
    assert(step3.confidence === 'suspected', 'Confidence flagged as suspected (tentative single error)');
    assert(step3.adaptationRationale.includes('adaptive diagnostic probe'), 'Rationale confirms serving prerequisite probe');
  }

  // ==========================================
  // Section 5: Question Repetition Prevention
  // ==========================================
  console.log('\n5. Question Repetition Prevention');
  {
    const seenQuestionIds = [];
    let currentHistory = [];

    // Simulate 4 successive questions in an adaptive session
    for (let i = 0; i < 4; i++) {
      const step = getNextAdaptiveQuestion({
        studentId: 10,
        nodeId: '8_rational_numbers_adv',
        history: currentHistory
      });

      if (step.shouldStop || !step.nextQuestion) break;

      const qId = step.nextQuestion.id;
      assert(!seenQuestionIds.includes(qId), `Adaptive question #${i + 1} (${qId}) is non-repeating and previously unseen`);
      seenQuestionIds.push(qId);

      currentHistory.push({
        questionId: qId,
        selectedOption: 0,
        isCorrect: (i % 2 === 0), // Alternate correct and incorrect
        difficulty: step.currentDifficulty,
        competency: step.nextQuestion.competency
      });
    }

    const uniqueCount = new Set(seenQuestionIds).size;
    assert(uniqueCount === seenQuestionIds.length, `Strict uniqueness confirmed: all ${seenQuestionIds.length} served questions are unique`);
  }

  // ==========================================
  // Section 6: Progressive Hint Sequence
  // ==========================================
  console.log('\n6. Progressive Hint Sequence (Level 1 -> 2 -> 3 -> Full Solution)');
  {
    const testQId = '8rna2';

    // Hint 1: Concept Reminder
    const hint1 = getQuestionHint(testQId, 1);
    assert(hint1.hintLevel === 1, 'Hint level 1 requested and returned');
    assert(hint1.hintTitle === 'Concept Reminder', 'Hint 1 title is "Concept Reminder"');
    assert(typeof hint1.hintText === 'string' && hint1.hintText.length > 15, 'Hint 1 provides substantive concept reminder');
    assert(hint1.hasMoreHints === true, 'Hint 1 indicates more hints are available');
    assert(hint1.isFullSolutionAvailable === false, 'Hint 1 does not unlock full solution');
    assert(hint1.explanation === null, 'Hint 1 does not disclose complete explanation or correct option index');

    // Hint 2: Relevant Formula or Method
    const hint2 = getQuestionHint(testQId, 2);
    assert(hint2.hintLevel === 2, 'Hint level 2 requested and returned');
    assert(hint2.hintTitle === 'Relevant Formula / Method', 'Hint 2 title is "Relevant Formula / Method"');
    assert(typeof hint2.hintText === 'string' && hint2.hintText.length > 15, 'Hint 2 provides mathematical formula/rule guidance');
    assert(hint2.hasMoreHints === true, 'Hint 2 indicates more hints are available');
    assert(hint2.explanation === null, 'Hint 2 does not disclose complete explanation');

    // Hint 3: Partial Step-by-Step Guidance
    const hint3 = getQuestionHint(testQId, 3);
    assert(hint3.hintLevel === 3, 'Hint level 3 requested and returned');
    assert(hint3.hintTitle === 'Partial Step-by-Step Guidance', 'Hint 3 title is "Partial Step-by-Step Guidance"');
    assert(hint3.hasMoreHints === false, 'Hint 3 indicates maximum hints reached');
    assert(hint3.isFullSolutionAvailable === true, 'Hint 3 unlocks complete solution view');
    assert(typeof hint3.explanation === 'string' && hint3.explanation.length > 20, 'Hint 3 unlocks full pedagogical explanation');
  }

  // ==========================================
  // Section 7: Mastery Updates After Reassessment
  // ==========================================
  console.log('\n7. Mastery Updates After Reassessment');
  {
    const studentId = 10; // Sneha Rao
    const rootNode = '6_fractions';

    // Set baseline state in db
    const masteryRec = db.tables.student_mastery.find(m => m.student_id === studentId && m.node_id === rootNode);
    if (masteryRec) {
      masteryRec.status = 'gap_found';
      masteryRec.diagnostic_score = 0.2;
      masteryRec.mastery_score = null;
      db.save();
    }

    const initialMastery = db.prepare('SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?')
      .get(studentId, rootNode);
    assert(initialMastery.status === 'gap_found', 'Baseline status confirmed as gap_found');

    // Generate Form B parallel reassessment quiz
    const reassessmentQuiz = generateQuiz(rootNode, 'reassessment', studentId);
    assert(reassessmentQuiz.isReassessment === true, 'Quiz engine flags reassessment attempt');

    // Answer 100% correctly on reassessment
    const correctReassessmentAnswers = reassessmentQuiz.questions.map(q => {
      const fullQ = questions[rootNode].find(item => item.id === q.id);
      return { questionId: q.id, selectedOption: fullQ.answer };
    });

    const gradeResult = gradeQuiz(studentId, rootNode, 'mastery', correctReassessmentAnswers);
    assert(gradeResult.passed === true, 'Reassessment passed with 100%');
    assert(gradeResult.reassessment.isReassessment === true, 'Grade result confirms reassessment tracking');
    assert(gradeResult.reassessment.beforePercentage === 20, 'Before score recorded accurately (20%)');
    assert(gradeResult.reassessment.afterPercentage === 100, 'After score reflects post-remediation mastery (100%)');
    assert(gradeResult.reassessment.scoreDelta === 80, 'Score delta empirically computed (+80%)');

    // Verify DB update
    const updatedMastery = db.prepare('SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?')
      .get(studentId, rootNode);
    assert(updatedMastery.status === 'mastered', 'Database status transitioned to mastered');
    assert(updatedMastery.mastery_score === 1.0, 'Database mastery score recorded as 1.0');

    // Verify Teacher Dashboard Heatmap Reflection
    const classSummary = getClassGapSummary(2); // Class 8-B
    const snehaRow = classSummary.students.find(s => s.id === studentId);
    assert(snehaRow !== undefined, 'Teacher classroom summary includes student row');
    assert(snehaRow.nodeStatuses[rootNode].status === 'mastered', 'Teacher classroom heatmap reflects newly mastered status in real time');
  }

  // ==========================================
  // Section 8: Insufficient Diagnostic Evidence Handling (Ambiguous Single Mistake Protection)
  // ==========================================
  console.log('\n8. Insufficient Diagnostic Evidence Handling (Ambiguous Single Mistake Protection)');
  {
    // Case A: 1 Mistake (Ambiguous / Tentative)
    const singleMistakeAnswers = [
      { questionId: '8rna1', selectedOption: 0, isCorrect: true },
      { questionId: '8rna2', selectedOption: 0, isCorrect: false }, // Single error
      { questionId: '8rna3', selectedOption: 2, isCorrect: true },
      { questionId: '8rna4', selectedOption: 3, isCorrect: true },
      { questionId: '8rna5', selectedOption: 0, isCorrect: true }
    ];

    const singleMistakeTrace = traceRootGapFromMisconceptions(10, '8_rational_numbers_adv', singleMistakeAnswers);
    assert(singleMistakeTrace.errorCount === 1, 'Error count evaluated as 1');
    assert(singleMistakeTrace.confidence === 'suspected', 'Single mistake classified with confidence: "suspected"');
    assert(singleMistakeTrace.isConfirmed === false, 'Single mistake flagged as unconfirmed (isConfirmed: false)');
    assert(singleMistakeTrace.diagnosticEvidence.status === 'suspected_gap', 'Diagnostic status marked as suspected_gap rather than confirmed deficit');
    assert(singleMistakeTrace.gapExplanation.includes('classified as a SUSPECTED gap'), 'Evidence explanation explicitly notes avoidance of premature weakness declaration on single error');

    // Case B: 2+ Corroborated Mistakes (Confirmed Gap)
    const twoMistakesAnswers = [
      { questionId: '8rna1', selectedOption: 0, isCorrect: true },
      { questionId: '8rna2', selectedOption: 0, isCorrect: false }, // Error 1
      { questionId: '8rna3', selectedOption: 1, isCorrect: false }, // Error 2
      { questionId: '8rna4', selectedOption: 3, isCorrect: true },
      { questionId: '8rna5', selectedOption: 0, isCorrect: true }
    ];

    const twoMistakesTrace = traceRootGapFromMisconceptions(10, '8_rational_numbers_adv', twoMistakesAnswers);
    assert(twoMistakesTrace.errorCount === 2, 'Error count evaluated as 2');
    assert(twoMistakesTrace.confidence === 'confirmed', 'Corroborated errors classified with confidence: "confirmed"');
    assert(twoMistakesTrace.isConfirmed === true, 'Corroborated errors confirmed as genuine gap (isConfirmed: true)');
    assert(twoMistakesTrace.gapExplanation.includes('Corroborated by 2 errors'), 'Evidence explanation confirms recurring misconceptions');

    // Case C: Adaptive Early Stopping on Conclusive Prerequisite Gap
    const earlyStopGap = getNextAdaptiveQuestion({
      studentId: 10,
      nodeId: '8_rational_numbers_adv',
      history: [
        { questionId: '8rna2', selectedOption: 0, isCorrect: false, difficulty: 'medium' },
        { questionId: '8rna3', selectedOption: 1, isCorrect: false, difficulty: 'easy' }
      ]
    });
    assert(earlyStopGap.shouldStop === true, 'Adaptive questioning stops early when 2 errors corroborate gap');
    assert(earlyStopGap.stopReason === 'conclusive_prerequisite_gap', 'Early stop reason is "conclusive_prerequisite_gap"');
    assert(earlyStopGap.confidence === 'confirmed', 'Early stop confidence confirmed');

    // Case D: Adaptive Early Stopping on Conclusive Mastery
    const earlyStopMastery = getNextAdaptiveQuestion({
      studentId: 10,
      nodeId: '8_rational_numbers_adv',
      history: [
        { questionId: '8rna1', selectedOption: 0, isCorrect: true, difficulty: 'medium' },
        { questionId: '8rna3', selectedOption: 2, isCorrect: true, difficulty: 'hard' },
        { questionId: '8rna2', selectedOption: 1, isCorrect: true, difficulty: 'hard' }
      ]
    });
    assert(earlyStopMastery.shouldStop === true, 'Adaptive questioning stops early after 3 consecutive correct answers');
    assert(earlyStopMastery.stopReason === 'conclusive_mastery', 'Early stop reason is "conclusive_mastery"');
    assert(earlyStopMastery.confidence === 'confirmed', 'Mastery confidence confirmed');
  }

} finally {
  // Always restore DB snapshot to maintain 100% data integrity
  if (snapshot && fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, snapshot, 'utf8');
    console.log('\n📦 Test database snapshot successfully restored.');
  }
}

console.log('\n======================================================');
console.log(`Adaptive Engine Suite: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('======================================================');

if (passed === total) {
  console.log('\n🎉 All Round 2 Phase 1 feature assertions passed perfectly!');
} else {
  console.error('\n⚠️ Some assertions failed.');
  process.exitCode = 1;
}
