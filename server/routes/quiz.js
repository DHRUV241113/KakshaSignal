// Quiz routes
import { Router } from 'express';
import { generateQuiz, gradeQuiz, getStudentNodeStatus } from '../services/quizEngine.js';
import questions from '../data/questions.js';

const router = Router();

// Generate a quiz
router.get('/generate/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const quizType = req.query.type || 'diagnostic';
  const studentId = req.query.studentId ? parseInt(req.query.studentId, 10) : null;

  const quiz = generateQuiz(nodeId, quizType, studentId);
  if (quiz.error) {
    return res.status(404).json(quiz);
  }

  res.json(quiz);
});

// Submit a benchmark quiz for grading (High-stakes: graded strictly server-side)
router.post('/submit', (req, res) => {
  const { studentId, nodeId, quizType, answers, timeTaken, submissionToken } = req.body;

  if (!studentId || !nodeId || !quizType || !answers) {
    return res.status(400).json({ error: 'Missing required fields: studentId, nodeId, quizType, answers' });
  }

  const result = gradeQuiz(studentId, nodeId, quizType, answers, timeTaken, submissionToken);
  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Formative practice check (SEC-05: derives correctness from trusted question bank without option-zero assumption)
router.post('/check-practice', (req, res) => {
  const { nodeId, questionId, selectedOption, selectedOptionText } = req.body;

  if (!nodeId || !questionId) {
    return res.status(400).json({ error: 'Missing required fields: nodeId, questionId' });
  }

  const nodeQuestions = questions[nodeId];
  if (!nodeQuestions) {
    return res.status(404).json({ error: `Node questions not found for node: ${nodeId}` });
  }

  const q = nodeQuestions.find(item => item.id === questionId);
  if (!q) {
    return res.status(404).json({ error: `Question ${questionId} not found` });
  }

  // Derive correctness from trusted question bank
  let isCorrect = false;
  if (selectedOptionText !== undefined && typeof selectedOptionText === 'string') {
    // Direct text comparison against correct option text (completely immune to option index shuffling)
    const expectedCorrectText = q.options[q.answer];
    isCorrect = (expectedCorrectText.trim().toLowerCase() === selectedOptionText.trim().toLowerCase());
  } else if (typeof selectedOption === 'number') {
    // Index-based comparison against trusted answer index in question bank
    isCorrect = (q.answer === selectedOption);
  }

  res.json({
    questionId,
    nodeId,
    isCorrect,
    explanation: q.explanation || (isCorrect ? '✅ Excellent! Your reasoning is correct.' : '💡 Not quite. Re-check the prerequisite rule above and try again.')
  });
});

// Get student's status for a specific node
router.get('/status/:studentId/:nodeId', (req, res) => {
  const { studentId, nodeId } = req.params;
  const status = getStudentNodeStatus(parseInt(studentId, 10), nodeId);
  res.json(status);
});

export default router;
