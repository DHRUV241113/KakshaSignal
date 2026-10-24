# KakshaSignal
### Teacher-Led Adaptive Learning System for Indian Classrooms
**Powered by the Curriculum Continuity Pass (CCP) Engine**  
*National Engineering Hackathon: Code Kernel ’26 (GRIET × X-Kernel)*

> **KakshaSignal is a teacher-led adaptive learning system for Indian classrooms. It uses student responses to identify likely learning gaps, recommends an explainable Learn–Solve–Test pathway, and helps teachers decide what each student should do next.**

---

## 🏆 Project Overview

**KakshaSignal** addresses the cumulative learning gap problem in Indian middle school classrooms (Classes 6–8; Classes 9–10 are non-goals for this prototype). When a student struggles with a new concept—such as Class 8 Rational Numbers—the breakdown frequently stems from an unmastered prerequisite from one or two grades earlier, such as Class 6 Fractions.

Rather than presenting an unexplainable "black box" score, KakshaSignal uses its deterministic **Curriculum Continuity Pass (CCP)** engine to:
1. **Trace gaps backward** across grade boundaries to the earliest root-cause deficit using an acyclic NCERT-aligned competency graph.
2. **Deliver a structured 3-stage Learn–Solve–Test cycle** tailored to the learner's actual prerequisite state.
3. **Keep teachers in control** through an intuitive class mastery heatmap and one-click intervention overrides (*Assign Remedial Step*, *Verify & Skip*, *Reset Diagnostic*).

---

## 📋 The "Decode → Build → Prove" Framework

The [published event listing](https://api.unstop.com/hackathons/code-kernel-26-gokaraju-rangaraju-institute-of-engineering-and-technology-griet-hyderabad-1766839) describes the theme as adaptive learning for Classes 6–10 and says Prove will introduce changed tests and constraints. This prototype currently covers Classes 6–8. The listing does not publish a numeric judging rubric; its linked problem-statement PDF was not retrievable during the 2026-10-24 review.

### 1. Decode (Problem Framing)
* **The problem:** A learner can struggle with a new abstract topic because an earlier foundational prerequisite is missing. KakshaSignal demonstrates an explainable way to make that cross-grade relationship visible to a teacher via the CCP engine.
* **The prototype approach:**
  1. **Deterministic Backward Prerequisite Tracing:** The graph traversal follows stored prerequisite edges. For example, Sneha Rao's seeded Class 8 Rational Numbers gap traces backward to Class 6 Fractions.
  2. **Teacher Controls:** The demo UI provides *Assign Remedial Step*, *Verify & Skip*, and *Reset Diagnostic* actions.
  3. **Language and Connectivity Controls:** Selected interface labels provide English and Hindi translations. The low-bandwidth control caches selected GET responses in session storage and suppresses visual effects; the production service worker caches the static shell. Quiz delivery and grading still require an active API connection. Network throttling and media compression are not implemented.

---

### 2. Build (Architecture & Implementation)
* **Curriculum Knowledge Ladder:** 31 competency nodes across Classes 6, 7, and 8 connected by 37 prerequisite edges. An automated graph check verifies that the graph is a Directed Acyclic Graph (DAG) with no circular loops.
* **Item & Diagnostic Bank:** Prototype question set with misconception-oriented distractors; it is not an exhaustive official NCERT question bank. Dedicated Form B items currently cover 6_fractions, 7_rational_numbers, 8_rational_numbers_adv, and 8_linear_equations. Other topics use their available item pool for reassessment.
* **3-Stage Adaptive Loop (Learn → Solve → Test):**
  * **Stage 1 (Learn):** Conceptual breakdown, core mathematical properties, formulas, and common exam pitfalls.
  * **Stage 2 (Solve):** Guided interactive practice with immediate pedagogical reasoning explaining why an answer is right or wrong.
  * **Stage 3 (Test):** Competency benchmark assessment (70% mastery threshold). Scoring below 70% automatically triggers the backward prerequisite trace.
* **Educator Heatmap & Command Dashboard:** Live multi-grade class matrix color-coding student mastery across all curriculum strands.

### 3. Prove (Verification)
* **All Test Suites:** `npm test` runs all 5 server test suites (`test-endpoints.js`, `test-workflow.js`, `test-regression.js`, `test-upgrade.js`, and `test-phase1.js`) passing all current backend checks on 2026-10-24 with database snapshots restored (102 counted assertions plus 5 workflow stages).
* **Live HTTP Smoke:** `node test-http.js` passed **11/11 checks** across live HTTP endpoints (health, teacher/student auth, class overview, knowledge graph, student topics, backward trace, learning content, quiz generation, seeded Form B reassessment and production static client serving), with automatic database backup/restore.
* **Production Build:** `npm run build` from `client` compiled successfully via Vite: JavaScript 241.03 kB / 71.91 kB gzip, CSS 38.00 kB / 6.69 kB gzip, HTML 1.06 kB / 0.59 kB gzip (79.19 kB combined gzip). Service worker (`sw.js`) verified in `client/dist/sw.js`.
* **Live Tunnel:** Active at `https://interesting-aug-butler-expects.trycloudflare.com`; the URL returned HTTP 200 for app and health on 2026-10-24, but its quiz route still served mixed Form A/Form B items for seeded Sneha and needs the source fix deployed.
* **Environment & Port Note:** When running inside restricted Windows sandbox environments, outbound loopback connections fail with `EACCES (errno: -4092)`. To interact with the application from a desktop web browser, start the server outside the sandbox.

---

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for the step-by-step judge demonstration walkthrough.  
See [PHASE0_PRODUCT_CONTRACT.md](PHASE0_PRODUCT_CONTRACT.md) for the locked product identity, challenge alignment contract, and Phase 1 checklist.

## 🚀 Quick Start & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

### Step 2: Seed the Demo Database
```bash
cd server
npm run seed
```
*Creates Mrs. Sharma's Class 7-A and Class 8-B demo classrooms and sample students. This command clears and recreates all tables in `server/db/ccp-data.json`; back up that file first if it contains local changes.*

### Step 3: Run the Application
In terminal 1 (Backend API):
```bash
cd server
npm start
# Server boots on http://localhost:3001
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Frontend boots on http://localhost:5173
```

Open your browser to: **`http://localhost:5173`**

For a production build served directly by Express:
1. Run `npm run build` from `client`.
2. Run `npm start` from `server`.
3. Open **`http://localhost:3001`**.

---

## 🔑 Demo & Evaluation Credentials

You can log in manually or use the **1-click instant evaluation launchers** directly on the landing page:

| Role | Name / Persona | Credential / Code | What to Observe |
| :--- | :--- | :--- | :--- |
| **Teacher** | Mrs. Sharma | **`TEACH2026`** | Multi-class heatmap, class switcher (7-A vs 8-B), click any red gap cell to view the backward root-cause trace with verified NCERT edge attribution and teacher overrides (Assign, Skip, Retest). |
| **Student (Flagship Build)** | Sneha Rao | Code: **`JOIN8B`** | Demonstrates cross-grade backward trace: failing Class 8 Rational Numbers traces to Class 6 Fractions. Completing remediation unlocks Form B parallel reassessment. |
| **Student (Decode Proposal)** | Priya Singh | Code: **`JOIN7A`** | Demonstrates Class 7 Decode proposal scenario: failing Class 7 Fractions & Decimals traces backward to Class 6 Fractions and Decimals. |
| **Student (Mastery Journey)** | Aarav Patel | Code: **`JOIN7A`** | Demonstrates progressive student journey exploring Class 7 algebra and intermediate topics. |

---

## 🧪 Running the Automated Verification Suites

From the `server` directory, run the complete verification suite with one command:
```bash
cd server
npm test
```
*Executes all 5 non-HTTP test suites: `test-endpoints.js`, `test-workflow.js`, `test-regression.js`, `test-upgrade.js`, and `test-phase1.js` (98 assertions, 100% pass) with automatic database state preservation.*

You can also run each suite individually:

1. **Service and Data Assertions:**
```bash
node test-endpoints.js
```
*Verifies 17/17 assertions on graph DAG acyclicity, database queries, gap tracing, and quiz scoring.*

2. **End-to-End Workflow & Adaptation Suite:**
```bash
node test-workflow.js
```
*Verifies multi-student journeys, distinct adaptive remediation paths (Sneha Rao vs. Aditya Verma), full Learn-Solve-Test mastery loop, and real-time teacher heatmap reflection.*

3. **Hardening & Regression Suite:**
```bash
node test-regression.js
```
*Verifies 19/19 assertions covering schema regex query fixes, teacher override persistence, edge-case rejection, and diagnostic explainability rationales.*

4. **Upgrade & Reassessment Regression Suite:**
```bash
node test-upgrade.js
```
*Verifies 33/33 assertions on Form A vs Form B parallel reassessment items, before/after score progression, edge metadata classification (35 direct NCERT vs 2 pedagogical assumptions), node NCERT textbook attribution across all 31 nodes, and student-aware unseen quiz delivery.*

5. **Phase 1 Feature & Regression Suite:**
```bash
node test-phase1.js
```
*Verifies 33/33 assertions on dual-persona state isolation (Priya vs Sneha), verified NCERT prerequisite links (`NCERT Class 6 Ch 7 -> Class 7 Ch 9`, `NCERT Class 7 Ch 9 -> Class 8 Ch 1`), Form A/B badge logic, empirical score deltas, and offline service worker asset bundling.*

6. **Live HTTP Smoke Test:**
```bash
node test-http.js
```
*Spawns an in-process HTTP server, executes live `fetch` calls against 10 API routes, verifies HTTP 200 responses and payloads, and restores `ccp-data.json`.*

---

## 🏛️ Technology Stack & Limitations

* **Frontend:** React 18, Tailwind CSS, Vite, React Router DOM, Plus Jakarta Sans & Noto Sans Devanagari typography.
* **Backend:** Node.js, Express, CORS.
* **Database & Storage:** Synchronous, file-persisted JSON demo store (`server/db/ccp-data.json`). It has no SQL transaction or multi-process concurrency guarantees.
* **Algorithms:** Breadth-First Search (BFS) backward prerequisite traversal, Kahn's Topological Sorting algorithm for remediation path sequencing.
* **Curriculum Data Scope:** Scoped to Classes 6–8 (31 nodes, 37 edges). Classes 9–10 are not implemented in this prototype.
* **Bilingual Scope:** Selected interface labels are translated into Hindi; lesson explanations and questions remain primarily in English.
* **Network & Connectivity:** Selected GET responses and the static app shell are cached, but the complete Learn–Solve–Test loop cannot run offline because quiz generation and grading require the backend.

---

**Developed for Code Kernel ’26**  
*Gokaraju Rangaraju Institute of Engineering and Technology (GRIET) × X-Kernel*
