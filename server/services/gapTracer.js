// Gap Tracer Service
// Core algorithm: Given a failed diagnostic, trace backward through the prerequisite
// knowledge graph to find the ROOT CAUSE of the learning gap.
// Uses BFS (breadth-first search) backward through prerequisites.

import knowledgeGraph, { getPrerequisites, getNode, getEdgeMetadata } from '../data/knowledgeGraph.js';
import { getDb } from '../db/schema.js';
import questions from '../data/questions.js';
import { analyzeMisconception as analyzeQuestionMisconception } from '../data/questionEnhancements.js';

// Pedagogical rationale mapping based on NCERT Mathematics curriculum dependencies
const CURRICULAR_RATIONALE = {
  '6_fractions': 'Mastering basic fractions, equivalent fractions, and common denominators is essential before performing signed rational number operations.',
  '6_integers': 'Understanding positive/negative signs and integer operations on the number line is required before operating with signed numbers.',
  '6_decimals': 'Decimal place value (tenths/hundredths) and conversions are required to compare and compute mixed rational/decimal forms.',
  '6_whole_numbers': 'Foundational properties (closure, commutativity, distributivity) on whole numbers precede abstract extensions.',
  '6_algebra_intro': 'Understanding variables as unknown quantities is essential before setting up equations and combining expressions.',
  '6_ratio_proportion': 'Proportional reasoning and the unitary method form the foundation for percentages and rate comparison.',
  '6_basic_geometry': 'Basic definitions of points, lines, angles, and polygons are required before proving polygon angle properties.',
  '6_mensuration_perimeter_area': 'Understanding 2D perimeter and area for rectangles/squares is the direct basis for multi-shape mensuration.',
  '7_integers_ops': 'Multiplication and division sign rules are required for multi-step algebraic expansion and rational operations.',
  '7_fractions_decimals': 'Fraction multiplication, division, and reciprocals must be mastered before computing complex rational terms.',
  '7_rational_numbers': 'The formal definition of rational numbers (p/q, q ≠ 0) and standard arithmetic operations bridge arithmetic to algebra.',
  '7_simple_equations': 'Transposition and algebraic balance methods are required to solve equations with variables on both sides.',
  '7_lines_angles': 'Parallel line theorems and transversals are foundational for understanding quadrilateral angles and polygons.',
  '7_triangles': 'Angle sum property and triangle congruence are prerequisites for analyzing multi-sided quadrilaterals.',
  '7_algebraic_expressions': 'Combining like terms and distributive expansion are prerequisites for polynomial identities and factorisation.',
  '7_exponents_powers': 'Laws of positive integer exponents are direct prerequisites for negative integral exponents and scientific form.',
  '7_ratio_proportion_adv': 'Percentages, profit/loss, and simple interest are essential prerequisites for compound interest.',
  '7_perimeter_area': 'Area of triangles and circles is required before computing surface areas and volumes of 3D cylinders.',
  '8_rational_numbers_adv': 'Target competency: Applying abstract closure, commutativity, associativity, and distributivity across rational numbers.',
  '8_linear_equations': 'Target competency: Solving equations with variables on both sides and formulating algebraic word problems.',
  '8_algebraic_expressions': 'Target competency: Polynomial multiplication and standard algebraic identities.',
  '8_quadrilaterals': 'Target competency: Properties and angle sum rules of parallelograms, rhombuses, and trapeziums.'
};

/**
 * Trace the root cause of a learning gap for a student.
 * Given a node where the student failed, traces backward through prerequisites
 * to find which foundational concepts are actually missing.
 *
 * @param {number} studentId - The student's ID
 * @param {string} failedNodeId - The node ID where the student failed the diagnostic
 * @param {Object} [options] - Optional assessment context ({ errorCount, answers })
 * @returns {Object} - { rootGaps: [...], traceTree: {...}, recommendedPath: [...], diagnosticEvidence: {...} }
 */
export function traceGap(studentId, failedNodeId, options = {}) {
  const targetNode = getNode(failedNodeId);
  if (!targetNode) {
    return { error: `Node '${failedNodeId}' not found in knowledge graph` };
  }

  const db = getDb();

  // Get all mastery records for this student
  const masteryRecords = db.prepare(
    'SELECT node_id, status, diagnostic_score, mastery_score, attempts FROM student_mastery WHERE student_id = ?'
  ).all(studentId);

  const masteryMap = {};
  for (const rec of masteryRecords) {
    masteryMap[rec.node_id] = rec;
  }

  // Get most recent quiz attempt for target node to provide concrete assessment evidence
  const recentAttempt = db.prepare(
    'SELECT * FROM quiz_attempts WHERE student_id = ? AND node_id = ? ORDER BY created_at DESC'
  ).all(studentId, failedNodeId)[0];

  const targetMastery = masteryMap[failedNodeId];
  const diagnosticScore = targetMastery?.diagnostic_score !== null && targetMastery?.diagnostic_score !== undefined
    ? targetMastery.diagnostic_score
    : (recentAttempt?.score ?? null);

  // Compute error count and evidence weighting to avoid declaring confirmed weakness from a single fluke
  let errorCount = 2; // Default to confirmed threshold if unassessed or general graph trace
  if (options.errorCount !== undefined) {
    errorCount = options.errorCount;
  } else if (options.answers && Array.isArray(options.answers)) {
    const qList = questions[failedNodeId] || [];
    errorCount = options.answers.filter(ans => {
      if (typeof ans.isCorrect === 'boolean') return !ans.isCorrect;
      const q = qList.find(item => item.id === ans.questionId);
      return q ? q.answer !== ans.selectedOption : true;
    }).length;
  } else if (recentAttempt) {
    const totalQ = recentAttempt.total_questions || 5;
    const correctQ = recentAttempt.correct_answers !== null && recentAttempt.correct_answers !== undefined
      ? recentAttempt.correct_answers
      : Math.round((recentAttempt.score || 0) * totalQ);
    errorCount = Math.max(0, totalQ - correctQ);
  } else if (diagnosticScore !== null) {
    errorCount = Math.max(0, Math.round(5 * (1 - diagnosticScore)));
  }

  const isSingleMistake = (errorCount === 1);
  const confidence = errorCount === 0 ? 'none' : (isSingleMistake ? 'suspected' : 'confirmed');
  const isConfirmed = !isSingleMistake && errorCount > 0;

  // Extract and analyze misconceptions
  const identifiedMisconceptions = [];
  try {
    let answersToCheck = options.answers;
    if (!answersToCheck && recentAttempt && recentAttempt.questions_json && recentAttempt.answers_json) {
      const qIds = JSON.parse(recentAttempt.questions_json);
      const aOpts = JSON.parse(recentAttempt.answers_json);
      answersToCheck = qIds.map((qId, i) => ({ questionId: qId, selectedOption: aOpts[i] }));
    }
    if (Array.isArray(answersToCheck)) {
      const qList = questions[failedNodeId] || [];
      for (const ans of answersToCheck) {
        const q = qList.find(item => item.id === ans.questionId);
        if (q && q.answer !== ans.selectedOption) {
          identifiedMisconceptions.push(analyzeMisconception(ans.questionId, ans.selectedOption, failedNodeId));
        }
      }
    }
  } catch (_) {}

  const evidenceRationale = isSingleMistake
    ? 'Single mistake observed (1 error). This may be a careless computational slip or isolated difficulty. The system categorizes this gap as SUSPECTED/TENTATIVE and avoids declaring a confirmed weakness without further corroboration.'
    : (errorCount >= 2
      ? `Confirmed learning deficit based on ${errorCount} corroborated errors indicating an underlying foundational gap.`
      : 'All items answered correctly.');

  const diagnosticEvidence = {
    nodeId: failedNodeId,
    nodeLabel: targetNode.label,
    classLevel: targetNode.class,
    status: isSingleMistake
      ? 'suspected_gap'
      : (targetMastery?.status || (diagnosticScore !== null && diagnosticScore < 0.7 ? 'gap_found' : 'not_started')),
    score: diagnosticScore,
    percentage: diagnosticScore !== null ? Math.round(diagnosticScore * 100) : null,
    passed: diagnosticScore !== null ? diagnosticScore >= 0.7 : false,
    attempts: targetMastery?.attempts || (recentAttempt ? 1 : 0),
    correctAnswers: recentAttempt?.correct_answers ?? (diagnosticScore !== null ? Math.round(diagnosticScore * 5) : null),
    totalQuestions: recentAttempt?.total_questions ?? (diagnosticScore !== null ? 5 : null),
    errorCount,
    confidence,
    isConfirmed,
    evidenceRationale,
    identifiedMisconceptions
  };

  // BFS backward through prerequisites
  const visited = new Set();
  const queue = [failedNodeId];
  const rootGaps = []; // Nodes that are root causes (no further unmastered prereqs)
  const traceEdges = []; // For building the trace tree visualization
  const allGaps = []; // All gap nodes found during traversal

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const mastery = masteryMap[current];
    const isMastered = mastery && mastery.status === 'mastered';

    // If this node is already mastered, it's not a gap — skip
    if (isMastered && current !== failedNodeId) continue;

    const prereqs = getPrerequisites(current);

    // Check if any prerequisite is NOT mastered
    let hasUnmasteredPrereq = false;
    for (const prereqId of prereqs) {
      const prereqMastery = masteryMap[prereqId];
      const prereqMastered = prereqMastery && prereqMastery.status === 'mastered';

      if (!prereqMastered) {
        hasUnmasteredPrereq = true;
        const edgeMeta = getEdgeMetadata(prereqId, current);
        traceEdges.push({
          from: prereqId,
          to: current,
          type: edgeMeta?.type || 'direct_ncert_dependency',
          ncertSource: edgeMeta?.ncertSource || null,
          rationale: edgeMeta?.rationale || null
        });
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }

    // If no unmastered prerequisites, this is a root gap
    if (!hasUnmasteredPrereq && !isMastered) {
      rootGaps.push(current);
    }

    if (!isMastered) {
      allGaps.push(current);
    }
  }

  // Build the recommended learning path: topological order from root gaps → failed node
  const recommendedPath = buildLearningPath(rootGaps, failedNodeId, allGaps);

  // Build trace tree for visualization
  const traceTree = buildTraceTree(failedNodeId, traceEdges, masteryMap);

  return {
    failedNode: failedNodeId,
    diagnosticEvidence,
    rootGaps: rootGaps.map(id => {
      const node = getNode(id);
      const whyIdentified = isSingleMistake
        ? `Tentatively suspected from single mistake on ${targetNode.label}; builds upon ${node?.label || id} (Grade ${node?.class || 6}). Additional diagnostic evidence required before confirmation.`
        : `Confirmed root gap: ${errorCount} errors in ${targetNode.label} trace directly backward through the NCERT prerequisite graph to foundational deficits in ${node?.label || id} (Grade ${node?.class || 6}).`;

      return {
        ...node,
        mastery: masteryMap[id] || { status: 'not_started', diagnostic_score: null },
        rationale: CURRICULAR_RATIONALE[id] || node?.description || '',
        confidence,
        isConfirmed,
        status: isSingleMistake ? 'suspected_gap' : (masteryMap[id]?.status || 'gap_found'),
        whyIdentified
      };
    }),
    allGaps: allGaps.map(id => {
      const node = getNode(id);
      return {
        ...node,
        mastery: masteryMap[id] || { status: 'not_started', diagnostic_score: null },
        rationale: CURRICULAR_RATIONALE[id] || node?.description || '',
        confidence,
        isConfirmed
      };
    }),
    traceTree,
    traceEdges,
    recommendedPath: recommendedPath.map((id, idx) => {
      const node = getNode(id);
      let edgeToNext = null;
      if (idx < recommendedPath.length - 1) {
        const nextId = recommendedPath[idx + 1];
        const meta = getEdgeMetadata(id, nextId);
        if (meta) {
          edgeToNext = {
            toNodeId: nextId,
            toNodeLabel: getNode(nextId)?.label,
            ncertSource: meta.ncertSource,
            type: meta.type,
            rationale: meta.rationale
          };
        }
      }
      return {
        ...node,
        mastery: masteryMap[id] || { status: 'not_started', diagnostic_score: null },
        rationale: CURRICULAR_RATIONALE[id] || node?.description || '',
        edgeToNext
      };
    })
  };
}

/**
 * Build a topologically-sorted learning path from root gaps to the target node.
 * Only includes nodes that are in the allGaps set.
 */
function buildLearningPath(rootGaps, targetNodeId, allGaps) {
  const gapSet = new Set(allGaps);

  // Topological sort using Kahn's algorithm on the subgraph of gaps
  const inDegree = {};
  const adjList = {};

  for (const nodeId of allGaps) {
    inDegree[nodeId] = 0;
    adjList[nodeId] = [];
  }

  for (const [prereq, dep] of knowledgeGraph.edges) {
    if (gapSet.has(prereq) && gapSet.has(dep)) {
      adjList[prereq].push(dep);
      inDegree[dep] = (inDegree[dep] || 0) + 1;
    }
  }

  // Start with nodes that have no incoming edges in the gap subgraph
  const queue = [];
  for (const nodeId of allGaps) {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  }

  const sorted = [];
  while (queue.length > 0) {
    // Pick node with lowest class first (prioritize foundational concepts)
    queue.sort((a, b) => {
      const nodeA = getNode(a);
      const nodeB = getNode(b);
      return (nodeA?.class || 0) - (nodeB?.class || 0);
    });

    const current = queue.shift();
    sorted.push(current);

    for (const neighbor of (adjList[current] || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

/**
 * Build a tree structure for visualization of the prerequisite trace.
 */
function buildTraceTree(rootNodeId, traceEdges, masteryMap) {
  const children = {};
  for (const edge of traceEdges) {
    if (!children[edge.to]) children[edge.to] = [];
    children[edge.to].push(edge.from);
  }

  function buildNode(nodeId, depth = 0) {
    const node = getNode(nodeId);
    const mastery = masteryMap[nodeId] || { status: 'not_started', diagnostic_score: null };
    return {
      id: nodeId,
      label: node?.label || nodeId,
      class: node?.class || 0,
      status: mastery.status,
      score: mastery.diagnostic_score,
      depth,
      children: (children[nodeId] || []).map(childId => buildNode(childId, depth + 1))
    };
  }

  return buildNode(rootNodeId);
}

/**
 * Get a summary of all gaps for all students in a classroom.
 * Used for the teacher's class overview heatmap.
 */
export function getClassGapSummary(classroomId) {
  const db = getDb();

  const students = db.prepare(
    'SELECT id, name, roll_number FROM students WHERE classroom_id = ?'
  ).all(classroomId);

  const allNodes = knowledgeGraph.nodes;
  const summary = [];

  for (const student of students) {
    const masteryRecords = db.prepare(
      'SELECT node_id, status, diagnostic_score, mastery_score FROM student_mastery WHERE student_id = ?'
    ).all(student.id);

    const masteryMap = {};
    for (const rec of masteryRecords) {
      masteryMap[rec.node_id] = rec;
    }

    const studentSummary = {
      id: student.id,
      name: student.name,
      rollNumber: student.roll_number,
      totalNodes: allNodes.length,
      mastered: 0,
      gapFound: 0,
      inProgress: 0,
      notStarted: 0,
      nodeStatuses: {}
    };

    for (const node of allNodes) {
      const mastery = masteryMap[node.id];
      const status = mastery?.status || 'not_started';
      studentSummary.nodeStatuses[node.id] = {
        status,
        score: mastery?.diagnostic_score || null,
        masteryScore: mastery?.mastery_score || null
      };

      if (status === 'mastered') studentSummary.mastered++;
      else if (status === 'gap_found') studentSummary.gapFound++;
      else if (status === 'not_started') studentSummary.notStarted++;
      else studentSummary.inProgress++;
    }

    summary.push(studentSummary);
  }

  // Calculate total real assessment attempts for this classroom
  let totalAssessmentAttempts = 0;
  try {
    const studentIds = new Set(students.map(s => s.id));
    if (studentIds.size > 0) {
      const allAttempts = db.prepare('SELECT student_id FROM quiz_attempts').all();
      totalAssessmentAttempts = allAttempts.filter(a => studentIds.has(a.student_id)).length;
    }
  } catch (_) {}

  // Compute priority support recommendations for students with active learning gaps
  const prioritySupportStudents = [];
  for (const s of summary) {
    if (s.gapFound > 0) {
      const gapEntries = Object.entries(s.nodeStatuses)
        .filter(([_, stat]) => stat.status === 'gap_found')
        .sort((a, b) => {
          const classA = getNode(a[0])?.class || 0;
          const classB = getNode(b[0])?.class || 0;
          return classB - classA; // Highest class first
        });

      if (gapEntries.length > 0) {
        const primaryGapId = gapEntries[0][0];
        const primaryNode = getNode(primaryGapId);

        let rootCauseLabel = primaryNode?.label || primaryGapId;
        let rootCauseClass = primaryNode?.class || 6;
        let rootCauseId = primaryGapId;
        try {
          const t = traceGap(s.id, primaryGapId);
          if (t && t.rootGaps && t.rootGaps.length > 0) {
            rootCauseLabel = t.rootGaps[0].label;
            rootCauseClass = t.rootGaps[0].class;
            rootCauseId = t.rootGaps[0].id;
          }
        } catch (_) {}

        prioritySupportStudents.push({
          studentId: s.id,
          studentName: s.name,
          rollNumber: s.rollNumber,
          gapCount: s.gapFound,
          primaryGapId,
          primaryGapTopic: primaryNode?.label || primaryGapId,
          primaryGapClass: primaryNode?.class || 6,
          rootCauseId,
          rootCausePrerequisite: rootCauseLabel,
          rootCauseClass,
          recommendedIntervention: `Assign Remedial Step: ${rootCauseLabel} (Grade ${rootCauseClass})`
        });
      }
    }
  }

  // Sort priority support students by highest gap count first
  prioritySupportStudents.sort((a, b) => b.gapCount - a.gapCount);

  // Compute topic-level class statistics
  const topicStats = {};
  for (const node of allNodes) {
    let masteredCount = 0;
    let gapCount = 0;
    for (const s of summary) {
      const st = s.nodeStatuses[node.id]?.status;
      if (st === 'mastered') masteredCount++;
      else if (st === 'gap_found') gapCount++;
    }
    topicStats[node.id] = {
      masteredCount,
      gapCount,
      totalAssessed: masteredCount + gapCount
    };
  }

  return {
    students: summary,
    nodes: allNodes,
    totalAssessmentAttempts,
    prioritySupportStudents,
    topicStats
  };
}

/**
 * Deterministically analyzes student answers for misconceptions and traces to root prerequisite gaps.
 */
export function analyzeMisconception(questionId, selectedOption, targetNodeId = null) {
  let q = null;
  let resolvedNodeId = targetNodeId;
  if (targetNodeId && questions[targetNodeId]) {
    q = questions[targetNodeId].find(item => item.id === questionId);
  }
  if (!q) {
    for (const [nId, qList] of Object.entries(questions)) {
      const match = qList.find(item => item.id === questionId);
      if (match) {
        q = match;
        resolvedNodeId = nId;
        break;
      }
    }
  }
  return analyzeQuestionMisconception(q, selectedOption, resolvedNodeId);
}

/**
 * Trace root gap directly from a set of student answers with explicit misconception corroboration
 * and ambiguous single-mistake protection.
 */
export function traceRootGapFromMisconceptions(studentId, targetNodeId, answers = []) {
  const incorrectAnswers = (answers || []).filter(a => {
    if (typeof a.isCorrect === 'boolean') return !a.isCorrect;
    const qList = questions[targetNodeId] || [];
    const q = qList.find(item => item.id === a.questionId);
    return q ? q.answer !== a.selectedOption : true;
  });

  const misconceptions = incorrectAnswers.map(ans => {
    return analyzeMisconception(ans.questionId, ans.selectedOption, targetNodeId);
  });

  const errorCount = incorrectAnswers.length;
  const isAmbiguousSingleMistake = (errorCount === 1);
  const confidence = errorCount === 0 ? 'none' : (isAmbiguousSingleMistake ? 'suspected' : 'confirmed');

  const trace = traceGap(studentId, targetNodeId, { errorCount, answers });

  const primaryMisconception = misconceptions[0] || null;
  let gapExplanation = '';
  if (isAmbiguousSingleMistake) {
    gapExplanation = `Single mistake detected: "${primaryMisconception ? primaryMisconception.misconception : 'Unconfirmed computational error'}". Because only 1 ambiguous error was observed, this is classified as a SUSPECTED gap. An adaptive probe is recommended before assigning remediation.`;
  } else if (errorCount >= 2) {
    const labels = misconceptions.map(m => m.label).slice(0, 2).join(', ');
    gapExplanation = `Corroborated by ${errorCount} errors displaying recurring misconceptions (${labels}). Traces backward through NCERT prerequisite dependencies to foundational deficits in ${trace.rootGaps.map(g => g.label).join(' & ')}.`;
  } else {
    gapExplanation = 'No learning gap detected; all evaluated responses demonstrate mastery.';
  }

  return {
    ...trace,
    errorCount,
    confidence,
    isConfirmed: !isAmbiguousSingleMistake && errorCount > 0,
    primaryMisconception,
    allMisconceptions: misconceptions,
    gapExplanation
  };
}

export default {
  traceGap,
  getClassGapSummary,
  analyzeMisconception,
  traceRootGapFromMisconceptions
};
