// Authentication and Authorization Service
// Implements cryptographic HMAC-SHA256 session tokens, student & teacher authorization checks.
// Zero third-party dependencies — uses Node.js standard crypto.

import crypto from 'crypto';
import { getDb } from '../db/schema.js';

const INSECURE_DEFAULT_SECRET = 'kakshasignal-teacher-auth-secret-key-2026';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Initialize session signing key.
 * In production: strictly requires a non-default SESSION_SECRET of at least 32 characters.
 * In development/test: generates an ephemeral cryptographically secure random key in memory if unset,
 * ensuring no static predictable fallback exists.
 */
function resolveSessionSecret() {
  const isProduction = process.env.NODE_ENV === 'production';
  const envSecret = process.env.SESSION_SECRET;

  if (isProduction) {
    if (!envSecret || envSecret.trim().length < 32 || envSecret.trim() === INSECURE_DEFAULT_SECRET) {
      throw new Error(
        'FATAL: In production, SESSION_SECRET must be configured with a cryptographically secure key of at least 32 characters.'
      );
    }
    return envSecret.trim();
  }

  if (envSecret && envSecret.trim().length >= 16 && envSecret.trim() !== INSECURE_DEFAULT_SECRET) {
    return envSecret.trim();
  }

  // Generate an ephemeral cryptographic random 256-bit key in memory
  return crypto.randomBytes(32).toString('hex');
}

let activeSessionSecret = resolveSessionSecret();

/**
 * Allow test suites to test key rotation or invalidation
 */
export function _setSessionSecretForTesting(secret) {
  activeSessionSecret = secret;
}

export function _resetSessionSecretForTesting() {
  activeSessionSecret = resolveSessionSecret();
}

/**
 * Generate a cryptographically signed teacher session token.
 * Payload format: base64url(t:teacherId:timestamp:hmac)
 */
export function generateTeacherToken(teacherId) {
  const timestamp = Date.now();
  const payload = `t:${teacherId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', activeSessionSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

/**
 * Verify a teacher session token and return teacher metadata.
 * Returns { teacherId } on success, or null on any failure.
 */
export function verifyTeacherToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    
    // Support both new format (t:teacherId:timestamp:hmac) and backward-compatible (teacherId:timestamp:hmac)
    let teacherId, timestamp, receivedHmac;
    if (parts.length === 4 && parts[0] === 't') {
      teacherId = parseInt(parts[1], 10);
      timestamp = parseInt(parts[2], 10);
      receivedHmac = parts[3];
    } else if (parts.length === 3) {
      teacherId = parseInt(parts[0], 10);
      timestamp = parseInt(parts[1], 10);
      receivedHmac = parts[2];
    } else {
      return null;
    }

    if (isNaN(teacherId) || isNaN(timestamp)) return null;

    // Check expiration
    if (Date.now() - timestamp > TOKEN_MAX_AGE_MS || timestamp > Date.now() + 60000) {
      return null;
    }

    // Compute expected HMAC
    const payload = parts.length === 4 ? `t:${teacherId}:${timestamp}` : `${teacherId}:${timestamp}`;
    const expectedHmac = crypto.createHmac('sha256', activeSessionSecret).update(payload).digest('hex');

    // Timing-safe comparison against timing attacks
    const bufReceived = Buffer.from(receivedHmac, 'hex');
    const bufExpected = Buffer.from(expectedHmac, 'hex');
    if (bufReceived.length !== bufExpected.length) return null;

    if (!crypto.timingSafeEqual(bufReceived, bufExpected)) {
      return null;
    }

    return { teacherId };
  } catch (_) {
    return null;
  }
}

/**
 * Generate a cryptographically signed student session token.
 * Payload format: base64url(s:studentId:classroomId:timestamp:hmac)
 */
export function generateStudentToken(studentId, classroomId) {
  const timestamp = Date.now();
  const payload = `s:${studentId}:${classroomId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', activeSessionSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

/**
 * Verify a student session token and return student metadata.
 * Returns { studentId, classroomId } on success, or null on any failure.
 */
export function verifyStudentToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length !== 5 || parts[0] !== 's') return null;

    const studentId = parseInt(parts[1], 10);
    const classroomId = parseInt(parts[2], 10);
    const timestamp = parseInt(parts[3], 10);
    const receivedHmac = parts[4];

    if (isNaN(studentId) || isNaN(classroomId) || isNaN(timestamp)) return null;

    // Check expiration
    if (Date.now() - timestamp > TOKEN_MAX_AGE_MS || timestamp > Date.now() + 60000) {
      return null;
    }

    const payload = `s:${studentId}:${classroomId}:${timestamp}`;
    const expectedHmac = crypto.createHmac('sha256', activeSessionSecret).update(payload).digest('hex');

    const bufReceived = Buffer.from(receivedHmac, 'hex');
    const bufExpected = Buffer.from(expectedHmac, 'hex');
    if (bufReceived.length !== bufExpected.length) return null;

    if (!crypto.timingSafeEqual(bufReceived, bufExpected)) {
      return null;
    }

    return { studentId, classroomId };
  } catch (_) {
    return null;
  }
}

/**
 * Express Middleware: Enforce valid teacher authentication.
 * Extracts token from Authorization: Bearer <token> or x-teacher-token header.
 */
export function requireTeacherAuth(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-teacher-token']) {
    token = String(req.headers['x-teacher-token']).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing teacher authentication token' });
  }

  const verified = verifyTeacherToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired teacher authentication token' });
  }

  const db = getDb();
  const teacher = db.prepare('SELECT id, name, school FROM teachers WHERE id = ?').get(verified.teacherId);
  if (!teacher) {
    return res.status(401).json({ error: 'Unauthorized: Teacher account no longer exists' });
  }

  req.teacher = teacher;
  next();
}

/**
 * Express Middleware: Enforce that the requester is authorized to access the requested student's data.
 * The requester MUST be either:
 * 1) The student themself (holding a valid student token matching req.params.studentId), OR
 * 2) An authorized teacher whose assigned classroom includes this student (holding a valid teacher token).
 */
export function requireStudentOrTeacherAuth(req, res, next) {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId) || studentId <= 0) {
    return res.status(400).json({ error: 'Valid studentId required' });
  }

  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-student-token']) {
    token = String(req.headers['x-student-token']).trim();
  } else if (req.headers['x-teacher-token']) {
    token = String(req.headers['x-teacher-token']).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
  }

  // 1. Try student token
  const verifiedStudent = verifyStudentToken(token);
  if (verifiedStudent) {
    if (verifiedStudent.studentId !== studentId) {
      return res.status(403).json({ error: 'Forbidden: Students can only access their own records' });
    }
    const db = getDb();
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    req.student = student;
    return next();
  }

  // 2. Try teacher token
  const verifiedTeacher = verifyTeacherToken(token);
  if (verifiedTeacher) {
    const db = getDb();
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!isTeacherAuthorizedForStudent(verifiedTeacher.teacherId, studentId)) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to view students outside your classroom' });
    }
    req.teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(verifiedTeacher.teacherId);
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
}

/**
 * Verify whether a teacher is authorized for a specific classroom.
 */
export function isTeacherAuthorizedForClass(teacherId, classroomId) {
  const db = getDb();
  const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ?').get(Number(classroomId));
  return classroom && classroom.teacher_id === Number(teacherId);
}

/**
 * Verify whether a teacher is authorized for a specific student.
 */
export function isTeacherAuthorizedForStudent(teacherId, studentId) {
  const db = getDb();
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(studentId));
  if (!student) return false;
  const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ?').get(student.classroom_id);
  return Boolean(classroom && classroom.teacher_id === Number(teacherId));
}
