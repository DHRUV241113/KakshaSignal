// Teacher routes
import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { getClassGapSummary, traceGap } from '../services/gapTracer.js';
import { getAllNodes, getAllEdges, getNode } from '../data/knowledgeGraph.js';
import { requireTeacherAuth, isTeacherAuthorizedForStudent, isTeacherAuthorizedForClass, verifyTeacherToken } from '../services/authService.js';

const router = Router();

// Get class overview (heatmap data)
router.get('/class/:classroomId/overview', (req, res) => {
  const { classroomId } = req.params;
  const parsedClassId = parseInt(classroomId, 10);
  if (isNaN(parsedClassId) || parsedClassId <= 0) {
    return res.status(400).json({ error: 'Valid classroomId required' });
  }

  // If teacher token provided, verify classroom authorization
  const authHeader = req.headers.authorization || req.headers['x-teacher-token'];
  if (authHeader) {
    // When credentials are sent, enforce classroom authorization
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    const verified = verifyTeacherToken(token);
    if (!verified) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired teacher authentication token' });
    }
    if (!isTeacherAuthorizedForClass(verified.teacherId, parsedClassId)) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized for this classroom' });
    }
  }

  const summary = getClassGapSummary(parsedClassId);
  res.json(summary);
});

// Get detailed view for a specific student (Protected: requires teacher auth & classroom authorization)
router.get('/student/:studentId/detail', requireTeacherAuth, (req, res) => {
  const { studentId } = req.params;
  const parsedStudentId = parseInt(studentId, 10);
  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    return res.status(400).json({ error: 'Valid studentId required' });
  }

  const teacherId = req.teacher.id;
  if (!isTeacherAuthorizedForStudent(teacherId, parsedStudentId)) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to view this student' });
  }

  const db = getDb();
  const student = db.prepare(`
    SELECT s.*, c.class_level, c.name as classroom_name FROM students s
    JOIN classrooms c ON s.classroom_id = c.id WHERE s.id = ?
  `).get(parsedStudentId);

  if (!student) return res.status(404).json({ error: 'Student not found' });

  const mastery = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ? ORDER BY updated_at DESC'
  ).all(parsedStudentId);

  const recentAttempts = db.prepare(
    'SELECT * FROM quiz_attempts WHERE student_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(parsedStudentId);

  const assignments = db.prepare(
    'SELECT * FROM teacher_assignments WHERE student_id = ? ORDER BY created_at DESC'
  ).all(parsedStudentId);

  // Find gaps and trace
  const gaps = mastery.filter(m => m.status === 'gap_found');
  const traces = {};
  for (const gap of gaps) {
    traces[gap.node_id] = traceGap(parsedStudentId, gap.node_id);
  }

  res.json({
    student: { id: student.id, name: student.name, classLevel: student.class_level, classroom: student.classroom_name },
    mastery,
    recentAttempts,
    assignments,
    gapTraces: traces
  });
});

// Teacher assigns/skips/reassigns a topic for a student (Protected: requires teacher auth & classroom authorization)
router.post('/assign', requireTeacherAuth, (req, res) => {
  const { studentId, nodeId, action, note } = req.body;
  const teacherId = req.teacher.id; // Server-verified identity; ignore any client-provided teacherId

  if (!studentId || !nodeId || !action) {
    return res.status(400).json({ error: 'Missing required fields: studentId, nodeId, action' });
  }

  const parsedStudentId = parseInt(studentId, 10);
  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    return res.status(400).json({ error: 'Valid studentId required' });
  }

  if (!['assign', 'skip', 'reassign'].includes(action)) {
    return res.status(400).json({ error: 'Action must be assign, skip, or reassign' });
  }

  if (!getNode(nodeId)) {
    return res.status(404).json({ error: `Node '${nodeId}' not found in knowledge graph` });
  }

  // Authorize that requesting teacher owns the classroom for this student
  if (!isTeacherAuthorizedForStudent(teacherId, parsedStudentId)) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to modify students outside your assigned classrooms' });
  }

  const db = getDb();

  // Record the assignment with verified teacherId
  db.prepare(`
    INSERT INTO teacher_assignments (teacher_id, student_id, node_id, action, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(teacherId, parsedStudentId, nodeId, action, typeof note === 'string' ? note.slice(0, 500) : '');

  // Update mastery status based on action
  if (action === 'skip') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'mastered')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'mastered', updated_at = CURRENT_TIMESTAMP
    `).run(parsedStudentId, nodeId);
  } else if (action === 'reassign') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'gap_found')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'gap_found', mastery_score = NULL, updated_at = CURRENT_TIMESTAMP
    `).run(parsedStudentId, nodeId);
  } else if (action === 'assign') {
    db.prepare(`
      INSERT INTO student_mastery (student_id, node_id, status)
      VALUES (?, ?, 'learning')
      ON CONFLICT(student_id, node_id)
      DO UPDATE SET status = 'learning', updated_at = CURRENT_TIMESTAMP
    `).run(parsedStudentId, nodeId);
  }

  // Log activity
  db.prepare(`
    INSERT INTO activity_log (student_id, node_id, activity_type, details)
    VALUES (?, ?, ?, ?)
  `).run(parsedStudentId, nodeId, `teacher_${action}`, JSON.stringify({ teacherId, note: typeof note === 'string' ? note.slice(0, 500) : '' }));

  res.json({ success: true, action, nodeId, studentId: parsedStudentId, authorizedTeacherId: teacherId });
});

// Get all students in a classroom
router.get('/class/:classroomId/students', (req, res) => {
  const { classroomId } = req.params;
  const parsedClassId = parseInt(classroomId, 10);
  if (isNaN(parsedClassId) || parsedClassId <= 0) {
    return res.status(400).json({ error: 'Valid classroomId required' });
  }

  const db = getDb();
  const students = db.prepare(
    'SELECT id, name, roll_number, classroom_id FROM students WHERE classroom_id = ? ORDER BY name'
  ).all(parsedClassId);

  res.json({ students });
});

// Get the knowledge graph structure (public curriculum blueprint)
router.get('/knowledge-graph', (req, res) => {
  res.json({ nodes: getAllNodes(), edges: getAllEdges() });
});

export default router;
