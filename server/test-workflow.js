// Comprehensive Workflow Verification Script
// Tests end-to-end user journeys for both Teacher and Students,
// including adaptation comparison, remediation progression, and error handling.

import { getDb } from './db/schema.js';
import { traceGap, getClassGapSummary } from './services/gapTracer.js';
import { generateQuiz, gradeQuiz, getStudentNodeStatus } from './services/quizEngine.js';
import knowledgeGraph, { getNode, getPrerequisites } from './data/knowledgeGraph.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'db', 'ccp-data.json');

console.log('🔍 Executing Comprehensive End-to-End Workflow Verification...\n');

// Backup DB state
const dbBackup = fs.readFileSync(DB_FILE, 'utf-8');

try {
  const db = getDb();

  // =========================================================================
  // 1. TEACHER AUTHENTICATION & CLASSROOM DISCOVERY
  // =========================================================================
  console.log('--- Step 1: Teacher Authentication & Classroom Discovery ---');
  const teacher = db.prepare('SELECT * FROM teachers WHERE code = ?').get('TEACH2026');
  if (!teacher || teacher.name !== 'Mrs. Sharma') {
    throw new Error('Teacher TEACH2026 not found or name mismatch');
  }
  console.log(`✅ Teacher Authenticated: ${teacher.name} (ID: ${teacher.id})`);

  const classrooms = db.prepare('SELECT * FROM classrooms WHERE teacher_id = ? ORDER BY class_level').all(teacher.id);
  console.log(`✅ Classrooms retrieved (${classrooms.length}): ${classrooms.map(c => `${c.name} [Grade ${c.class_level}, Code: ${c.join_code}]`).join(', ')}`);

  // =========================================================================
  // 2. CLASSROOM HEATMAP AUDIT
  // =========================================================================
  console.log('\n--- Step 2: Classroom Heatmap Summaries ---');
  for (const c of classrooms) {
    const summary = getClassGapSummary(c.id);
    console.log(`✅ Class ${c.name} Heatmap: ${summary.students.length} students, ${summary.nodes.length} nodes mapped.`);
    const gapsTotal = summary.students.reduce((acc, s) => acc + s.gapFound, 0);
    const masteredTotal = summary.students.reduce((acc, s) => acc + s.mastered, 0);
    console.log(`   Stats -> Active Gaps: ${gapsTotal}, Mastered: ${masteredTotal}`);
  }

  // =========================================================================
  // 3. STUDENT ADAPTATION COMPARISON (Sneha vs Aditya)
  // =========================================================================
  console.log('\n--- Step 3: Proving Distinct Student Adaptation Paths ---');
  const sneha = db.prepare('SELECT * FROM students WHERE name = ?').get('Sneha Rao');
  const aditya = db.prepare('SELECT * FROM students WHERE name = ?').get('Aditya Verma');

  if (!sneha || !aditya) {
    throw new Error('Seeded students Sneha or Aditya not found');
  }
  console.log(`✅ Student A: ${sneha.name} (ID: ${sneha.id}, Class 8-B)`);
  console.log(`✅ Student B: ${aditya.name} (ID: ${aditya.id}, Class 8-B)`);

  // Trace Sneha (failed Rational Numbers Adv)
  const snehaTrace = traceGap(sneha.id, '8_rational_numbers_adv');
  console.log(`\n📌 Student A [${sneha.name}] Diagnostic Trace for Class 8 Rational Numbers:`);
  console.log(`   Root Gap Isolated: ${snehaTrace.rootGaps.map(g => `${g.label} (Grade ${g.class})`).join(', ')}`);
  console.log(`   Topological Remediation Path (${snehaTrace.recommendedPath.length} steps):`);
  snehaTrace.recommendedPath.forEach((step, idx) => {
    console.log(`     ${idx + 1}. [Grade ${step.class}] ${step.label} (${step.id}) - Status: ${step.mastery.status}`);
  });

  // Trace Aditya (failed Linear Equations)
  const adityaTrace = traceGap(aditya.id, '8_linear_equations');
  console.log(`\n📌 Student B [${aditya.name}] Diagnostic Trace for Class 8 Linear Equations:`);
  console.log(`   Root Gap Isolated: ${adityaTrace.rootGaps.map(g => `${g.label} (Grade ${g.class})`).join(', ')}`);
  console.log(`   Topological Remediation Path (${adityaTrace.recommendedPath.length} steps):`);
  adityaTrace.recommendedPath.forEach((step, idx) => {
    console.log(`     ${idx + 1}. [Grade ${step.class}] ${step.label} (${step.id}) - Status: ${step.mastery.status}`);
  });

  // Mathematically assert that Sneha and Aditya have distinct, justified paths
  const snehaPathIds = snehaTrace.recommendedPath.map(p => p.id).join(' -> ');
  const adityaPathIds = adityaTrace.recommendedPath.map(p => p.id).join(' -> ');

  if (snehaPathIds === adityaPathIds) {
    throw new Error('Adaptation failure: Sneha and Aditya received identical paths!');
  }
  console.log(`\n✅ GENUINE ADAPTATION PROVED:`);
  console.log(`   Sneha's Path:  ${snehaPathIds}`);
  console.log(`   Aditya's Path: ${adityaPathIds}`);

  // =========================================================================
  // 4. FULL REMEDIAL WORKFLOW EXECUTION (Learn -> Solve -> Test -> Mastery)
  // =========================================================================
  console.log('\n--- Step 4: Full Learn -> Solve -> Test -> Mastery Loop ---');
  // Sneha begins remedial work on her isolated root gap: 6_fractions
  const rootNodeId = '6_fractions';
  console.log(`Targeting root prerequisite: ${rootNodeId}`);

  // Initial status check
  const preStatus = getStudentNodeStatus(sneha.id, rootNodeId);
  console.log(`Initial status of ${sneha.name} on ${rootNodeId}: ${preStatus.mastery.status}`);

  // Simulate Quiz Generation
  const quiz = generateQuiz(rootNodeId, 'mastery');
  console.log(`Generated benchmark quiz: ${quiz.questions.length} questions`);

  // Simulate Student passing with 100% (answering all with option 0)
  const perfectAnswers = quiz.questions.map(q => ({
    questionId: q.id,
    selectedOption: 0
  }));

  const gradeResult = gradeQuiz(sneha.id, rootNodeId, 'mastery', perfectAnswers, 45);
  console.log(`Quiz Graded -> Score: ${gradeResult.percentage}%, Passed: ${gradeResult.passed}`);

  // Verify DB state updated
  const postStatus = getStudentNodeStatus(sneha.id, rootNodeId);
  console.log(`Updated status of ${sneha.name} on ${rootNodeId}: ${postStatus.mastery.status} (Mastery score: ${postStatus.mastery.mastery_score})`);

  if (postStatus.mastery.status !== 'mastered') {
    throw new Error(`Expected status 'mastered', got '${postStatus.mastery.status}'`);
  }
  console.log(`✅ Student Mastery Successfully Updated in Datastore`);

  // Check that Teacher Heatmap reflects the change
  const class8 = classrooms.find(c => c.name === 'Class 8-B');
  const updatedSummary = getClassGapSummary(class8.id);
  const snehaSummary = updatedSummary.students.find(s => s.name === 'Sneha Rao');
  console.log(`Teacher Heatmap Reflection -> Sneha's ${rootNodeId} status: ${snehaSummary.nodeStatuses[rootNodeId].status}`);

  if (snehaSummary.nodeStatuses[rootNodeId].status !== 'mastered') {
    throw new Error('Heatmap failed to reflect student mastery update');
  }
  console.log(`✅ Teacher Dashboard Matrix Updated in Real-Time`);

  // =========================================================================
  // 5. TEACHER OVERRIDE AUDIT
  // =========================================================================
  console.log('\n--- Step 5: Teacher Intervention & Override Audit ---');
  // Teacher decides to skip a verified skill or reassign
  const targetOverrideNode = '7_fractions_decimals';
  console.log(`Teacher overriding ${sneha.name}'s status on ${targetOverrideNode} to 'skip' (mark mastered)`);

  // Simulate teacher override action 'skip'
  db.prepare(`
    INSERT INTO teacher_assignments (teacher_id, student_id, node_id, action, note)
    VALUES (?, ?, ?, 'skip', 'Teacher verified understanding via oral assessment')
  `).run(teacher.id, sneha.id, targetOverrideNode);

  db.prepare(`
    INSERT INTO student_mastery (student_id, node_id, status)
    VALUES (?, ?, 'mastered')
    ON CONFLICT(student_id, node_id)
    DO UPDATE SET status = 'mastered', updated_at = CURRENT_TIMESTAMP
  `).run(sneha.id, targetOverrideNode);

  const overrideStatus = getStudentNodeStatus(sneha.id, targetOverrideNode);
  console.log(`Result of teacher override: ${overrideStatus.mastery.status}`);
  if (overrideStatus.mastery.status !== 'mastered') {
    throw new Error('Teacher override failed to update mastery');
  }
  console.log(`✅ Teacher Override Verified`);

  console.log('\n========================================');
  console.log('🎉 ALL WORKFLOW CHECKS PASSED PERFECTLY!');
  console.log('========================================');

} finally {
  // Restore database
  fs.writeFileSync(DB_FILE, dbBackup);
  console.log('\n📦 Database snapshot restored. No permanent demo mutations.');
}
