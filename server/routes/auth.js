// Authentication routes
import { Router } from 'express';
import { getDb } from '../db/schema.js';
import { generateTeacherToken, generateStudentToken } from '../services/authService.js';
import { loginRateLimiter, getClientIp } from '../middleware/rateLimiter.js';

const router = Router();

// Student name validation:
// 2 to 50 characters, trimmed, allowing Unicode letters (\p{L}), marks (\p{M}), numbers (\p{N}),
// whitespace, and standard name punctuation (.,'-) to support Indian multilingual names.
const STUDENT_NAME_REGEX = /^[\p{L}\p{M}\p{N}\s.,'-]{2,50}$/u;

function validateStudentName(rawName) {
  if (typeof rawName !== 'string') return null;
  const trimmed = rawName.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return null;
  if (!STUDENT_NAME_REGEX.test(trimmed)) return null;
  return trimmed;
}

// In-memory counter for student registrations per IP
const studentCreationsPerIp = new Map();
const MAX_CREATIONS_PER_WINDOW = 15;
const CREATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkStudentCreationLimit(ip) {
  const now = Date.now();
  let record = studentCreationsPerIp.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + CREATION_WINDOW_MS };
    studentCreationsPerIp.set(ip, record);
    return true;
  }
  if (record.count >= MAX_CREATIONS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

// Teacher login (by code)
router.post('/teacher/login', loginRateLimiter, (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Teacher code is required' });
  }

  const db = getDb();
  const teacher = db.prepare('SELECT * FROM teachers WHERE code = ?').get(code.trim());

  if (!teacher) {
    return res.status(401).json({ error: 'Invalid teacher code' });
  }

  // Issue cryptographically signed session token
  const token = generateTeacherToken(teacher.id);

  const classrooms = db.prepare(
    'SELECT * FROM classrooms WHERE teacher_id = ?'
  ).all(teacher.id);

  res.json({
    teacher: { id: teacher.id, name: teacher.name, school: teacher.school },
    token,
    classrooms
  });
});

// Student login (by name + classroom join code)
router.post('/student/login', loginRateLimiter, (req, res) => {
  const { name, joinCode } = req.body;
  if (!name || !joinCode) {
    return res.status(400).json({ error: 'Student name and classroom code are required' });
  }

  const validatedName = validateStudentName(name);
  if (!validatedName) {
    return res.status(400).json({
      error: 'Invalid student name: Must be 2-50 characters and contain only letters, numbers, spaces, or standard punctuation'
    });
  }

  const sanitizedJoinCode = String(joinCode).trim().toUpperCase();

  const db = getDb();
  const classroom = db.prepare('SELECT * FROM classrooms WHERE join_code = ?').get(sanitizedJoinCode);

  if (!classroom) {
    return res.status(401).json({ error: 'Invalid classroom code' });
  }

  // Find or create student
  let student = db.prepare(
    'SELECT * FROM students WHERE name = ? AND classroom_id = ?'
  ).get(validatedName, classroom.id);

  if (!student) {
    const clientIp = getClientIp(req);
    if (!checkStudentCreationLimit(clientIp)) {
      return res.status(429).json({
        error: 'Too many new student registrations from this network. Please wait a few minutes before registering more students.'
      });
    }

    const result = db.prepare(
      'INSERT INTO students (name, classroom_id) VALUES (?, ?)'
    ).run(validatedName, classroom.id);
    student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
  }

  // Issue cryptographically signed student session token
  const token = generateStudentToken(student.id, classroom.id);

  res.json({
    student: { id: student.id, name: student.name, rollNumber: student.roll_number },
    classroom: { id: classroom.id, name: classroom.name, classLevel: classroom.class_level },
    token
  });
});

export default router;
