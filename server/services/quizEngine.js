// Quiz Engine Service
// Handles quiz generation, scoring, and mastery updates

import questions from '../data/questions.js';
import { getDb } from '../db/schema.js';
import knowledgeGraph, { getNode, getPrerequisites } from '../data/knowledgeGraph.js';
import { traceGap, analyzeMisconception, traceRootGapFromMisconceptions } from './gapTracer.js';

const DIAGNOSTIC_QUESTION_COUNT = 5;
const PRACTICE_QUESTION_COUNT = 5;
const MASTERY_QUESTION_COUNT = 5;
const MASTERY_THRESHOLD = 0.7; // 70% to pass

// In-memory idempotency cache for deduplicating rapid clicks or resubmissions
const recentSubmissions = new Map();
const IDEMPOTENCY_WINDOW_MS = 20000; // 20 seconds window

function cleanExpiredSubmissions() {
  const now = Date.now();
  for (const [key, item] of recentSubmissions.entries()) {
    if (now - item.timestamp > 300000) { // 5 minutes max retention
      recentSubmissions.delete(key);
    }
  }
}

/**
 * Generate a quiz for a given node and type.
 * Supports parallel assessment forms (Form A for initial diagnostic, Form B for reassessment).
 * If studentId is supplied, filters out previously attempted questions to serve unseen reassessment items.
 */
export function generateQuiz(nodeId, quizType = 'diagnostic', studentId = null) {
  const nodeQuestions = questions[nodeId];
  if (!nodeQuestions || nodeQuestions.length === 0) {
    return { error: `No questions available for node: ${nodeId}` };
  }

  let count;
  switch (quizType) {
    case 'diagnostic': count = DIAGNOSTIC_QUESTION_COUNT; break;
    case 'practice': count = PRACTICE_QUESTION_COUNT; break;
    case 'mastery': count = MASTERY_QUESTION_COUNT; break;
    case 'reassessment': count = MASTERY_QUESTION_COUNT; break;
    default: count = DIAGNOSTIC_QUESTION_COUNT;
  }

  const formAQuestions = nodeQuestions.filter(q => q.form !== 'B');
  const formBQuestions = nodeQuestions.filter(q => q.form === 'B');

  let pool = formAQuestions;
  let isReassessment = false;
  let formLabel = 'A (Standard Form)';

  if (studentId) {
    try {
      const db = getDb();
      const previousAttempts = db.prepare(
        'SELECT questions_json FROM quiz_attempts WHERE student_id = ? AND node_id = ?'
      ).all(studentId, nodeId);
      const priorMastery = db.prepare(
        'SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?'
      ).get(studentId, nodeId);

      const hasRecordedAssessment = Boolean(
        priorMastery && (
          (priorMastery.attempts || 0) > 0 ||
          priorMastery.diagnostic_score !== null ||
          priorMastery.status === 'gap_found'
        )
      );

      if ((previousAttempts && previousAttempts.length > 0) || hasRecordedAssessment) {
        isReassessment = true;
        const seenIds = new Set();
        for (const att of previousAttempts || []) {
          try {
            const ids = JSON.parse(att.questions_json || '[]');
            ids.forEach(id => seenIds.add(id));
          } catch (_) {}
        }

        const unseenFormB = formBQuestions.filter(q => !seenIds.has(q.id));
        const unseen = nodeQuestions.filter(q => !seenIds.has(q.id));
        if (unseenFormB.length >= count) {
          pool = unseenFormB;
          formLabel = 'B (Parallel Reassessment Form)';
        } else if (unseen.length >= count) {
          pool = unseen;
        } else {
          // A full unseen set is unavailable; retain a five-question quiz and
          // disclose the fallback form in the returned label.
          pool = nodeQuestions;
        }
      }
    } catch (_) {}
  } else if (quizType === 'reassessment') {
    isReassessment = true;
    pool = formBQuestions.length >= count ? formBQuestions : formAQuestions;
  }

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  const isParallelForm = selected.length === count && selected.every(q => q.form === 'B');

  if (isReassessment && selected.length > 0) {
    if (isParallelForm) {
      formLabel = 'B (Parallel Reassessment Form)';
    } else if (selected.some(q => q.form === 'B')) {
      formLabel = 'Mixed (Reassessment Items)';
    } else {
      formLabel = 'A (Reassessment Items)';
    }
  }

  // Return questions without answers (for client)
  return {
    nodeId,
    quizType,
    isReassessment,
    isParallelForm,
    form: formLabel,
    totalQuestions: selected.length,
    questions: selected.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      competency: q.competency,
      form: q.form || 'A'
    }))
  };
}

/**
 * Grade a submitted quiz and update mastery status.
 * @param {number} studentId
 * @param {string} nodeId
 * @param {string} quizType - 'diagnostic' | 'practice' | 'mastery'
 * @param {Array} answers - Array of { questionId, selectedOption }
 * @param {number|null} timeTaken - seconds
 * @param {string|null} submissionToken - idempotency token
 */
export function gradeQuiz(studentId, nodeId, quizType, answers, timeTaken = null, submissionToken = null) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { error: 'Answers must be a non-empty array' };
  }

  cleanExpiredSubmissions();

  // Deduplication check: by explicit token or by student+node+quizType+answers fingerprint
  const answersFingerprint = answers
    .map(a => `${a.questionId}:${a.selectedOption}`)
    .sort()
    .join('|');
  const fallbackKey = `fp_${studentId}_${nodeId}_${quizType}_${answersFingerprint}`;

  if (submissionToken && recentSubmissions.has(submissionToken)) {
    const cached = recentSubmissions.get(submissionToken);
    return { ...cached.result, deduplicated: true, cachedAt: cached.timestamp };
  }

  if (recentSubmissions.has(fallbackKey)) {
    const cached = recentSubmissions.get(fallbackKey);
    if (Date.now() - cached.timestamp < IDEMPOTENCY_WINDOW_MS) {
      return { ...cached.result, deduplicated: true, cachedAt: cached.timestamp };
    }
  }

  const nodeQuestions = questions[nodeId];
  if (!nodeQuestions) {
    return { error: `No questions for node: ${nodeId}` };
  }

  const questionMap = {};
  for (const q of nodeQuestions) {
    questionMap[q.id] = q;
  }

  let correct = 0;
  const results = [];

  for (const ans of answers) {
    const question = questionMap[ans.questionId];
    if (!question) continue;

    const isCorrect = question.answer === ans.selectedOption;
    if (isCorrect) correct++;

    const compLabel = (question.competency || 'general').replace(/-/g, ' ');
    const correctOptText = question.options ? question.options[question.answer] : '';
    const selectedOptText = question.options && ans.selectedOption !== undefined && ans.selectedOption !== null ? question.options[ans.selectedOption] : null;

    let misconception = null;
    if (!isCorrect) {
      misconception = analyzeMisconception(ans.questionId, ans.selectedOption, nodeId);
    }

    results.push({
      questionId: ans.questionId,
      questionText: question.text,
      selectedOption: ans.selectedOption,
      selectedOptionText: selectedOptText,
      correctOption: question.answer,
      correctOptionText: correctOptText,
      isCorrect,
      explanation: question.explanation || (isCorrect
        ? `Correct! The rule for ${compLabel} confirms "${correctOptText}" is the accurate solution.`
        : `Incorrect. The correct answer is "${correctOptText}". Review the foundational property for ${compLabel}.`),
      competency: question.competency,
      difficulty: question.difficulty || 'medium',
      misconception
    });
  }

  const score = answers.length > 0 ? correct / answers.length : 0;
  const passed = score >= MASTERY_THRESHOLD;

  // Retrieve prior state before updating database to record before-and-after progression
  const db = getDb();
  const rawPrior = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?'
  ).get(studentId, nodeId);
  const priorMastery = rawPrior ? { ...rawPrior } : null;

  const isReassessment = Boolean(
    priorMastery && (
      (priorMastery.attempts || 0) > 0 ||
      priorMastery.diagnostic_score !== null ||
      priorMastery.status === 'gap_found'
    )
  );
  const beforeScore = priorMastery?.diagnostic_score ?? priorMastery?.mastery_score ?? null;
  const beforePercentage = beforeScore !== null ? Math.round(beforeScore * 100) : null;

  // Save attempt to database
  db.prepare(`
    INSERT INTO quiz_attempts (student_id, node_id, quiz_type, questions_json, answers_json, score, total_questions, correct_answers, time_taken_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId, nodeId, quizType,
    JSON.stringify(answers.map(a => a.questionId)),
    JSON.stringify(answers.map(a => a.selectedOption)),
    score, answers.length, correct, timeTaken
  );

  // Update mastery status
  updateMasteryStatus(studentId, nodeId, quizType, score, passed);

  // Log activity
  db.prepare(`
    INSERT INTO activity_log (student_id, node_id, activity_type, details)
    VALUES (?, ?, ?, ?)
  `).run(studentId, nodeId, `quiz_${quizType}`, JSON.stringify({ score, passed, correct, total: answers.length }));

  const nextStatus = passed ? 'mastered' : (quizType === 'diagnostic' ? 'gap_found' : (priorMastery?.status || 'learning'));

  // Derive next adaptive recommendation based on mastery outcome
  let recommendation = null;
  if (!passed) {
    try {
      const trace = traceGap(studentId, nodeId);
      if (trace && trace.rootGaps && trace.rootGaps.length > 0) {
        const rootGap = trace.rootGaps[0];
        const targetNodeObj = getNode(nodeId);
        recommendation = {
          type: 'remedial_prerequisite',
          targetNodeId: rootGap.id,
          targetLabel: rootGap.label,
          targetClass: rootGap.class,
          chapter: rootGap.chapter,
          ncertChapter: rootGap.ncertChapter,
          rationale: rootGap.rationale,
          title: `Strengthen Foundational Prerequisite: ${rootGap.label}`,
          message: `Your assessment identified difficulty in ${targetNodeObj?.label || nodeId}. This builds directly upon ${rootGap.label} from Grade ${rootGap.class}. Remedying this foundation first will make your current class topics straightforward.`,
          actionUrl: `/learn-solve-test/${rootGap.id}?tab=learn`,
          actionLabel: `Start Remedial Loop on ${rootGap.label} (Grade ${rootGap.class}) →`
        };
      }
    } catch (_) {}
  } else {
    try {
      const student = db.prepare(`
        SELECT s.*, c.class_level FROM students s
        JOIN classrooms c ON s.classroom_id = c.id WHERE s.id = ?
      `).get(studentId);
      const studentClass = student?.class_level || 8;
      
      const allGraphNodes = knowledgeGraph.nodes || [];
      const masteryList = db.prepare('SELECT node_id, status FROM student_mastery WHERE student_id = ?').all(studentId);
      const masteredSet = new Set(masteryList.filter(m => m.status === 'mastered').map(m => m.node_id));
      masteredSet.add(nodeId);

      const directDependents = allGraphNodes.filter(n => {
        if (masteredSet.has(n.id) || n.class > studentClass) return false;
        const prereqs = getPrerequisites(n.id);
        return prereqs.includes(nodeId);
      });

      const nextNode = directDependents.length > 0
        ? directDependents[0]
        : allGraphNodes.find(n => !masteredSet.has(n.id) && n.class <= studentClass);

      if (nextNode) {
        const currentObj = getNode(nodeId);
        recommendation = {
          type: 'progression',
          targetNodeId: nextNode.id,
          targetLabel: nextNode.label,
          targetClass: nextNode.class,
          chapter: nextNode.chapter,
          ncertChapter: nextNode.ncertChapter,
          title: `Next Curriculum Step: ${nextNode.label}`,
          message: `Great job mastering ${currentObj?.label || nodeId}! You are now ready to progress to ${nextNode.label} (Grade ${nextNode.class}).`,
          actionUrl: `/learn-solve-test/${nextNode.id}?tab=learn`,
          actionLabel: `Proceed to ${nextNode.label} →`
        };
      }
    } catch (_) {}
  }

  const errorCount = answers.length - correct;
  const isSingleAmbiguousMistake = (errorCount === 1);
  const confidence = errorCount === 0 ? 'none' : (isSingleAmbiguousMistake ? 'suspected' : 'confirmed');

  const finalResponse = {
    nodeId,
    quizType,
    score,
    percentage: Math.round(score * 100),
    correct,
    total: answers.length,
    errorCount,
    confidence,
    isSingleAmbiguousMistake,
    passed,
    threshold: MASTERY_THRESHOLD * 100,
    results,
    recommendation,
    // Identify weak competencies
    weakCompetencies: results.filter(r => !r.isCorrect).map(r => r.competency),
    // Before & after progression evidence
    reassessment: {
      isReassessment,
      beforeScore,
      beforePercentage,
      afterScore: score,
      afterPercentage: Math.round(score * 100),
      scoreDelta: beforeScore !== null ? Math.round((score - beforeScore) * 100) : null,
      statusTransition: {
        from: priorMastery?.status || 'not_started',
        to: nextStatus
      },
      attempts: (priorMastery?.attempts || 0) + 1,
      disclaimer: "Demonstration of simulated mastery transition. Does not claim real-world clinical learning gains from synthetic demo data."
    }
  };

  // Cache for idempotency deduplication
  const now = Date.now();
  recentSubmissions.set(fallbackKey, { result: finalResponse, timestamp: now });
  if (submissionToken) {
    recentSubmissions.set(submissionToken, { result: finalResponse, timestamp: now });
  }

  return finalResponse;
}

/**
 * Update the student_mastery table based on quiz results.
 */
function updateMasteryStatus(studentId, nodeId, quizType, score, passed) {
  const db = getDb();

  // Ensure record exists
  db.prepare(`
    INSERT OR IGNORE INTO student_mastery (student_id, node_id, status)
    VALUES (?, ?, 'not_started')
  `).run(studentId, nodeId);

  const current = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?'
  ).get(studentId, nodeId);

  let newStatus;
  const updateFields = { attempts: (current?.attempts || 0) + 1 };

  switch (quizType) {
    case 'diagnostic':
      updateFields.diagnostic_score = score;
      if (passed) {
        newStatus = 'mastered'; // Already knows this topic
        updateFields.mastery_score = score;
      } else {
        newStatus = 'gap_found'; // Gap identified
      }
      break;

    case 'practice':
      updateFields.practice_score = score;
      newStatus = passed ? 'testing' : 'practicing'; // Stay in practice or move to test
      break;

    case 'mastery':
      updateFields.mastery_score = score;
      newStatus = passed ? 'mastered' : 'learning'; // Mastered or back to learning
      break;
  }

  db.prepare(`
    UPDATE student_mastery
    SET status = ?, diagnostic_score = COALESCE(?, diagnostic_score),
        practice_score = COALESCE(?, practice_score),
        mastery_score = COALESCE(?, mastery_score),
        attempts = ?, last_activity = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND node_id = ?
  `).run(
    newStatus,
    updateFields.diagnostic_score ?? null,
    updateFields.practice_score ?? null,
    updateFields.mastery_score ?? null,
    updateFields.attempts,
    studentId, nodeId
  );
}

/**
 * Get a student's current Learn-Solve-Test status for a node.
 */
export function getStudentNodeStatus(studentId, nodeId) {
  const db = getDb();
  const mastery = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ? AND node_id = ?'
  ).get(studentId, nodeId);

  const attempts = db.prepare(
    'SELECT * FROM quiz_attempts WHERE student_id = ? AND node_id = ? ORDER BY created_at DESC'
  ).all(studentId, nodeId);

  return {
    nodeId,
    mastery: mastery || { status: 'not_started', diagnostic_score: null, practice_score: null, mastery_score: null, attempts: 0 },
    recentAttempts: attempts.slice(0, 5)
  };
}

/**
 * Progressive Hint System: Fetch Level 1, Level 2, or Level 3 hint for a question.
 * Hint 1: Concept Reminder
 * Hint 2: Formula or Method
 * Hint 3: Partial Step-by-Step Guidance
 * After hints are exhausted, provide full solution and explanation.
 */
export function getQuestionHint(questionId, hintLevel = 1) {
  let q = null;
  let qNodeId = null;
  for (const [nodeId, qList] of Object.entries(questions)) {
    const match = qList.find(item => item.id === questionId);
    if (match) {
      q = match;
      qNodeId = nodeId;
      break;
    }
  }

  if (!q) {
    return { error: `Question not found: ${questionId}` };
  }

  const level = Math.max(1, Math.min(3, parseInt(hintLevel, 10) || 1));
  const hints = Array.isArray(q.hints) && q.hints.length === 3 ? q.hints : [
    `Concept Reminder: Focus on the core definition of ${q.competency || 'this topic'} in Grade ${getNode(qNodeId)?.class || 6} Mathematics.`,
    `Formula / Method: Apply the standard NCERT curriculum procedure for ${q.competency || 'this operation'}.`,
    `Step-by-Step Guidance: Read the question stem: "${q.text}". Test each option systematically.`
  ];

  const hintText = hints[level - 1] || hints[hints.length - 1];
  const hasMoreHints = level < 3;
  const isFullSolutionAvailable = (level >= 3);

  return {
    questionId: q.id,
    hintLevel: level,
    hintTitle: level === 1 ? 'Concept Reminder' : (level === 2 ? 'Relevant Formula / Method' : 'Partial Step-by-Step Guidance'),
    hintText,
    maxHints: 3,
    hasMoreHints,
    isFullSolutionAvailable,
    explanation: isFullSolutionAvailable ? q.explanation : null
  };
}

/**
 * Adaptive Question Selection:
 * Selects the next question based on student performance in the current session.
 * Features:
 * - Dynamically changes next question based on answers
 * - Steps up difficulty on correct answer; steps down on incorrect
 * - Probes weak prerequisite concepts when a misconception is identified
 * - Prevents question repetition across the assessment
 * - Stops diagnostic questioning when sufficient evidence is collected (early stopping)
 * - Preserves Form A/B functionality
 */
export function getNextAdaptiveQuestion({ studentId, nodeId, history = [], form = 'A', quizType = 'diagnostic' }) {
  const targetNode = getNode(nodeId);
  if (!targetNode) {
    return { error: `Node '${nodeId}' not found in knowledge graph` };
  }

  const nodeQuestions = questions[nodeId] || [];
  const seenIds = new Set((history || []).map(h => h.questionId));

  // Compute session stats
  const totalAnswered = history.length;
  const correctCount = history.filter(h => h.isCorrect).length;
  const errorCount = history.filter(h => !h.isCorrect).length;

  // Compute consecutive streak from the end
  let currentStreak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].isCorrect) currentStreak++;
    else break;
  }

  const lastResponse = history.length > 0 ? history[history.length - 1] : null;

  // Determine difficulty
  let currentDifficulty = 'medium';
  if (lastResponse) {
    const prevDiff = lastResponse.difficulty || 'medium';
    if (lastResponse.isCorrect) {
      if (prevDiff === 'easy') currentDifficulty = 'medium';
      else if (prevDiff === 'medium') currentDifficulty = 'hard';
      else currentDifficulty = 'hard';
    } else {
      if (prevDiff === 'hard') currentDifficulty = 'medium';
      else if (prevDiff === 'medium') currentDifficulty = 'easy';
      else currentDifficulty = 'easy';
    }
  }

  // Evaluate Early Stopping Criteria
  // 1. Conclusive Mastery: 3 consecutive correct answers or 4 correct with 0 errors
  if ((totalAnswered >= 3 && currentStreak >= 3) || (correctCount >= 4 && errorCount === 0)) {
    return {
      nextQuestion: null,
      shouldStop: true,
      stopReason: 'conclusive_mastery',
      confidence: 'confirmed',
      adaptationRationale: `Student achieved ${currentStreak} consecutive correct answers at ${currentDifficulty} difficulty with high accuracy (${correctCount}/${totalAnswered}). Mastery conclusively verified with early stopping.`,
      sessionStats: {
        totalQuestions: totalAnswered,
        correctCount,
        errorCount,
        streak: currentStreak,
        currentScore: correctCount / totalAnswered
      },
      suspectedGap: null,
      identifiedGap: null
    };
  }

  // 2. Conclusive Prerequisite Gap: 2 or more corroborated errors
  if (errorCount >= 2) {
    const trace = traceRootGapFromMisconceptions(studentId, nodeId, history);
    const rootGap = trace.rootGaps && trace.rootGaps.length > 0 ? trace.rootGaps[0] : null;
    return {
      nextQuestion: null,
      shouldStop: true,
      stopReason: 'conclusive_prerequisite_gap',
      confidence: 'confirmed',
      adaptationRationale: `Student made ${errorCount} corroborated errors indicating an underlying conceptual deficit. Prerequisite root cause conclusively traced to ${rootGap?.label || 'foundational topic'}. Early diagnostic termination invoked to initiate remediation.`,
      sessionStats: {
        totalQuestions: totalAnswered,
        correctCount,
        errorCount,
        streak: currentStreak,
        currentScore: correctCount / totalAnswered
      },
      suspectedGap: rootGap,
      identifiedGap: rootGap
    };
  }

  // 3. Max questions limit reached
  if (totalAnswered >= 5) {
    return {
      nextQuestion: null,
      shouldStop: true,
      stopReason: 'session_limit_reached',
      confidence: errorCount === 1 ? 'suspected' : (errorCount === 0 ? 'confirmed' : 'confirmed'),
      adaptationRationale: 'Assessment question limit reached. Diagnostic complete.',
      sessionStats: {
        totalQuestions: totalAnswered,
        correctCount,
        errorCount,
        streak: currentStreak,
        currentScore: correctCount / totalAnswered
      },
      suspectedGap: null,
      identifiedGap: null
    };
  }

  // Next Question Selection Strategy
  let selectedQuestion = null;
  let selectedNodeId = nodeId;
  let adaptationRationale = '';
  let suspectedGap = null;
  let confidence = 'none';

  if (totalAnswered === 0) {
    // Initial Question: Pick medium (or easy) baseline from target node
    const candidates = nodeQuestions.filter(q => !seenIds.has(q.id) && (form ? q.form === form : true));
    selectedQuestion = candidates.find(q => q.difficulty === 'medium') || candidates[0] || nodeQuestions[0];
    adaptationRationale = 'Initial calibration question served at medium difficulty to benchmark baseline knowledge.';
  } else if (lastResponse && !lastResponse.isCorrect && errorCount === 1) {
    // Single error: Investigate misconception and probe prerequisite concept
    confidence = 'suspected';
    const misc = analyzeMisconception(lastResponse.questionId, lastResponse.selectedOption, nodeId);
    const prereqNodeId = misc.prerequisiteNodeId;
    suspectedGap = {
      nodeId: prereqNodeId,
      label: misc.prerequisiteLabel,
      class: misc.prerequisiteClass,
      misconception: misc.label,
      rationale: misc.rationale
    };

    // Check if prerequisite questions exist and have an unseen item
    const prereqQuestions = questions[prereqNodeId] || [];
    const unseenPrereq = prereqQuestions.filter(q => !seenIds.has(q.id));

    if (unseenPrereq.length > 0) {
      selectedQuestion = unseenPrereq.find(q => q.difficulty === currentDifficulty) || unseenPrereq[0];
      selectedNodeId = prereqNodeId;
      adaptationRationale = `Incorrect response indicated potential ${misc.label}. Serving an adaptive diagnostic probe from prerequisite ${misc.prerequisiteLabel} (Grade ${misc.prerequisiteClass}) to test whether the gap is foundational.`;
    } else {
      const unseenTarget = nodeQuestions.filter(q => !seenIds.has(q.id));
      selectedQuestion = unseenTarget.find(q => q.difficulty === currentDifficulty) || unseenTarget[0];
      adaptationRationale = `Incorrect response indicated difficulty with ${misc.label}. Stepping down difficulty to ${currentDifficulty} to evaluate foundational understanding.`;
    }
  } else {
    // After correct response: Pick unseen from target node matching stepped-up difficulty
    const unseenTarget = nodeQuestions.filter(q => !seenIds.has(q.id));
    selectedQuestion = unseenTarget.find(q => q.difficulty === currentDifficulty) || unseenTarget[0];
    adaptationRationale = `Previous answer was correct. Stepping up difficulty to ${currentDifficulty} to evaluate deeper conceptual proficiency.`;
  }

  // Safety fallback if no question found
  if (!selectedQuestion) {
    return {
      nextQuestion: null,
      shouldStop: true,
      stopReason: 'question_pool_exhausted',
      confidence: errorCount === 1 ? 'suspected' : (errorCount === 0 ? 'confirmed' : 'confirmed'),
      adaptationRationale: 'All available assessment items for this node and its prerequisites have been attempted.',
      sessionStats: {
        totalQuestions: totalAnswered,
        correctCount,
        errorCount,
        streak: currentStreak,
        currentScore: totalAnswered > 0 ? correctCount / totalAnswered : null
      },
      suspectedGap,
      identifiedGap: null
    };
  }

  return {
    nextQuestion: {
      id: selectedQuestion.id,
      text: selectedQuestion.text,
      options: selectedQuestion.options,
      competency: selectedQuestion.competency,
      difficulty: selectedQuestion.difficulty || currentDifficulty,
      form: selectedQuestion.form || 'A',
      hintsCount: 3,
      nodeId: selectedNodeId
    },
    shouldStop: false,
    stopReason: null,
    currentDifficulty: selectedQuestion.difficulty || currentDifficulty,
    adaptationRationale,
    sessionStats: {
      totalQuestions: totalAnswered,
      correctCount,
      errorCount,
      streak: currentStreak,
      currentScore: totalAnswered > 0 ? correctCount / totalAnswered : null
    },
    suspectedGap,
    confidence
  };
}

export default {
  generateQuiz,
  gradeQuiz,
  getStudentNodeStatus,
  getQuestionHint,
  getNextAdaptiveQuestion
};
