# KakshaSignal — Demonstration Guide
### Teacher-Controlled Adaptive Learning System for Classes 6–8
**Powered by the Curriculum Continuity Pass (CCP) Engine**  
*Code Kernel ’26 (GRIET × X-Kernel) — Build & Prove Demonstration Walkthrough*

> **Canonical Pitch:** KakshaSignal is a teacher-led adaptive learning system for Indian classrooms. It uses student responses to identify likely learning gaps, recommends an explainable Learn–Solve–Test pathway, and helps teachers decide what each student should do next.  
> See [PHASE0_PRODUCT_CONTRACT.md](PHASE0_PRODUCT_CONTRACT.md) for the locked product identity, feature matrix, and challenge alignment contract.

## How to Start the Application

### Option 1: Development Mode with Hot Reload (Two Terminals)

**Terminal 1 — Backend API:**
```powershell
cd server
npm start
```
*Starts Express on `http://localhost:3001`.*

**Terminal 2 — Frontend Client:**
```powershell
cd client
npm run dev
```
*Starts Vite on `http://localhost:5173`. Vite proxies `/api` calls to port 3001.*

Open your browser to <http://localhost:5173>.

### Option 2: Unified Production Server (Single Terminal)

```powershell
cd client
npm run build
cd ../server
npm start
```
*Starts Express on `http://localhost:3001`, serving both the API and the static React production build.*

Open your browser to <http://localhost:3001>.

> **Port & Sandbox Notice:** On restricted Windows sandboxes, outbound connections to local loopback ports fail with `EACCES (errno: -4092)`. To open and interact with the application in a desktop browser, execute the startup commands outside the sandbox.

---

## Database Seeding

The checked-in file `server/db/ccp-data.json` contains pre-seeded demo records for Mrs. Sharma (Classes 7-A & 8-B) and 15 student profiles. 

If you want to recreate the default dataset from scratch:
```powershell
cd server
npm run seed
```
*Note: Seeding completely resets `server/db/ccp-data.json`. Back up that file first if you want to preserve any custom modifications.*

---

## Walkthrough Steps for Judges

1. **Dual-Persona 1-Click Launchers (Landing Page):**
   * **Launcher 1 (Teacher):** Click **"👩‍🏫 Mrs. Sharma"** to enter the educator command center.
   * **Launcher 2 (Flagship Build Demo):** Click **"👧 Sneha Rao (Class 8-B)"** to open the cross-grade backward remediation journey (Class 8 Rational Numbers $\to$ Class 6 Fractions).
   * **Launcher 3 (Decode Proposal Demo):** Click **"👩‍🎓 Priya Singh (Class 7-A)"** to open the Decode proposal scenario (Class 7 Unlike Fractions & Decimals $\to$ Class 6 Fractions & Decimals).
   * **Launcher 4 (Competency Journey):** Click **"👦 Aarav Patel (Class 7-A)"** to inspect regular mastery progression.

2. **Teacher Command Center & Explainable Gap Trace:**
   * In Mrs. Sharma's dashboard, switch between **Class 7-A** and **Class 8-B**.
   * View the student competency matrix (green = mastered $\ge 70\%$, pulsing red = confirmed gaps).
   * Click any red cell (e.g., Sneha Rao on **Class 8: Rational Numbers (Advanced)** or Priya Singh on **Class 7: Fractions and Decimals**).
   * Observe the **Explainable Root-Cause Trace Modal**:
     * **Empirical Assessment Evidence:** Original percentage score and correct/total counts.
     * **Topological Dependency Chain:** Step-by-step remediation path.
     * **Verified NCERT Prerequisite Links:** Explicit NCERT textbook and chapter mappings (e.g. `NCERT Class 6 Ch 7 -> Class 7 Ch 9` and `NCERT Class 7 Ch 9 -> Class 8 Ch 1`) along with pedagogical rationales.
     * **Teacher Control Panel:** Discretionary actions (*Assign Remedial Step*, *Verify & Skip*, *Reset Diagnostic*).

3. **Student Experience & 3-Stage Remedial Loop (Learn → Solve → Test):**
   * Launch as **Sneha Rao** or **Priya Singh**.
   * The **Curriculum Continuity Diagnostic Banner** clearly isolates the foundational prerequisite deficit.
   * Click **"Start 3-Stage Remedial Loop"**:
     * **Stage 1 (Learn):** NCERT chapter concept notes, key mathematical identities, and common exam pitfalls.
     * **Stage 2 (Solve):** Guided formative practice problems with immediate bilingual pedagogical reasoning ("Correct! / सही उत्तर!").
     * **Stage 3 (Test):** Competency benchmark assessment. Notice the **Form A: Baseline Diagnostic** vs **Form B: Parallel Reassessment** badge.
     * Upon completion, review the **Score Progression Card** (Before vs After score delta and mastery transition).

4. **Low-Bandwidth Mode & Offline Shell Preparation:**
   * Click **"⚡ Low-BW Mode"** in the navigation bar. Notice:
     * Decorative animations and backdrop blurs are suppressed to minimize CPU/GPU load.
     * GET API requests are cached in session storage; repeat visits increment the **live byte savings badge** (e.g., `12.4 kB saved`).
   * Click **"🇮🇳 हिन्दी"** to toggle bilingual navigation, stage titles, and quiz feedback.
   * In production mode, the registered Service Worker (`/sw.js`) caches the application shell for zero-latency page reloads.

---

## Verification Evidence (Verified on 2026-10-24)

1. **Service and Data Assertion Suite (`node test-endpoints.js`):**
   * **17/17 assertions passed (100%)**.
   * Validates graph size (31 nodes, 37 edges), DAG cycle-free integrity, database lookups, backward BFS tracer accuracy, quiz generation/grading thresholds, and heatmap summaries.
   * Automatically captures and restores a snapshot of `server/db/ccp-data.json` around test execution.

2. **Hardening & Regression Suite (`node test-regression.js`):**
   * **19/19 assertions passed (100%)**.
   * Validates heatmap data queries, teacher override persistence (mastered/gap_found status, mastery_score), diagnostic explainability (empirical evidence, rationale strings), genuine adaptive differentiation (Sneha vs Aditya paths), and input hardening (unknown nodes, empty/null answers, non-existent quiz nodes).

3. **End-to-End Workflow Suite (`node test-workflow.js`):**
   * **5/5 workflow stages passed (100%)**.
   * Validates teacher auth → classroom discovery → heatmap summaries → distinct student traces → full Learn→Solve→Test→mastery loop → teacher override → dashboard reflection.
   * Proves genuine adaptation: Sneha (3-step cross-grade path) vs Aditya (1-step same-grade path).

4. **Upgrade & Reassessment Regression Suite (`node test-upgrade.js`):**
   * **33/33 assertions passed (100%)**.
   * Validates Form A-only diagnostics, seeded baseline detection, Form B-only reassessment when a full parallel form exists, before/after score progression tracking, edge metadata attribution (35 direct NCERT vs 2 pedagogical assumptions), NCERT textbook chapter mapping for all 31 nodes, and student-aware unseen quiz delivery.

5. **Phase 1 Feature & Regression Suite (`node test-phase1.js`):**
   * **33/33 assertions passed (100%)**.
   * Validates dual-persona state isolation (Priya Singh Class 7 vs Sneha Rao Class 8), verified NCERT prerequisite links (`NCERT Class 6 Ch 7 -> Class 7 Ch 9`, `NCERT Class 7 Ch 9 -> Class 8 Ch 1`), Form A/B badge logic, empirical score deltas, and offline service worker asset bundling.

6. **Comprehensive Security & Audit Regression Suite (`node test-security.js`):**
   * **26/26 assertions passed (100%)**.
   * Validates unauthenticated teacher mutation rejection (401), teacher overview with bearer token (200, resolving AUD-01), invalid token rejection (401), cryptographic HMAC session tokens, IDOR cross-classroom protection (403), multilingual student name Unicode validation (rejects XSS and malformed input while accepting Indian languages like Devanagari), join code validation, student progress route authentication & IDOR isolation (AUD-05), key rotation invalidation & tamper detection (AUD-02), rate-limiter connection-based enforcement immune to spoofed forwarding headers (AUD-03), strict CORS allowlist enforcement (AUD-04), request body size limits (rejects >64KB with 413), and formative practice evaluation from trusted question bank (immune to option shuffling).

7. **All Non-HTTP Test Suites (`npm test`):**
   * **133 / 133 assertions passed (100%)** across all 6 test files with automated database state preservation.

8. **Live HTTP Smoke Suite (`node test-http.js`):**
   * **11/11 endpoint checks passed (100%)** over actual network sockets.
   * Validates `GET /api/health`, `POST /api/auth/teacher/login`, `POST /api/auth/student/login`, `GET /api/teacher/class/:id/overview` (with teacher auth token), `GET /api/teacher/knowledge-graph`, `GET /api/student/topics/:id` (with student auth token), `GET /api/student/trace/:id/:node` (with student auth token), `GET /api/student/learn/:node`, `GET /api/quiz/generate/:node`, and `GET /` (static client serving).
   * Automatically restores `server/db/ccp-data.json` upon completion.
   * **Total Combined Automated Checks: 144 / 144 passed (100%)**.

9. **Client Production Build (`npm run build` in `client`):**
   * Built successfully via Vite 5.4 in 4.94s.
   * Bundle metrics:
     * `dist/index.html`: 1.06 kB (0.59 kB gzip)
     * CSS bundle: 38.00 kB (6.69 kB gzip)
     * JS bundle: 241.76 kB (72.16 kB gzip)
     * Service worker: `dist/sw.js` (minimal shell caching, `/api/` untouched)
     * **Total combined gzipped payload: ~79.44 kB**.

---

## Current Prototype Scope & Truthful Boundaries

* **Curriculum Range:** Scoped strictly to Classes 6–8 (31 competency nodes, 37 prerequisite edges). Classes 9 and 10 are non-goals for this prototype to preserve rigorous NCERT citation integrity without fabricating untested relationships.
* **Item Bank:** Expanded to 207 questions across Classes 6–8. Dedicated parallel Form B items now cover all 9 core remediation competencies (`6_whole_numbers`, `6_integers`, `6_fractions`, `6_decimals`, `7_integers_ops`, `7_fractions_decimals`, `7_rational_numbers`, `8_rational_numbers_adv`, `8_linear_equations`).
* **Answer Distribution (Anti-Bias):** Answers are distributed across positions A, B, C, and D (`{ 0: 71, 1: 50, 2: 45, 3: 41 }`). Correct answers are no longer assumed to be option zero; formative practice validates via `/api/quiz/check-practice`.
* **Language Support:** Bilingual toggle translates major UI labels, status indicators, 3-stage progress indicators, and feedback messages into Hindi; explanatory lesson content and questions remain in English.
* **Connectivity Mode:** Offline Service Worker caches the static application shell for instant page loads. Selected GET responses are cached in `sessionStorage` with live byte savings tracked. Dynamic quiz submission and grading require active backend connectivity.
* **Data Storage:** Pure-JS zero-dependency resilient store with atomic file replacement (`.tmp` write + rename/copy fallback) and automated startup backup rotation (`ccp-data.backup.json`). Eliminates native compilation fragility on judge laptops.
