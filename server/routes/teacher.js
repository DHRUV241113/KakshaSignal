// Teacher routes
import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { getClassGapSummary, traceGap } from '../services/gapTracer.js';
import { getAllNodes, getAllEdges, getNode } from '../data/knowledgeGraph.js';

const router = Router();

// Get class overview (heatmap data)
router.get('/class/:classroomId/overview', (req, res) => {
  const { classroomId } = req.params;
  const summary = getClassGapSummary(parseInt(classroomId));
  res.json(summary);
});

// Get detailed view for a specific student
router.get('/student/:studentId/detail', (req, res) => {
  const { studentId } = req.params;
  const db = getDb();

  const student = db.prepare(`
    SELECT s.*, c.class_level, c.name as classroom_name FROM students s
    JOIN classrooms c ON s.classroom_id = c.id WHERE s.id = ?
  `).get(parseInt(studentId));

  if (!student) return res.status(404).json({ error: 'Student not found' });

  const mastery = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ? ORDER BY updated_at DESC'
  ).all(parseInt(studentId));

  const recentAttempts = db.prepare(
    'SELECT * FROM quiz_attempts WHERE student_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(parseInt(studentId));

  const assignments = db.prepare(
    'SELECT * FROM teacher_assignments WHERE student_id = ? ORDER BY created_at DESC'
  ).all(parseInt(studentId));

  // Find gaps and trace
  const gaps = mastery.filter(m => m.status === 'gap_found');
  const traces = {};
  for (const gap of gaps) {
    traces[gap.node_id] = traceGap(parseInt(studentId), gap.node_id);
  }

  res.json({
    student: { id: student.id, name: student.name, classLevel: student.class_level, classroom: student.classroom_name },
    mastery,
    recentAttempts,
    assignments,
    gapTraces: traces
  });
});

// Teacher assigns/skips/reassigns a topic for a student
router.post('/assign', (req, res) => {
  const { teacherId, studentId, nodeId, action, note } = req.body;

  if (!teacherId || !studentId || !nodeId || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['assign', 'skip', 'reassign'].includes(action)) {
    return res.status(400).json({ error: 'Action must be assign, skip, or reassign' });
  }

  if (!getNode(nodeId)) {
    return res.status(404).json({ error: `Node '${nodeId}' not found in knowledge graph` });
  }

  const db = getDb();

  // Record the assignment
  db.prepare(`
    INSERT INTO teacher_assignments (teacher_id, student_id, node_id, action, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(teacherId, studentId, nodeId, action, note || '');

  // Update mastery status based on action
  if (action === 'skip') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'mastered')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'mastered', updated_at = CURRENT_TIMESTAMP
    `).run(studentId, nodeId);
  } else if (action === 'reassign') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'gap_found')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'gap_found', mastery_score = NULL, updated_at = CURRENT_TIMESTAMP
    `).run(studentId, nodeId);
  } else if (action === 'assign') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'learning')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'learning', updated_at = CURRENT_TIMESTAMP
    `).run(studentId, nodeId);
  }

  // Log activity
  db.prepare(`
    INSERT INTO activity_log (student_id, node_id, activity_type, details)
    VALUES (?, ?, ?, ?)
  `).run(studentId, nodeId, `teacher_${action}`, JSON.stringify({ teacherId, note }));

  res.json({ success: true, action, nodeId, studentId });
});

// Get all students in a classroom
router.get('/class/:classroomId/students', (req, res) => {
  const { classroomId } = req.params;
  const db = getDb();

  const students = db.prepare(
    'SELECT * FROM students WHERE classroom_id = ? ORDER BY name'
  ).all(parseInt(classroomId));

  res.json({ students });
});

// Get the knowledge graph structure (for visualization)
router.get('/knowledge-graph', (req, res) => {
  res.json({ nodes: getAllNodes(), edges: getAllEdges() });
});

export default router;
