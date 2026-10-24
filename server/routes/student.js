// Student routes
import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { getAllNodes, getNode, getNodesByClass } from '../data/knowledgeGraph.js';
import learningContent from '../data/learningContent.js';
import { traceGap } from '../services/gapTracer.js';

const router = Router();

// Get available topics for a student's class level (and prerequisite classes)
router.get('/topics/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDb();

  const student = db.prepare(`
    SELECT s.*, c.class_level FROM students s
    JOIN classrooms c ON s.classroom_id = c.id
    WHERE s.id = ?
  `).get(parseInt(studentId));

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Get all nodes up to and including the student's class level
  const nodes = getAllNodes().filter(n => n.class <= student.class_level);

  // Get mastery status for each node
  const masteryRecords = db.prepare(
    'SELECT node_id, status, diagnostic_score, mastery_score FROM student_mastery WHERE student_id = ?'
  ).all(parseInt(studentId));

  const masteryMap = {};
  for (const rec of masteryRecords) {
    masteryMap[rec.node_id] = rec;
  }

  const topics = nodes.map(node => ({
    ...node,
    mastery: masteryMap[node.id] || { status: 'not_started', diagnostic_score: null, mastery_score: null }
  }));

  // Group by class
  const grouped = {};
  for (const topic of topics) {
    if (!grouped[topic.class]) grouped[topic.class] = [];
    grouped[topic.class].push(topic);
  }

  res.json({ studentId: parseInt(studentId), classLevel: student.class_level, topicsByClass: grouped, allTopics: topics });
});

// Get learning content for a node
router.get('/learn/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const content = learningContent[nodeId];
  const node = getNode(nodeId);

  if (!content || !node) {
    return res.status(404).json({ error: `No content for node: ${nodeId}` });
  }

  res.json({ node, content });
});

// Get the gap trace for a student on a specific node
router.get('/trace/:studentId/:nodeId', (req, res) => {
  const { studentId, nodeId } = req.params;
  const trace = traceGap(parseInt(studentId), nodeId);
  if (trace.error) {
    return res.status(404).json(trace);
  }
  res.json(trace);
});

// Get student's learning path (recommended next steps)
router.get('/path/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDb();

  // Find nodes with gap_found status
  const gaps = db.prepare(
    "SELECT node_id FROM student_mastery WHERE student_id = ? AND status = 'gap_found'"
  ).all(parseInt(studentId));

  if (gaps.length === 0) {
    // Find nodes not started yet
    const allNodes = getAllNodes();
    const masteryRecords = db.prepare(
      'SELECT node_id FROM student_mastery WHERE student_id = ?'
    ).all(parseInt(studentId));
    const startedSet = new Set(masteryRecords.map(r => r.node_id));

    const student = db.prepare(`
      SELECT c.class_level FROM students s JOIN classrooms c ON s.classroom_id = c.id WHERE s.id = ?
    `).get(parseInt(studentId));

    const notStarted = allNodes
      .filter(n => !startedSet.has(n.id) && n.class <= (student?.class_level || 8))
      .sort((a, b) => a.class - b.class);

    return res.json({
      hasGaps: false,
      message: 'No gaps found yet. Start a diagnostic to begin!',
      suggestedTopics: notStarted.slice(0, 5)
    });
  }

  // Trace from the highest class gap (e.g. Class 8 Rational Numbers or Class 7 Fractions)
  // to discover the backward prerequisite chain down to foundational root deficits
  const sortedGaps = [...gaps].sort((a, b) => {
    const classA = getNode(a.node_id)?.class || 0;
    const classB = getNode(b.node_id)?.class || 0;
    return classB - classA;
  });
  const targetGap = sortedGaps[0].node_id;
  const trace = traceGap(parseInt(studentId), targetGap);

  res.json({
    hasGaps: true,
    currentGap: targetGap,
    ...trace
  });
});

// Get student progress overview
router.get('/progress/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = getDb();

  const student = db.prepare(`
    SELECT s.*, c.class_level, c.name as classroom_name FROM students s
    JOIN classrooms c ON s.classroom_id = c.id
    WHERE s.id = ?
  `).get(parseInt(studentId));

  if (!student) return res.status(404).json({ error: 'Student not found' });

  const mastery = db.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ?'
  ).all(parseInt(studentId));

  const recentActivity = db.prepare(
    'SELECT * FROM activity_log WHERE student_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(parseInt(studentId));

  const totalNodes = getAllNodes().filter(n => n.class <= student.class_level).length;
  const masteredCount = mastery.filter(m => m.status === 'mastered').length;
  const gapCount = mastery.filter(m => m.status === 'gap_found').length;
  const inProgressCount = mastery.filter(m => !['mastered', 'not_started', 'gap_found'].includes(m.status)).length;

  res.json({
    student: { id: student.id, name: student.name, classLevel: student.class_level, classroom: student.classroom_name },
    stats: { totalNodes, mastered: masteredCount, gaps: gapCount, inProgress: inProgressCount, notStarted: totalNodes - masteredCount - gapCount - inProgressCount },
    masteryDetails: mastery,
    recentActivity
  });
});

export default router;
