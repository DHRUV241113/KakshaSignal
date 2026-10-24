// Quiz Engine Service
// Handles quiz generation, scoring, and mastery updates

import questions from '../data/questions.js';
import { getDb } from '../db/schema.js';

const DIAGNOSTIC_QUESTION_COUNT = 5;
const PRACTICE_QUESTION_COUNT = 5;
const MASTERY_QUESTION_COUNT = 5;
const MASTERY_THRESHOLD = 0.7; // 70% to pass

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
 */
export function gradeQuiz(studentId, nodeId, quizType, answers, timeTaken = null) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { error: 'Answers must be a non-empty array' };
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

    results.push({
      questionId: ans.questionId,
      selectedOption: ans.selectedOption,
      correctOption: question.answer,
      isCorrect,
      competency: question.competency
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

  return {
    nodeId,
    quizType,
    score,
    percentage: Math.round(score * 100),
    correct,
    total: answers.length,
    passed,
    threshold: MASTERY_THRESHOLD * 100,
    results,
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

export default { generateQuiz, gradeQuiz, getStudentNodeStatus };
