// Pure-JS Resilient Database Engine for Curriculum Continuity Pass (CCP)
// 100% zero-dependency, works cross-platform without native C++ compilation (node-gyp/Python/VS).
// Persists synchronously to JSON for ACID-like durability.

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'ccp-data.json');
const BACKUP_FILE = join(__dirname, 'ccp-data.backup.json');

class MemoryDatabase {
  constructor() {
    this.tables = {
      teachers: [],
      classrooms: [],
      students: [],
      student_mastery: [],
      quiz_attempts: [],
      teacher_assignments: [],
      activity_log: []
    };
    this.autoIncrement = {
      teachers: 1,
      classrooms: 1,
      students: 1,
      student_mastery: 1,
      quiz_attempts: 1,
      teacher_assignments: 1,
      activity_log: 1
    };
    this.load();
  }

  load() {
    let loaded = false;
    // Primary: attempt reading DB_FILE
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.tables) this.tables = data.tables;
        if (data.autoIncrement) this.autoIncrement = data.autoIncrement;
        loaded = true;
        // Create/update backup snapshot on clean load
        try {
          fs.writeFileSync(BACKUP_FILE, raw, 'utf-8');
        } catch (_) {}
      }
    } catch (err) {
      console.warn('DB file corrupt or unreadable, checking backup file...', err.message);
    }

    // Fallback: attempt recovering from BACKUP_FILE
    if (!loaded && fs.existsSync(BACKUP_FILE)) {
      try {
        const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
        const data = JSON.parse(rawBackup);
        if (data.tables) this.tables = data.tables;
        if (data.autoIncrement) this.autoIncrement = data.autoIncrement;
        loaded = true;
        console.info('Successfully recovered datastore from automated backup snapshot.');
        // Restore to DB_FILE
        this.save();
      } catch (backupErr) {
        console.warn('Backup file also unreadable, starting fresh DB store.');
      }
    }
  }

  save() {
    try {
      const data = {
        tables: this.tables,
        autoIncrement: this.autoIncrement
      };
      const jsonPayload = JSON.stringify(data, null, 2);
      
      // Atomic write: write to a unique temporary file first, then replace DB_FILE
      const tmpFile = join(__dirname, `ccp-data.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.json`);
      fs.writeFileSync(tmpFile, jsonPayload, 'utf-8');
      
      try {
        fs.renameSync(tmpFile, DB_FILE);
      } catch (renameErr) {
        // Fallback for Windows file locks
        fs.copyFileSync(tmpFile, DB_FILE);
        try { fs.unlinkSync(tmpFile); } catch (_) {}
      }

      // Sync backup copy
      try {
        fs.writeFileSync(BACKUP_FILE, jsonPayload, 'utf-8');
      } catch (_) {}
    } catch (err) {
      console.error('Failed to persist DB:', err);
    }
  }

  pragma() {
    return this;
  }

  close() {
    this.save();
  }

  exec(sql) {
    if (sql.includes('DELETE FROM')) {
      const matches = sql.match(/DELETE FROM\s+([a-zA-Z_]+)/gi);
      if (matches) {
        for (const m of matches) {
          const table = m.replace(/DELETE FROM\s+/i, '').trim();
          if (this.tables[table]) {
            this.tables[table] = [];
            this.autoIncrement[table] = 1;
          }
        }
      }
      this.save();
    }
    return this;
  }

  prepare(sql) {
    const db = this;
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    return {
      run(...params) {
        // Teachers insert
        if (/INSERT INTO teachers/i.test(cleanSql)) {
          const [name, code, school] = params;
          const id = db.autoIncrement.teachers++;
          db.tables.teachers.push({ id, name, code, school, created_at: new Date().toISOString() });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        // Classrooms insert
        if (/INSERT INTO classrooms/i.test(cleanSql)) {
          const [teacher_id, name, class_level, join_code] = params;
          if (!name || isNaN(Number(teacher_id)) || Number(teacher_id) <= 0) {
            throw new Error('Invalid classroom data: valid name and positive teacher_id required');
          }
          const id = db.autoIncrement.classrooms++;
          db.tables.classrooms.push({ id, teacher_id: Number(teacher_id), name: String(name).trim(), class_level: Number(class_level) || 8, join_code: join_code || '', created_at: new Date().toISOString() });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        // Students insert
        if (/INSERT INTO students/i.test(cleanSql)) {
          if (params.length === 3) {
            const [name, classroom_id, roll_number] = params;
            if (!name || isNaN(Number(classroom_id)) || Number(classroom_id) <= 0) {
              throw new Error('Invalid student data: non-empty name and positive classroom_id required');
            }
            const id = db.autoIncrement.students++;
            db.tables.students.push({ id, name: String(name).trim(), classroom_id: Number(classroom_id), roll_number: roll_number || '', created_at: new Date().toISOString() });
            db.save();
            return { lastInsertRowid: id, changes: 1 };
          } else {
            const [name, classroom_id] = params;
            if (!name || isNaN(Number(classroom_id)) || Number(classroom_id) <= 0) {
              throw new Error('Invalid student data: non-empty name and positive classroom_id required');
            }
            const id = db.autoIncrement.students++;
            db.tables.students.push({ id, name: String(name).trim(), classroom_id: Number(classroom_id), roll_number: '', created_at: new Date().toISOString() });
            db.save();
            return { lastInsertRowid: id, changes: 1 };
          }
        }

        // Student mastery insert or ignore
        if (/INSERT OR IGNORE INTO student_mastery/i.test(cleanSql)) {
          const [student_id, node_id, status] = params;
          if (isNaN(Number(student_id)) || Number(student_id) <= 0 || !node_id) {
            throw new Error('Invalid student_mastery data: positive student_id and node_id required');
          }
          const exists = db.tables.student_mastery.find(m => m.student_id === Number(student_id) && m.node_id === node_id);
          if (!exists) {
            const id = db.autoIncrement.student_mastery++;
            db.tables.student_mastery.push({
              id,
              student_id: Number(student_id),
              node_id,
              status: status || 'not_started',
              diagnostic_score: null,
              practice_score: null,
              mastery_score: null,
              attempts: 0,
              last_activity: null,
              updated_at: new Date().toISOString()
            });
            db.save();
            return { lastInsertRowid: id, changes: 1 };
          }
          return { lastInsertRowid: exists.id, changes: 0 };
        }

        // Student mastery direct insert (from seed)
        if (/INSERT INTO student_mastery/i.test(cleanSql) && !/ON CONFLICT/i.test(cleanSql)) {
          const [student_id, node_id, status, diagnostic_score, mastery_score] = params;
          const id = db.autoIncrement.student_mastery++;
          db.tables.student_mastery.push({
            id,
            student_id: Number(student_id),
            node_id,
            status,
            diagnostic_score,
            practice_score: null,
            mastery_score,
            attempts: 1,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        // Teacher override mastery UPSERT
        if (/INSERT INTO student_mastery/i.test(cleanSql) && /ON CONFLICT/i.test(cleanSql)) {
          const [student_id, node_id, statusParam] = params;
          let status = statusParam;
          if (!status) {
            if (/'mastered'/i.test(cleanSql)) status = 'mastered';
            else if (/'gap_found'/i.test(cleanSql)) status = 'gap_found';
            else if (/'learning'/i.test(cleanSql)) status = 'learning';
            else status = 'learning';
          }
          let rec = db.tables.student_mastery.find(m => m.student_id === Number(student_id) && m.node_id === node_id);
          if (rec) {
            rec.status = status;
            if (status === 'gap_found') rec.mastery_score = null;
            if (status === 'mastered') rec.mastery_score = 1.0;
            rec.updated_at = new Date().toISOString();
          } else {
            const id = db.autoIncrement.student_mastery++;
            db.tables.student_mastery.push({
              id,
              student_id: Number(student_id),
              node_id,
              status,
              diagnostic_score: null,
              practice_score: null,
              mastery_score: status === 'mastered' ? 1.0 : null,
              attempts: 1,
              updated_at: new Date().toISOString()
            });
          }
          db.save();
          return { changes: 1 };
        }

        // Student mastery UPDATE
        if (/UPDATE student_mastery/i.test(cleanSql)) {
          const [newStatus, diagScore, practScore, mastScore, attempts, student_id, node_id] = params;
          let rec = db.tables.student_mastery.find(m => m.student_id === Number(student_id) && m.node_id === node_id);
          if (rec) {
            rec.status = newStatus;
            if (diagScore !== null && diagScore !== undefined) rec.diagnostic_score = diagScore;
            if (practScore !== null && practScore !== undefined) rec.practice_score = practScore;
            if (mastScore !== null && mastScore !== undefined) rec.mastery_score = mastScore;
            rec.attempts = attempts;
            rec.last_activity = new Date().toISOString();
            rec.updated_at = new Date().toISOString();
            db.save();
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        // Quiz attempts insert
        if (/INSERT INTO quiz_attempts/i.test(cleanSql)) {
          const [student_id, node_id, quiz_type, questions_json, answers_json, score, total_questions, correct_answers, time_taken_seconds] = params;
          if (isNaN(Number(student_id)) || Number(student_id) <= 0 || !node_id || typeof score !== 'number' || isNaN(score) || score < 0 || score > 1) {
            throw new Error('Invalid quiz_attempts data: positive student_id, non-empty node_id, and 0<=score<=1 required');
          }
          const id = db.autoIncrement.quiz_attempts++;
          db.tables.quiz_attempts.push({
            id,
            student_id: Number(student_id),
            node_id,
            quiz_type,
            questions_json,
            answers_json,
            score,
            total_questions,
            correct_answers,
            time_taken_seconds,
            created_at: new Date().toISOString()
          });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        // Teacher assignments insert
        if (/INSERT INTO teacher_assignments/i.test(cleanSql)) {
          const [teacher_id, student_id, node_id, action, note] = params;
          const id = db.autoIncrement.teacher_assignments++;
          db.tables.teacher_assignments.push({
            id,
            teacher_id: Number(teacher_id),
            student_id: Number(student_id),
            node_id,
            action,
            note,
            created_at: new Date().toISOString()
          });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        // Activity log insert
        if (/INSERT INTO activity_log/i.test(cleanSql)) {
          const [student_id, node_id, activity_type, details] = params;
          const id = db.autoIncrement.activity_log++;
          db.tables.activity_log.push({
            id,
            student_id: Number(student_id),
            node_id,
            activity_type,
            details,
            created_at: new Date().toISOString()
          });
          db.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        return { changes: 0 };
      },

      get(...params) {
        // Teacher by code
        if (/SELECT \* FROM teachers WHERE code =/i.test(cleanSql)) {
          const [code] = params;
          return db.tables.teachers.find(t => t.code === code) || null;
        }

        // Teacher by id
        if (/SELECT .* FROM teachers WHERE id =/i.test(cleanSql)) {
          const [id] = params;
          return db.tables.teachers.find(t => t.id === Number(id)) || null;
        }

        // Classroom by join code
        if (/SELECT \* FROM classrooms WHERE join_code =/i.test(cleanSql)) {
          const [join_code] = params;
          return db.tables.classrooms.find(c => c.join_code === join_code) || null;
        }

        // Classroom by id
        if (/SELECT \* FROM classrooms WHERE id =/i.test(cleanSql)) {
          const [id] = params;
          return db.tables.classrooms.find(c => c.id === Number(id)) || null;
        }

        // Student by name and classroom
        if (/SELECT \* FROM students WHERE name = \? AND classroom_id = \?/i.test(cleanSql)) {
          const [name, classroom_id] = params;
          return db.tables.students.find(s => s.name.toLowerCase() === String(name).toLowerCase() && s.classroom_id === Number(classroom_id)) || null;
        }

        // Student by name only
        if (/SELECT \* FROM students WHERE name = \?/i.test(cleanSql)) {
          const [name] = params;
          return db.tables.students.find(s => s.name.toLowerCase() === String(name).toLowerCase()) || null;
        }

        // Student by id
        if (/SELECT \* FROM students WHERE id =/i.test(cleanSql)) {
          const [id] = params;
          return db.tables.students.find(s => s.id === Number(id)) || null;
        }

        // Student with classroom join
        if (/SELECT s\.\*, c\.class_level/i.test(cleanSql) && /WHERE s\.id = \?/i.test(cleanSql)) {
          const [id] = params;
          const s = db.tables.students.find(st => st.id === Number(id));
          if (!s) return null;
          const c = db.tables.classrooms.find(cl => cl.id === s.classroom_id);
          return {
            ...s,
            class_level: c ? c.class_level : 8,
            classroom_name: c ? c.name : ''
          };
        }

        // Student mastery by student_id and node_id
        if (/SELECT \* FROM student_mastery WHERE student_id = \? AND node_id = \?/i.test(cleanSql)) {
          const [student_id, node_id] = params;
          return db.tables.student_mastery.find(m => m.student_id === Number(student_id) && m.node_id === node_id) || null;
        }

        return null;
      },

      all(...params) {
        // Classrooms for teacher
        if (/SELECT \* FROM classrooms WHERE teacher_id =/i.test(cleanSql)) {
          const [teacher_id] = params;
          return db.tables.classrooms.filter(c => c.teacher_id === Number(teacher_id));
        }

        // Students in classroom
        if (/SELECT (id, name, roll_number|\*) FROM students WHERE classroom_id =/i.test(cleanSql)) {
          const [classroom_id] = params;
          return db.tables.students.filter(s => s.classroom_id === Number(classroom_id));
        }

        // Student gaps
        if (/SELECT .* FROM student_mastery WHERE student_id = \? AND status = 'gap_found'/i.test(cleanSql)) {
          const [student_id] = params;
          return db.tables.student_mastery.filter(m => m.student_id === Number(student_id) && m.status === 'gap_found');
        }

        // Student mastery records for student (matches any SELECT on student_mastery WHERE student_id =)
        if (/SELECT .* FROM student_mastery WHERE student_id =/i.test(cleanSql)) {
          const [student_id] = params;
          return db.tables.student_mastery.filter(m => m.student_id === Number(student_id));
        }

        // Quiz attempts
        if (/SELECT .* FROM quiz_attempts WHERE student_id =/i.test(cleanSql)) {
          const [student_id, node_id] = params;
          if (node_id) {
            return db.tables.quiz_attempts
              .filter(q => q.student_id === Number(student_id) && q.node_id === node_id)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          return db.tables.quiz_attempts
            .filter(q => q.student_id === Number(student_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        // Teacher assignments
        if (/SELECT \* FROM teacher_assignments WHERE student_id =/i.test(cleanSql)) {
          const [student_id] = params;
          return db.tables.teacher_assignments
            .filter(a => a.student_id === Number(student_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        // Activity log
        if (/SELECT \* FROM activity_log WHERE student_id =/i.test(cleanSql)) {
          const [student_id] = params;
          return db.tables.activity_log
            .filter(a => a.student_id === Number(student_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
        }

        return [];
      }
    };
  }
}

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new MemoryDatabase();
  }
  return dbInstance;
}

export default getDb;
