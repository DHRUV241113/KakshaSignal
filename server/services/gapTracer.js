// Gap Tracer Service
// Core algorithm: Given a failed diagnostic, trace backward through the prerequisite
// knowledge graph to find the ROOT CAUSE of the learning gap.
// Uses BFS (breadth-first search) backward through prerequisites.

import knowledgeGraph, { getPrerequisites, getNode, getEdgeMetadata } from '../data/knowledgeGraph.js';
import { getDb } from '../db/schema.js';

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
 * @returns {Object} - { rootGaps: [...], traceTree: {...}, recommendedPath: [...], diagnosticEvidence: {...} }
 */
export function traceGap(studentId, failedNodeId) {
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

  const diagnosticEvidence = {
    nodeId: failedNodeId,
    nodeLabel: targetNode.label,
    classLevel: targetNode.class,
    status: targetMastery?.status || (diagnosticScore !== null && diagnosticScore < 0.7 ? 'gap_found' : 'not_started'),
    score: diagnosticScore,
    percentage: diagnosticScore !== null ? Math.round(diagnosticScore * 100) : null,
    passed: diagnosticScore !== null ? diagnosticScore >= 0.7 : false,
    attempts: targetMastery?.attempts || (recentAttempt ? 1 : 0),
    correctAnswers: recentAttempt?.correct_answers ?? (diagnosticScore !== null ? Math.round(diagnosticScore * 5) : null),
    totalQuestions: recentAttempt?.total_questions ?? (diagnosticScore !== null ? 5 : null)
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
      return {
        ...node,
        mastery: masteryMap[id] || { status: 'not_started', diagnostic_score: null },
        rationale: CURRICULAR_RATIONALE[id] || node?.description || ''
      };
    }),
    allGaps: allGaps.map(id => {
      const node = getNode(id);
      return {
        ...node,
        mastery: masteryMap[id] || { status: 'not_started', diagnostic_score: null },
        rationale: CURRICULAR_RATIONALE[id] || node?.description || ''
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

  return { students: summary, nodes: allNodes };
}

export default { traceGap, getClassGapSummary };
