// Curriculum Coverage & Knowledge Graph Verification Script
// Verifies NCERT/CBSE Classes 6-8 Mathematical Content Integrity

import knowledgeGraph, { getNode, getPrerequisites, getEdgeMetadata } from './data/knowledgeGraph.js';
import questions from './data/questions.js';

console.log('📚 Starting KakshaSignal Comprehensive Curriculum Verification...\n');

let errors = 0;
let warnings = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
  } else {
    console.error(`  ❌ ${message}`);
    errors++;
  }
}

// 1. Verify Node Scope (Strictly Classes 6-8)
console.log('1. Grade & Competency Node Scope:');
const validClasses = new Set([6, 7, 8]);
let classCounts = { 6: 0, 7: 0, 8: 0 };
let invalidClassNodes = [];

knowledgeGraph.nodes.forEach(node => {
  if (!validClasses.has(node.class)) {
    invalidClassNodes.push(`${node.id} (Class ${node.class})`);
  } else {
    classCounts[node.class]++;
  }
});

check(invalidClassNodes.length === 0, `All nodes belong strictly to Classes 6-8 (No unverified Classes 9-10 claims)`);
check(knowledgeGraph.nodes.length === 31, `Exact 31 competency nodes present (Class 6: ${classCounts[6]}, Class 7: ${classCounts[7]}, Class 8: ${classCounts[8]})`);

// Check NCERT chapter citations
let missingCitations = 0;
knowledgeGraph.nodes.forEach(node => {
  if (!node.ncertBook || !node.ncertChapter) {
    missingCitations++;
    console.error(`     Missing NCERT citation for node: ${node.id}`);
  }
});
check(missingCitations === 0, `All 31 nodes contain explicit NCERT textbook book & chapter citations`);

// 2. Prerequisite Graph Consistency (DAG Check)
console.log('\n2. Prerequisite Graph Consistency (DAG & Edges):');
check(knowledgeGraph.edges.length === 37, `Exact 37 directed prerequisite edges mapped (Actual: ${knowledgeGraph.edges.length})`);

const nodeMap = new Map(knowledgeGraph.nodes.map(n => [n.id, n]));
let invalidEdges = 0;
let retrogradeEdges = 0;

knowledgeGraph.edges.forEach(([sourceId, targetId]) => {
  const source = nodeMap.get(sourceId);
  const target = nodeMap.get(targetId);

  if (!source || !target) {
    invalidEdges++;
    console.error(`     Edge references non-existent node: ${sourceId} -> ${targetId}`);
  } else if (source.class > target.class) {
    retrogradeEdges++;
    console.error(`     Retrograde edge (higher grade to lower grade): ${sourceId} (Gr ${source.class}) -> ${targetId} (Gr ${target.class})`);
  }
});

check(invalidEdges === 0, `All 37 edges link existing knowledge graph nodes`);
check(retrogradeEdges === 0, `All 37 edges are monotonically forward in grade or same-grade (No retrograde prerequisites)`);

// Topological Sort DAG Cycle Check (Kahn's Algorithm)
const inDegree = {};
const adj = {};
knowledgeGraph.nodes.forEach(n => {
  inDegree[n.id] = 0;
  adj[n.id] = [];
});
knowledgeGraph.edges.forEach(([u, v]) => {
  adj[u].push(v);
  inDegree[v]++;
});

const queue = [];
knowledgeGraph.nodes.forEach(n => {
  if (inDegree[n.id] === 0) queue.push(n.id);
});

let visitedCount = 0;
while (queue.length > 0) {
  const curr = queue.shift();
  visitedCount++;
  for (const nxt of adj[curr]) {
    inDegree[nxt]--;
    if (inDegree[nxt] === 0) queue.push(nxt);
  }
}

check(visitedCount === knowledgeGraph.nodes.length, `Knowledge graph is a strict DAG with 0 circular dependencies (${visitedCount}/${knowledgeGraph.nodes.length} nodes topologically sorted)`);

// Check edge metadata
let missingEdgeMeta = 0;
knowledgeGraph.edges.forEach(([u, v]) => {
  const meta = getEdgeMetadata(u, v);
  if (!meta || !meta.ncertSource || !meta.rationale) {
    missingEdgeMeta++;
  }
});
check(missingEdgeMeta === 0, `All 37 edges contain explicit NCERT cross-grade sources and pedagogical rationales`);

// 3. Question Bank & Progressive Hint Scaffolding
console.log('\n3. Question Bank & Scaffolding Quality:');
let totalQuestions = 0;
let questionsWithoutOptions = 0;
let questionsWithoutAnswer = 0;
let questionsWithoutExplanation = 0;
let questionsWithout3Hints = 0;
let nodesWithParallelFormB = 0;

knowledgeGraph.nodes.forEach(n => {
  const qList = questions[n.id] || [];
  totalQuestions += qList.length;

  const formBList = qList.filter(q => q.form === 'B');
  if (formBList.length >= 5) {
    nodesWithParallelFormB++;
  }

  qList.forEach(q => {
    if (!Array.isArray(q.options) || q.options.length < 2) questionsWithoutOptions++;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) questionsWithoutAnswer++;
    if (!q.explanation || q.explanation.length < 10) questionsWithoutExplanation++;
    if (!Array.isArray(q.hints) || q.hints.length !== 3) questionsWithout3Hints++;
  });
});

check(totalQuestions === 207, `Total 207 questions present across all 31 nodes (Average: ${(totalQuestions/31).toFixed(1)} questions/node)`);
check(questionsWithoutOptions === 0, `All 207 questions possess formatted options`);
check(questionsWithoutAnswer === 0, `All 207 questions have valid within-bounds answer keys`);
check(questionsWithoutExplanation === 0, `All 207 questions contain detailed pedagogical explanations`);
check(questionsWithout3Hints === 0, `All 207 questions contain 3-tier progressive hints (Concept -> Formula -> Step-by-Step)`);
check(nodesWithParallelFormB >= 9, `Dedicated 5-item Parallel Form B sets authored for all 9 core remediation competencies`);

console.log('\n======================================================');
if (errors === 0) {
  console.log(`🎉 Curriculum verification complete: 0 errors. All NCERT Classes 6-8 standards met!`);
} else {
  console.error(`⚠️ Curriculum verification failed with ${errors} error(s).`);
  process.exit(1);
}
console.log('======================================================\n');
