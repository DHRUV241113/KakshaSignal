// Quiz routes
import { Router } from 'express';
import { generateQuiz, gradeQuiz, getStudentNodeStatus } from '../services/quizEngine.js';

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

// Submit a quiz for grading
router.post('/submit', (req, res) => {
  const { studentId, nodeId, quizType, answers, timeTaken } = req.body;

  if (!studentId || !nodeId || !quizType || !answers) {
    return res.status(400).json({ error: 'Missing required fields: studentId, nodeId, quizType, answers' });
  }

  const result = gradeQuiz(studentId, nodeId, quizType, answers, timeTaken);
  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Get student's status for a specific node
router.get('/status/:studentId/:nodeId', (req, res) => {
  const { studentId, nodeId } = req.params;
  const status = getStudentNodeStatus(parseInt(studentId), nodeId);
  res.json(status);
});

export default router;
