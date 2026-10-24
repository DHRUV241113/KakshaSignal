// Authentication routes
import { Router } from 'express';
import { getDb } from '../db/schema.js';

const router = Router();

// Teacher login (by code)
router.post('/teacher/login', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Teacher code is required' });

  const db = getDb();
  const teacher = db.prepare('SELECT * FROM teachers WHERE code = ?').get(code);

  if (!teacher) {
    return res.status(401).json({ error: 'Invalid teacher code' });
  }

  const classrooms = db.prepare(
    'SELECT * FROM classrooms WHERE teacher_id = ?'
  ).all(teacher.id);

  res.json({
    teacher: { id: teacher.id, name: teacher.name, school: teacher.school },
    classrooms
  });
});

// Student login (by name + classroom join code)
router.post('/student/login', (req, res) => {
  const { name, joinCode } = req.body;
  if (!name || !joinCode) {
    return res.status(400).json({ error: 'Student name and classroom code are required' });
  }

  const db = getDb();
  const classroom = db.prepare('SELECT * FROM classrooms WHERE join_code = ?').get(joinCode);

  if (!classroom) {
    return res.status(401).json({ error: 'Invalid classroom code' });
  }

  // Find or create student
  let student = db.prepare(
    'SELECT * FROM students WHERE name = ? AND classroom_id = ?'
  ).get(name, classroom.id);

  if (!student) {
    const result = db.prepare(
      'INSERT INTO students (name, classroom_id) VALUES (?, ?)'
    ).run(name, classroom.id);
    student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
  }

  res.json({
    student: { id: student.id, name: student.name, rollNumber: student.roll_number },
    classroom: { id: classroom.id, name: classroom.name, classLevel: classroom.class_level }
  });
});

export default router;
