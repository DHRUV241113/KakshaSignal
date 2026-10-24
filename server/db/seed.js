// Seed script: populate the database with demo data
// Creates a teacher, classroom, and sample students with varied mastery states

import { getDb } from './schema.js';
import questions from '../data/questions.js';

function seed() {
  const db = getDb();

  console.log('🌱 Seeding database...\n');

  // Clear existing data
  db.exec(`
    DELETE FROM activity_log;
    DELETE FROM teacher_assignments;
    DELETE FROM quiz_attempts;
    DELETE FROM student_mastery;
    DELETE FROM students;
    DELETE FROM classrooms;
    DELETE FROM teachers;
  `);

  // Create demo teacher
  const teacher = db.prepare(
    "INSERT INTO teachers (name, code, school) VALUES (?, ?, ?)"
  ).run('Mrs. Sharma', 'TEACH2026', 'Delhi Public School, Hyderabad');
  console.log(`✅ Teacher: Mrs. Sharma (code: TEACH2026)`);

  // Create classrooms
  const class7 = db.prepare(
    "INSERT INTO classrooms (teacher_id, name, class_level, join_code) VALUES (?, ?, ?, ?)"
  ).run(teacher.lastInsertRowid, 'Class 7-A', 7, 'JOIN7A');
  console.log(`✅ Classroom: Class 7-A (join code: JOIN7A)`);

  const class8 = db.prepare(
    "INSERT INTO classrooms (teacher_id, name, class_level, join_code) VALUES (?, ?, ?, ?)"
  ).run(teacher.lastInsertRowid, 'Class 8-B', 8, 'JOIN8B');
  console.log(`✅ Classroom: Class 8-B (join code: JOIN8B)`);

  // Sample students for Class 7-A
  const class7Students = [
    { name: 'Aarav Patel', roll: '701' },
    { name: 'Priya Singh', roll: '702' },
    { name: 'Rohan Kumar', roll: '703' },
    { name: 'Ananya Gupta', roll: '704' },
    { name: 'Vikram Reddy', roll: '705' },
    { name: 'Meera Iyer', roll: '706' },
    { name: 'Arjun Sharma', roll: '707' },
    { name: 'Divya Nair', roll: '708' },
  ];

  // Sample students for Class 8-B
  const class8Students = [
    { name: 'Aditya Verma', roll: '801' },
    { name: 'Sneha Rao', roll: '802' },
    { name: 'Karthik Menon', roll: '803' },
    { name: 'Ishita Joshi', roll: '804' },
    { name: 'Rahul Desai', roll: '805' },
    { name: 'Pooja Bhatt', roll: '806' },
    { name: 'Siddharth Das', roll: '807' },
  ];

  const insertStudent = db.prepare(
    "INSERT INTO students (name, classroom_id, roll_number) VALUES (?, ?, ?)"
  );

  const insertMastery = db.prepare(
    "INSERT INTO student_mastery (student_id, node_id, status, diagnostic_score, mastery_score) VALUES (?, ?, ?, ?, ?)"
  );

  // Insert Class 7 students with varied mastery profiles
  const profiles7 = [
    // Aarav: Strong student, most Class 6 mastered, some Class 7 done
    { masteries: {
      '6_whole_numbers': ['mastered', 0.9, 0.9], '6_integers': ['mastered', 0.85, 0.85],
      '6_fractions': ['mastered', 0.8, 0.8], '6_decimals': ['mastered', 0.9, 0.9],
      '6_basic_geometry': ['mastered', 0.85, 0.85], '6_algebra_intro': ['mastered', 0.9, 0.9],
      '6_ratio_proportion': ['mastered', 0.75, 0.75], '6_mensuration_perimeter_area': ['mastered', 0.8, 0.8],
      '7_integers_ops': ['mastered', 0.85, 0.85], '7_fractions_decimals': ['mastered', 0.8, 0.8],
      '7_rational_numbers': ['diagnosed', 0.6, null], '7_simple_equations': ['mastered', 0.9, 0.9],
    }},
    // Priya: Good but struggling with fractions chain
    { masteries: {
      '6_whole_numbers': ['mastered', 0.9, 0.9], '6_integers': ['mastered', 0.8, 0.8],
      '6_fractions': ['gap_found', 0.4, null], '6_decimals': ['gap_found', 0.5, null],
      '6_basic_geometry': ['mastered', 0.85, 0.85], '6_algebra_intro': ['mastered', 0.75, 0.75],
      '6_ratio_proportion': ['mastered', 0.7, 0.7],
      '7_integers_ops': ['mastered', 0.8, 0.8],
      '7_fractions_decimals': ['gap_found', 0.3, null],
    }},
    // Rohan: Weak foundations, many gaps
    { masteries: {
      '6_whole_numbers': ['mastered', 0.75, 0.75], '6_integers': ['gap_found', 0.4, null],
      '6_fractions': ['gap_found', 0.35, null], '6_decimals': ['gap_found', 0.3, null],
      '6_basic_geometry': ['mastered', 0.7, 0.7], '6_algebra_intro': ['gap_found', 0.45, null],
    }},
    // Ananya: Average, working through gaps
    { masteries: {
      '6_whole_numbers': ['mastered', 0.85, 0.85], '6_integers': ['mastered', 0.8, 0.8],
      '6_fractions': ['mastered', 0.75, 0.75], '6_decimals': ['mastered', 0.7, 0.7],
      '6_basic_geometry': ['mastered', 0.8, 0.8], '6_algebra_intro': ['mastered', 0.7, 0.7],
      '6_ratio_proportion': ['gap_found', 0.5, null], '6_mensuration_perimeter_area': ['mastered', 0.75, 0.75],
      '7_integers_ops': ['mastered', 0.7, 0.7], '7_fractions_decimals': ['learning', 0.55, null],
      '7_rational_numbers': ['gap_found', 0.4, null],
    }},
    // Vikram: Strong in math, ahead of class
    { masteries: {
      '6_whole_numbers': ['mastered', 1.0, 1.0], '6_integers': ['mastered', 0.95, 0.95],
      '6_fractions': ['mastered', 0.9, 0.9], '6_decimals': ['mastered', 0.95, 0.95],
      '6_basic_geometry': ['mastered', 0.9, 0.9], '6_algebra_intro': ['mastered', 1.0, 1.0],
      '6_ratio_proportion': ['mastered', 0.85, 0.85], '6_mensuration_perimeter_area': ['mastered', 0.9, 0.9],
      '7_integers_ops': ['mastered', 0.9, 0.9], '7_fractions_decimals': ['mastered', 0.85, 0.85],
      '7_rational_numbers': ['mastered', 0.8, 0.8], '7_simple_equations': ['mastered', 0.95, 0.95],
      '7_lines_angles': ['mastered', 0.85, 0.85], '7_triangles': ['mastered', 0.8, 0.8],
      '7_algebraic_expressions': ['mastered', 0.9, 0.9], '7_exponents_powers': ['mastered', 0.85, 0.85],
    }},
    // Meera: Geometry strong, algebra weak
    { masteries: {
      '6_whole_numbers': ['mastered', 0.8, 0.8], '6_integers': ['mastered', 0.75, 0.75],
      '6_fractions': ['mastered', 0.7, 0.7], '6_decimals': ['mastered', 0.75, 0.75],
      '6_basic_geometry': ['mastered', 0.95, 0.95], '6_algebra_intro': ['gap_found', 0.45, null],
      '6_ratio_proportion': ['mastered', 0.8, 0.8], '6_mensuration_perimeter_area': ['mastered', 0.9, 0.9],
      '7_integers_ops': ['mastered', 0.7, 0.7],
      '7_lines_angles': ['mastered', 0.9, 0.9], '7_triangles': ['mastered', 0.85, 0.85],
      '7_simple_equations': ['gap_found', 0.35, null], '7_perimeter_area': ['mastered', 0.85, 0.85],
    }},
    // Arjun: Just started, few diagnostics done
    { masteries: {
      '6_whole_numbers': ['mastered', 0.8, 0.8], '6_integers': ['diagnosed', 0.6, null],
      '6_fractions': ['diagnosed', 0.5, null],
    }},
    // Divya: Consistent performer
    { masteries: {
      '6_whole_numbers': ['mastered', 0.85, 0.85], '6_integers': ['mastered', 0.8, 0.8],
      '6_fractions': ['mastered', 0.8, 0.8], '6_decimals': ['mastered', 0.85, 0.85],
      '6_basic_geometry': ['mastered', 0.8, 0.8], '6_algebra_intro': ['mastered', 0.75, 0.75],
      '6_ratio_proportion': ['mastered', 0.8, 0.8], '6_mensuration_perimeter_area': ['mastered', 0.8, 0.8],
      '7_integers_ops': ['mastered', 0.75, 0.75], '7_fractions_decimals': ['mastered', 0.7, 0.7],
      '7_simple_equations': ['learning', 0.6, null], '7_algebraic_expressions': ['diagnosed', 0.55, null],
    }},
  ];

  for (let i = 0; i < class7Students.length; i++) {
    const s = class7Students[i];
    const result = insertStudent.run(s.name, class7.lastInsertRowid, s.roll);
    const sid = result.lastInsertRowid;

    if (profiles7[i]) {
      for (const [nodeId, [status, diagScore, mastScore]] of Object.entries(profiles7[i].masteries)) {
        insertMastery.run(sid, nodeId, status, diagScore, mastScore);
      }
    }
    console.log(`  📝 ${s.name} (${s.roll})`);
  }

  // Insert Class 8 students with varied profiles
  const profiles8 = [
    // Aditya: Strong Class 6-7 but struggling with Class 8 linear equations
    { masteries: {
      '6_whole_numbers': ['mastered', 0.9, 0.9], '6_integers': ['mastered', 0.85, 0.85],
      '6_fractions': ['mastered', 0.8, 0.8], '6_decimals': ['mastered', 0.85, 0.85],
      '6_algebra_intro': ['mastered', 0.75, 0.75], '6_ratio_proportion': ['mastered', 0.8, 0.8],
      '6_basic_geometry': ['mastered', 0.85, 0.85], '6_mensuration_perimeter_area': ['mastered', 0.8, 0.8],
      '7_integers_ops': ['mastered', 0.85, 0.85], '7_fractions_decimals': ['mastered', 0.8, 0.8],
      '7_rational_numbers': ['mastered', 0.75, 0.75], '7_simple_equations': ['mastered', 0.7, 0.7],
      '7_algebraic_expressions': ['mastered', 0.8, 0.8], '7_exponents_powers': ['mastered', 0.85, 0.85],
      '7_lines_angles': ['mastered', 0.8, 0.8], '7_triangles': ['mastered', 0.75, 0.75],
      '7_ratio_proportion_adv': ['mastered', 0.8, 0.8], '7_perimeter_area': ['mastered', 0.75, 0.75],
      '8_rational_numbers_adv': ['mastered', 0.7, 0.7],
      '8_linear_equations': ['gap_found', 0.45, null],
      '8_algebraic_expressions': ['gap_found', 0.4, null],
    }},
    // Sneha: Gaps from Class 6 fractions causing cascade failures
    { masteries: {
      '6_whole_numbers': ['mastered', 0.85, 0.85], '6_integers': ['mastered', 0.8, 0.8],
      '6_fractions': ['gap_found', 0.35, null], '6_decimals': ['gap_found', 0.4, null],
      '6_algebra_intro': ['mastered', 0.7, 0.7], '6_basic_geometry': ['mastered', 0.8, 0.8],
      '7_integers_ops': ['mastered', 0.75, 0.75],
      '7_fractions_decimals': ['gap_found', 0.3, null],
      '7_rational_numbers': ['gap_found', 0.25, null],
      '8_rational_numbers_adv': ['gap_found', 0.2, null],
    }},
    // Karthik: Geometry strong, number systems weak
    { masteries: {
      '6_whole_numbers': ['mastered', 0.7, 0.7], '6_integers': ['gap_found', 0.45, null],
      '6_fractions': ['gap_found', 0.4, null],
      '6_basic_geometry': ['mastered', 0.9, 0.9], '6_algebra_intro': ['mastered', 0.7, 0.7],
      '6_mensuration_perimeter_area': ['mastered', 0.85, 0.85],
      '7_lines_angles': ['mastered', 0.85, 0.85], '7_triangles': ['mastered', 0.8, 0.8],
      '7_perimeter_area': ['mastered', 0.8, 0.8],
      '8_quadrilaterals': ['mastered', 0.75, 0.75],
    }},
    // Ishita: Well-rounded, making progress
    { masteries: {
      '6_whole_numbers': ['mastered', 0.9, 0.9], '6_integers': ['mastered', 0.85, 0.85],
      '6_fractions': ['mastered', 0.8, 0.8], '6_decimals': ['mastered', 0.85, 0.85],
      '6_basic_geometry': ['mastered', 0.8, 0.8], '6_algebra_intro': ['mastered', 0.85, 0.85],
      '6_ratio_proportion': ['mastered', 0.8, 0.8], '6_mensuration_perimeter_area': ['mastered', 0.85, 0.85],
      '7_integers_ops': ['mastered', 0.85, 0.85], '7_fractions_decimals': ['mastered', 0.8, 0.8],
      '7_rational_numbers': ['mastered', 0.8, 0.8], '7_simple_equations': ['mastered', 0.85, 0.85],
      '7_algebraic_expressions': ['mastered', 0.8, 0.8], '7_exponents_powers': ['mastered', 0.8, 0.8],
      '7_lines_angles': ['mastered', 0.75, 0.75], '7_triangles': ['mastered', 0.8, 0.8],
      '7_ratio_proportion_adv': ['mastered', 0.75, 0.75], '7_perimeter_area': ['mastered', 0.8, 0.8],
      '8_rational_numbers_adv': ['mastered', 0.75, 0.75], '8_linear_equations': ['mastered', 0.8, 0.8],
      '8_algebraic_expressions': ['learning', 0.55, null],
      '8_exponents_powers': ['mastered', 0.8, 0.8],
      '8_direct_inverse_proportion': ['diagnosed', 0.65, null],
    }},
    // Rahul: Behind on most topics
    { masteries: {
      '6_whole_numbers': ['mastered', 0.75, 0.75], '6_integers': ['gap_found', 0.4, null],
      '6_fractions': ['gap_found', 0.3, null], '6_decimals': ['gap_found', 0.35, null],
      '6_algebra_intro': ['gap_found', 0.4, null], '6_basic_geometry': ['gap_found', 0.5, null],
    }},
    // Pooja: Strong overall
    { masteries: {
      '6_whole_numbers': ['mastered', 0.95, 0.95], '6_integers': ['mastered', 0.9, 0.9],
      '6_fractions': ['mastered', 0.85, 0.85], '6_decimals': ['mastered', 0.9, 0.9],
      '6_basic_geometry': ['mastered', 0.85, 0.85], '6_algebra_intro': ['mastered', 0.9, 0.9],
      '6_ratio_proportion': ['mastered', 0.85, 0.85], '6_mensuration_perimeter_area': ['mastered', 0.9, 0.9],
      '7_integers_ops': ['mastered', 0.9, 0.9], '7_fractions_decimals': ['mastered', 0.85, 0.85],
      '7_rational_numbers': ['mastered', 0.85, 0.85], '7_simple_equations': ['mastered', 0.9, 0.9],
      '7_algebraic_expressions': ['mastered', 0.85, 0.85], '7_exponents_powers': ['mastered', 0.9, 0.9],
      '7_lines_angles': ['mastered', 0.85, 0.85], '7_triangles': ['mastered', 0.85, 0.85],
      '7_ratio_proportion_adv': ['mastered', 0.85, 0.85], '7_perimeter_area': ['mastered', 0.85, 0.85],
      '8_rational_numbers_adv': ['mastered', 0.8, 0.8], '8_linear_equations': ['mastered', 0.85, 0.85],
      '8_algebraic_expressions': ['mastered', 0.8, 0.8], '8_exponents_powers': ['mastered', 0.85, 0.85],
      '8_comparing_quantities': ['mastered', 0.8, 0.8], '8_direct_inverse_proportion': ['mastered', 0.8, 0.8],
      '8_quadrilaterals': ['mastered', 0.8, 0.8], '8_mensuration': ['learning', 0.6, null],
      '8_factorisation': ['diagnosed', 0.65, null],
    }},
    // Siddharth: New student, just started
    { masteries: {
      '6_whole_numbers': ['diagnosed', 0.7, null],
    }},
  ];

  for (let i = 0; i < class8Students.length; i++) {
    const s = class8Students[i];
    const result = insertStudent.run(s.name, class8.lastInsertRowid, s.roll);
    const sid = result.lastInsertRowid;

    if (profiles8[i]) {
      for (const [nodeId, [status, diagScore, mastScore]] of Object.entries(profiles8[i].masteries)) {
        insertMastery.run(sid, nodeId, status, diagScore, mastScore);
      }
    }
    console.log(`  📝 ${s.name} (${s.roll})`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`\n📋 Demo Credentials:`);
  console.log(`   Teacher Code: TEACH2026`);
  console.log(`   Class 7-A Join Code: JOIN7A`);
  console.log(`   Class 8-B Join Code: JOIN8B`);
  console.log(`\n   Sample student: Enter any name from above + join code`);

  db.close();
}

seed();
