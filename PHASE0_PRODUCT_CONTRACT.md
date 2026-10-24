# PHASE 0 PRODUCT CONTRACT: KAKSHASIGNAL
**National Engineering Hackathon:** Code Kernel ’26 (GRIET × X-Kernel)  
**Document Status:** 🔒 LOCKED & CANONICAL  
**Timestamp:** 2026-10-23T17:05:00+05:30  
**Phase:** Phase 0 (Product Lock and Challenge Alignment)

---

## 1. Official Challenge and Expected Outcomes

### Hackathon Context
**Code Kernel ’26** is a national engineering competition organized by **X-Kernel** at Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Hyderabad. It follows a three-stage competitive continuum:
* **Decode:** Root-cause analysis, demographic reality, systemic constraint identification, and pedagogical problem framing.
* **Build:** Delivering a functional, demonstrable software implementation — not static wireframes, mockups, or slide decks.
* **Prove:** Demonstrating that the system functions deterministically under real constraints (low-bandwidth/2G connectivity, varying learner preparation, teacher overrides, and unexpected edge cases) with reproducible evidence.

### Problem Statement & Challenge Scope
In Indian classrooms transitioning through the National Education Policy (NEP 2020) middle-school stage (Classes 6–8), foundational deficits silently compound. As evidenced by ASER 2024 data, over 55% of upper-primary students carry unaddressed deficits in basic numeracy and arithmetic. When a student enters Class 7 or 8, they struggle with abstract concepts (such as rational numbers or linear equations) not because they lack general cognitive ability, but because a specific prerequisite competency from Class 6 (such as fractions or integer operations) was never mastered.

### Expected Competition Outcomes
1. **Explainable Diagnostic Detection:** Automatically diagnose likely learning deficits from student assessment responses without opaque, unaccountable "black-box" models.
2. **Deterministic Prerequisite Tracing:** Trace failed competencies backward across grade boundaries to isolate the foundational root-cause deficit.
3. **Teacher-Controlled Decision Support:** Present actionable classroom matrices and allow educators to approve, override, assign, or skip remedial actions.
4. **Structured Learn–Solve–Test Remediation Loop:** Provide a complete cycle for remediation (concept instruction, formative guided practice with immediate feedback, and parallel reassessment).
5. **Constraint-Resilient Execution:** Deliver a lightweight payload (< 100 kB gzipped) capable of operating on low-bandwidth rural connections without cloud lock-in.

---

## 2. Canonical Product Identity & Pitch

* **Public Product Name:** **KakshaSignal**
* **Internal Engine Name:** Curriculum Continuity Pass (CCP)
* **Tagline:** Teacher-Led Adaptive Learning for Indian Classrooms
* **Canonical One-Line Description:**
  > "KakshaSignal is a teacher-led adaptive learning system for Indian classrooms. It uses student responses to identify likely learning gaps, recommends an explainable Learn–Solve–Test pathway, and helps teachers decide what each student should do next."

---

## 3. Users, Beneficiaries, and Core Problem

### Primary User: The Indian School Teacher (e.g., Mrs. Sharma)
* **Context:** Manages 40 to 50 students per classroom across multiple grades (e.g., Class 7-A and Class 8-B).
* **The Problem:** The teacher cannot sit one-on-one with 45 students to diagnose which earlier-grade deficit caused each failed homework or test question. They lack diagnostic visibility into prior-grade deficits and are forced to push forward with grade-level syllabus deadlines, leaving struggling students permanently behind.
* **The Need:** A transparent visual heatmap showing classroom competency health and an explainable root-cause trace that advises on remediation while keeping the teacher in complete pedagogical control.

### Secondary User: The Middle-School Learner (e.g., Sneha Rao, Priya Singh, Aditya Verma)
* **Context:** Class 6–8 students attending government, government-aided, or low-fee private schools. Often share a single household smartphone on 2G/3G connections or intermittent Wi-Fi.
* **The Problem:** Repeated failure in current-grade mathematics destroys confidence. Traditional homework simply assigns more of the same failed grade-level problems, penalizing the student for an unstrengthened foundation.
* **The Need:** An encouraging, non-punitive learning pathway that temporarily anchors them to the exact prerequisite they missed, lets them practice with immediate reasoning, and reassesses them with fresh questions to build genuine competence.

---

## 4. Product Promise & Primary Differentiators

### The Product Promise
KakshaSignal promises **pedagogical transparency and teacher agency**:
1. When a student struggles, KakshaSignal **never** generates a black-box percentage or vague label like "weak in math." It shows the exact competency chain that broke.
2. KakshaSignal **never** takes automated decisions out of the teacher's hands. The system proposes; the teacher disposes.
3. KakshaSignal **adapts** all three phases of the remediation loop (Learn, Solve, Test) to the student's actual demonstrated state.

### Primary Differentiators

| Dimension | Legacy B2C EdTech (Mindspark, Embibe) | Public Content Repositories (DIKSHA) | KakshaSignal (CCP Engine) |
| :--- | :--- | :--- | :--- |
| **Diagnostic Logic** | Opaque proprietary machine-learning score | None (static repository) | **Transparent, explainable BFS graph traversal over NCERT syllabus** |
| **Teacher Role** | Passive bystander or viewer | Content assigner | **Active decision-maker with override, skip, and re-diagnose authority** |
| **Cross-Grade Tracing** | Internal hidden model weights | None | **Visual multi-grade prerequisite ladder (Grade 8 $\to$ 7 $\to$ 6)** |
| **Connectivity & Weight** | Heavy assets, video streaming, 10–50 MB payload | PDF/Video streams (heavy bandwidth) | **Ultra-lightweight (< 77 kB gzipped), zero video dependency, low-bandwidth mode** |
| **Reassessment Integrity** | Repeat same question pool | Static worksheets | **Parallel Form A (Diagnostic) vs Form B (Reassessment) tracking** |

---

## 5. Actual Implemented Scope vs. Planned Scope

| Component | Planned Hackathon Prototype Scope | Actual Codebase Implementation Status | Implementation Notes |
| :--- | :--- | :--- | :--- |
| **Curriculum Scope** | Classes 6–8 Mathematics | **31 Competency Nodes, 37 Prerequisite Edges** | Fully mapped in `server/data/knowledgeGraph.js`. Strict DAG (0 cycles). Classes 9–10 are future non-goals. |
| **Curriculum Attribution** | NCERT Chapter Mapping | **100% Attributed** | All 31 nodes have `ncertBook` and `ncertChapter`. All 37 edges have `edgeMetadata` (35 direct NCERT, 2 pedagogical assumptions). |
| **Diagnostic Tracer** | Cross-grade backward tracer | **Fully Operational** | BFS traversal in `gapTracer.js` traverses multiple grade boundaries deterministically. |
| **Learning Content** | NCERT notes & formulas | **31 Nodes Authored** | Stored in `server/data/learningContent.js` with concepts, formulas, and common exam pitfalls. |
| **Formative Practice** | Interactive Solve module | **Operational** | Immediate pedagogical feedback explaining why right/wrong answers occur. |
| **Summative Assessment** | 70% Passing Threshold | **Operational** | Sanitized 5-question quizzes; scores evaluated deterministically. |
| **Reassessment Pool** | Fresh parallel items | **Operational** | Form B parallel items authored for core demonstration strands; unseen item filtering via `studentId`. |
| **Score Progression** | Before/After tracking | **Operational** | Tracks baseline `diagnostic_score`, updates `mastery_score`, computes `scoreDelta`, preserves history. |
| **Teacher Dashboard** | Multi-class matrix & heatmap | **Operational** | Classes 7-A & 8-B switcher, real-time color transitions, student gap inspector. |
| **Teacher Overrides** | Assign, Skip, Re-diagnose | **Operational** | Persisted in datastore; verified by regression tests. |
| **Low-Bandwidth Mode** | 2G usability optimization | **Operational (Simulated/Cache)** | `sessionStorage` request caching via `cachedFetch`; suppresses CSS transitions/animations. (Full offline Service Worker is PWA stretch goal). |
| **Bilingual Toggle** | English + Hindi UI | **Operational** | Dual dictionary toggle across navigation, headers, status badges, and reassessment cards. |

---

## 6. Comprehensive Feature Status Table

```
====================================================================================================
FEATURE / WORKFLOW                          STATUS                  VERIFICATION MECHANISM
====================================================================================================
Classroom Overview & Matrix Heatmap         VERIFIED WORKING        test-endpoints.js, test-http.js
Knowledge Graph DAG Integrity (31N / 37E)   VERIFIED WORKING        Kahn's Topological Sort (test-endpoints.js)
NCERT Attribution & Edge Metadata           VERIFIED WORKING        test-upgrade.js (35 direct, 2 pedagogical)
Backward BFS Prerequisite Gap Tracer        VERIFIED WORKING        test-endpoints.js, test-workflow.js
Empirical Diagnostic Evidence Generation    VERIFIED WORKING        test-regression.js, live UI
Adaptive Differentiation (Sneha vs Aditya)  VERIFIED WORKING        test-workflow.js, test-regression.js
Teacher Override (Verify & Skip)            VERIFIED WORKING        test-workflow.js, test-regression.js
Teacher Override (Re-diagnose / Assign)     VERIFIED WORKING        test-regression.js, schema.js
Learn Module (Formulas, Notes, Pitfalls)    VERIFIED WORKING        test-http.js, live UI
Solve Module (Interactive Guided Practice)  VERIFIED WORKING        live UI, questions.js
Test Module (Diagnostic Quiz)               VERIFIED WORKING        test-endpoints.js, test-http.js
Parallel Reassessment Form (Form B items)   VERIFIED WORKING        test-upgrade.js, live UI
Before-and-After Score Progression Tracking VERIFIED WORKING        test-upgrade.js, live UI
Teacher Heatmap Live Status Update          VERIFIED WORKING        test-workflow.js, live UI
Student-Aware Unseen Quiz Delivery          VERIFIED WORKING        test-upgrade.js, quizEngine.js
Low-Bandwidth sessionStorage Caching        VERIFIED WORKING        AppContext.jsx (cachedFetch)
Low-Bandwidth Animation Suppressor          VERIFIED WORKING        index.css (data-low-bandwidth="true")
Bilingual UI Toggle (English / Hindi)       VERIFIED WORKING        AppContext.jsx, Navbar.jsx
Client Production Bundle (< 77 kB gzip)     VERIFIED WORKING        npm run build (Vite 5.4)
Multi-Viewport Mobile Responsiveness        VERIFIED WORKING        6 viewports verified (320px to 1440px)
ACID SQL Database (Postgres/SQLite)         NOT IMPLEMENTED (P2)    Currently pure JS JSON store
Offline Service Worker Background Sync      NOT IMPLEMENTED (P2)    Currently cache + low-data mode
Classes 9 and 10 Curriculum Extension       NOT IMPLEMENTED (P3)    Intentionally scoped to Classes 6–8
====================================================================================================
```

---

## 7. Flagship Demonstration Scenario: Resolution and Exact Steps

### Scenario Resolution
* **Decode Proposal Mention:** Class 7 mathematics, adding fractions with unlike denominators.
* **Audit Implementation:** Class 8 rational numbers deficit traced 2 grade levels backward to Class 6 fractions.
* **Analysis & Resolution:**
  * In the codebase, **both** Class 7 (Priya Singh, Class 7-A) and Class 8 (Sneha Rao, Class 8-B) scenarios are fully implemented and functional.
  * **Selected Flagship Scenario for Build Round:** **Sneha Rao (Class 8 Rational Numbers $\to$ Class 6 Fractions)**.
  * **Rationale:**
    1. Demonstrates the most profound educational problem: a **cross-grade gap spanning two academic transitions (Class 8 to Class 7 to Class 6)**. A single-grade deficit within Class 7 could be mistaken for simple topic difficulty; a 2-grade deficit cleanly proves the "curriculum continuity" premise.
    2. Sneha Rao has direct, one-click evaluation launch buttons on the landing page (`LandingPage.jsx`).
    3. Sneha Rao's pathway is backed by all four automated test suites (`test-endpoints.js`, `test-workflow.js`, `test-regression.js`, and `test-upgrade.js`).
    4. Priya Singh's Class 7 scenario remains functional in Class 7-A as the secondary proof of generalization.

### Exact 7-Step Flagship Demonstration Walkthrough
1. **Landing Page Evaluation:**
   * Open the live application ([https://top-slide-affecting-ion.trycloudflare.com](https://top-slide-affecting-ion.trycloudflare.com) or `http://localhost:3001`).
   * Observe the canonical product identity: **KakshaSignal**, powered by the Curriculum Continuity Pass engine.
2. **Teacher Class Overview (Mrs. Sharma, `TEACH2026`):**
   * Launch as Mrs. Sharma. Switch between Class 7-A and Class 8-B.
   * View the student matrix heatmap. Point out that while most foundational cells are green, **Sneha Rao** has a pulsing red cell on **Class 8: Rational Numbers (Advanced)**.
3. **Explainable Prerequisite Trace Inspection:**
   * Click Sneha Rao's red cell.
   * Modal displays:
     * **Empirical Evidence:** Scored 20% (1/5 correct), failing the 70% mastery threshold.
     * **Backward Trace Chain:** `8_rational_numbers_adv` $\to$ `7_rational_numbers` $\to$ **`6_fractions` (Root Cause)**.
     * **Curricular Rationale:** Plain-language explanation showing that signed rational operations require finding least common multiples (LCM) and simplifying equivalent fractions.
4. **Student Experience (Sneha Rao, `JOIN8B`):**
   * Launch as Sneha Rao.
   * Point out the **Curriculum Continuity Diagnostic Banner**: Sneha is not told she failed Class 8; she is gently directed to strengthen her Class 6 Fractions foundation.
5. **3-Stage Remediation Loop (Learn $\to$ Solve $\to$ Test):**
   * Click **"Start 3-Stage Remedial Loop"** on Class 6 Fractions:
     * **Stage 1 (Learn):** Review NCERT definitions, equivalent fractions, and common denominator calculation rules.
     * **Stage 2 (Solve):** Work through guided formative practice problems with immediate feedback explaining why options are correct or incorrect.
     * **Stage 3 (Test):** Take the 5-question mastery benchmark test. Select correct answers and submit.
6. **Parallel Reassessment & Score Progression:**
   * When Sneha retakes assessment on her target competency, the system activates **Parallel Reassessment Mode (Form B)** with unseen items.
   * On submission, the **Score Progression Card** renders:
     * Baseline Diagnostic (Before): **20%**
     * Post-Remediation Reassessment (After): **100%**
     * Delta: **+80%**
     * Status Transition: `gap_found` $\to$ `mastered`.
7. **Teacher Matrix Live Verification & Discretion:**
   * Switch back to Mrs. Sharma's dashboard.
   * Sneha's Class 6 Fractions cell has turned solid **green (mastered)** in real-time.
   * Teacher clicks remaining intermediate gap (Class 7 Rational Numbers) and exercises **Teacher Override ("Verify & Skip")**, immediately setting it to mastered.

---

## 8. Truthful Claims & Boundaries (What Is and Isn't Claimed)

1. **Curriculum Alignment:**
   * **Truth:** All 31 competency nodes and 37 edges are mapped to official NCERT textbooks for Classes 6–8. 35 edges represent direct mathematical dependencies; 2 represent explicitly documented pedagogical sequencing assumptions.
   * **Boundary:** Does not claim endorsement by CBSE or NCERT. Does not cover Classes 9–10 or state-specific syllabi outside NCERT.
2. **Learning Outcomes:**
   * **Truth:** The software evaluates assessment responses deterministically and updates mastery thresholds based on rules.
   * **Boundary:** Does **not** claim longitudinal or clinical learning gains. The demo data represents synthetic, deterministic learner profiles for hackathon evaluation.
3. **Language Accessibility:**
   * **Truth:** Dual-language toggle (English / हिन्दी) translates navigation, headers, status badges, and reassessment cards.
   * **Boundary:** In-depth word problems and technical math explanations remain in English. Complete bilingual audio/voice support is not implemented.
4. **Connectivity & Low-Bandwidth:**
   * **Truth:** Client payload is ultra-compact (~77 kB gzipped). Low-bandwidth mode activates client-side `sessionStorage` caching for static modules and suppresses animations.
   * **Boundary:** Does **not** claim full offline PWA functionality or Service Worker background synchronization. An active local or network HTTP server is required.
5. **Data Architecture:**
   * **Truth:** Synchronous, zero-dependency, pure-JavaScript JSON store (`server/db/ccp-data.json`).
   * **Boundary:** Does **not** provide multi-master SQL replication or ACID transaction guarantees under high multi-tenant concurrency.

---

## 9. Non-Goals for the Build Round

To preserve hackathon focus, the following items are formally designated as **NON-GOALS** for the Build round:
* ❌ Expanding the knowledge graph to Classes 9, 10, 11, or 12.
* ❌ Adding non-mathematics subjects (Science, Social Studies, English).
* ❌ Implementing heavy machine learning, neural networks, or LLM-based generative question synthesis (rule-based explainability is an intentional architectural virtue).
* ❌ Building a complete commercial Learning Management System (LMS) with attendance, gradebooks, parent portals, or fee tracking.
* ❌ Migrating from the zero-dependency JSON store to PostgreSQL/MongoDB before the Prove round (which would introduce environment-specific build dependencies like `node-gyp`).

---

## 10. Phase 1 Testable Acceptance Criteria

Before any new Build features are introduced in Phase 1, the following criteria must be satisfied and verified:

1. **Brand & Identity Consistency:** The public interface, landing hero, and documentation consistently display **KakshaSignal**, referencing CCP as the engine.
2. **Deterministic Test Pass Rate:** `npm test` executes all 4 backend suites (`test-endpoints.js`, `test-workflow.js`, `test-regression.js`, `test-upgrade.js`) with **100% pass rate (65/65 assertions)** and zero test data contamination.
3. **Live Network Health:** `node test-http.js` passes 10/10 endpoint checks over live network sockets.
4. **Reassessment Delivery:** Calling `GET /api/quiz/generate/6_fractions?type=mastery&studentId=10` returns Form B parallel items distinct from the initial diagnostic.
5. **Score Progression Visibility:** Submitting a post-remediation quiz returns a valid `reassessment` payload with non-null `beforeScore`, `afterScore`, and `scoreDelta`.
6. **Teacher Override Persistence:** Triggering a teacher skip or assign action persists immediately to `ccp-data.json` and updates the matrix summary.
7. **Production Bundle Ceiling:** The production build output from `client` must remain strictly under **100 kB gzipped** total payload.

---
*Contract Locked by Lead Engineer, Educational Product Reviewer & Hackathon Strategist.*
