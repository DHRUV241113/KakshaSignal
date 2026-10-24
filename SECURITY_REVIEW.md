# KakshaSignal — Source-Code Security Review & Remediation Report

**Document Version:** 2.2.0 (Post-Remediation Verification & Audit Cross-Reference)  
**Audit & Remediation Date:** 2026-10-24  
**Project:** KakshaSignal (Curriculum Continuity Pass Engine)  
**Target Event:** National Engineering Hackathon: Code Kernel ’26 (GRIET × X-Kernel)  
**Auditor Mode:** Full-Stack Security & Technical QA Reviewer  

> 📄 **Final Comprehensive Code & Security Audit Report Available:**  
> For the complete final audit covering repository integrity, runtime inspection, dependency vulnerability status, curriculum verification, and prioritized fixes before commit/publish, see [FINAL_AUDIT_REPORT.md](FINAL_AUDIT_REPORT.md).

---

## 1. Executive Summary

Following the initial security and P0 readiness audit of KakshaSignal, all five confirmed security vulnerabilities (**SEC-01** through **SEC-05**) were systematically remediated, validated with an automated regression test suite (`server/test-security.js`), and cross-verified against the complete test harness and client production build.

### Key Verification Metrics:
- **Total Automated Test Assertions:** **144 / 144 passing checks (100%)**
  - Core Unit & Data Integrity (`test-endpoints.js`): 17 / 17 passed
  - End-to-End Workflow Verification (`test-workflow.js`): 5 / 5 passed
  - Hardening & Regression Suite (`test-regression.js`): 19 / 19 passed
  - Upgrade & Form B Regression (`test-upgrade.js`): 33 / 33 passed
  - Phase 1 Flagship & Accessibility Suite (`test-phase1.js`): 33 / 33 passed
  - **Comprehensive Security & Audit Suite (`test-security.js`):** **26 / 26 passed**
  - Live HTTP Integration Suite (`test-http.js`): 11 / 11 passed
- **Production Client Build:** Compiled in 1.70s via Vite 5.4 (`dist/index.html` 1.06 kB, CSS 38.00 kB, JS 242.20 kB, combined gzip ~79.56 kB).
- **Zero Exposed Secrets:** Confirmed 0 API tokens, passwords, or credentials in git log or repository files.
- **npm audit Status:**
  - **Server (Production Runtime):** 0 vulnerabilities (0 info, 0 low, 0 moderate, 0 high, 0 critical).
  - **Client (Frontend & Build Tooling):** 7 vulnerabilities (1 High in `vite` dev server, 6 Moderate in `react-router-dom` and `tailwindcss` build chain). Documented with mitigation and upgrade analysis below.

---

## 2. Remediated Vulnerabilities & Verification Evidence

### Finding SEC-01 (HIGH): Teacher API Authorization & Broken Access Control
- **Vulnerability:** Unauthenticated clients could call `POST /api/teacher/assign` or `GET /api/teacher/student/:studentId/detail` and modify/view student mastery data without authenticating or proving classroom ownership (IDOR).
- **Remediation Implemented:**
  1. Created `server/services/authService.js` implementing cryptographically signed HMAC-SHA256 session tokens with expiration and constant-time comparison (`crypto.timingSafeEqual`).
  2. Updated `POST /api/auth/teacher/login` to issue session tokens upon successful code authentication (`TEACH2026`).
  3. Created Express middleware `requireTeacherAuth` enforcing token presence in `Authorization: Bearer <token>` or `x-teacher-token`.
  4. Added classroom ownership verification (`isTeacherAuthorizedForStudent` and `isTeacherAuthorizedForClass`) in `server/routes/teacher.js`. Mutations now strictly use the server-verified teacher identity (`req.teacher.id`), ignoring any client-supplied `teacherId`.
  5. Updated `client/src/context/AppContext.jsx`, `LandingPage.jsx`, `TeacherDashboard.jsx`, and `StudentGapTraceModal.jsx` to propagate and attach the bearer token.
- **Verification Evidence (`server/test-security.js`):**
  - `Unauthenticated POST /api/teacher/assign returns 401 Unauthorized`: **PASSED**
  - `Malformed Bearer token in POST /api/teacher/assign returns 401 Unauthorized`: **PASSED**
  - `POST /api/auth/teacher/login returns cryptographic token`: **PASSED**
  - `Authenticated teacher can successfully override student mastery (200 OK)`: **PASSED**
  - `Teacher cannot modify student outside authorized classroom (403 Forbidden)`: **PASSED**

---

### Finding SEC-02 (MEDIUM): Unrestricted Student Record Creation
- **Vulnerability:** Unauthenticated callers could POST arbitrary strings to `/api/auth/student/login` with a valid join code, creating unlimited dummy records in the `students` table.
- **Remediation Implemented:**
  1. Server-side Unicode student name validation: enforces 2–50 characters, trimmed, matching `^[\p{L}\p{M}\p{N}\s.,'-]{2,50}$/u` to fully support Indian names across scripts (English, Devanagari, Telugu, Tamil, etc.) while blocking injection scripts and malformed strings.
  2. Validates classroom join code against existing classrooms in datastore (`SELECT * FROM classrooms WHERE join_code = ?`).
  3. Added IP-based sliding rate limiter (`server/middleware/rateLimiter.js` and `checkStudentCreationLimit`) bounding rapid student creations (max 15 new creations per 10 minutes per IP).
- **Verification Evidence (`server/test-security.js`):**
  - `Single-character name "A" is rejected (400 Bad Request)`: **PASSED**
  - `XSS injection script in student name is rejected (400 Bad Request)`: **PASSED**
  - `Multilingual Indian student name in Devanagari is accepted (200 OK)`: **PASSED**
  - `Unknown classroom join code "INVALID99" is rejected (401 Unauthorized)`: **PASSED**

---

### Finding SEC-03 (MEDIUM): Permissive CORS Policy
- **Vulnerability:** `server/index.js` used `app.use(cors())`, allowing wildcard cross-origin requests (`Access-Control-Allow-Origin: *`) from any web page.
- **Remediation Implemented:**
  1. Replaced wildcard CORS in `server/index.js` with an explicit origin allowlist.
  2. Permitted origins include:
     - Local development origins: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:5173`, `http://127.0.0.1:3001`
     - Evaluator tunnel domain pattern: `*.trycloudflare.com` and `*.github.io`
     - Custom configurable origins via `ALLOWED_ORIGINS` environment variable.
  3. Non-browser agents (cURL, CLI smoke tests, automated test runner) are permitted without origin headers.
  4. Global error handler intercepts blocked cross-origin requests and responds with `403 Forbidden`.
- **Verification Evidence:**
  - Tested with local fetch requests and live HTTP suite: all allowed local origins communicate cleanly; untrusted origins receive rejection.

---

### Finding SEC-04 (MEDIUM): Missing Request Body Size Limit & Lack of Rate Limiting
- **Vulnerability:** `express.json()` did not configure a body payload limit, creating an avenue for memory exhaustion via oversized payloads.
- **Remediation Implemented:**
  1. Enforced strict 64 KB JSON payload limit: `app.use(express.json({ limit: '64kb' }))` in `server/index.js`.
  2. Added global error handler catching `err.type === 'entity.too.large'` and returning `413 Payload Too Large`.
  3. Applied `loginRateLimiter` (`server/middleware/rateLimiter.js`) to `/api/auth/teacher/login` and `/api/auth/student/login` (max 30 requests per minute).
- **Verification Evidence (`server/test-security.js`):**
  - `Oversized JSON payload (>64KB) is rejected (413 Payload Too Large)`: **PASSED** (tested with 70 KB payload).

---

### Finding SEC-05 (LOW): Formative Practice Answer Bias
- **Vulnerability:** In Stage 2 (Guided Practice / Solve), the client evaluated formative selections using `const isCorrect = optionIdx === 0;`, exploiting an artifact where question authoring placed correct options at index 0 in `questions.js`.
- **Remediation Implemented:**
  1. Added `POST /api/quiz/check-practice` endpoint in `server/routes/quiz.js`.
  2. Server derives correctness directly from trusted question data by comparing either `q.answer === selectedOption` or `q.options[q.answer] === selectedOptionText`.
  3. Updated `client/src/pages/StudentLearnSolveTest.jsx` so `handlePracticeSelect` invokes `/api/quiz/check-practice` and verifies answers dynamically without index assumptions.
  4. Direct text matching guarantees that option shuffling never corrupts or alters the true correct answer.
  5. Benchmark test grading (`POST /api/quiz/submit`) remains 100% server-side.
- **Verification Evidence (`server/test-security.js`):**
  - `POST /api/quiz/check-practice correctly evaluates answer against question bank`: **PASSED**
  - `POST /api/quiz/check-practice identifies incorrect answer`: **PASSED**
  - `POST /api/quiz/check-practice verifies option text directly (shuffling-immune)`: **PASSED**

---

## 3. Dependency Vulnerability Audit (`npm audit`)

Direct execution against the official npm registry (`registry.npmjs.org`) yielded the following verified status:

### Server Dependencies (`server/package.json`)
```
npm audit --json (server)
Result: 0 vulnerabilities found
Total production dependencies: 70 packages (Express 4.21.0, CORS 2.8.5, zero native C++ addons)
```
- **Conclusion:** Production backend runtime dependencies are 100% vulnerability-free.

### Client Dependencies (`client/package.json`)
```
npm audit --json (client)
Result: 7 vulnerabilities (1 High, 6 Moderate, 0 Critical)
```
- **Detailed Findings:**
  1. **`vite` (High — GHSA-fx2h-pf6j-xcff, GHSA-587h-7wmj-h5pm):** Path traversal / alternate paths on Windows development server in `vite <= 6.4.3`.  
     *Mitigation in KakshaSignal:* In production and live demonstrations, the client is pre-built into static HTML/JS/CSS assets via `npm run build` and served directly by Express (`express.static`). The Vite development server (`vite --port 5173`) is not exposed to judges or the public internet.  
     *Fix availability:* Requires major upgrade to Vite 8 (`npm audit fix --force`), which would introduce breaking plugin API incompatibilities during hackathon code freeze.
  2. **`react-router-dom` (Moderate — GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg):** Open redirect via backslash in Link/useNavigate and SSR hydration vulnerability.  
     *Mitigation in KakshaSignal:* The application is an SPA (Client-Side Rendering only, no SSR hydration) with internal routes (`/`, `/teacher`, `/student`, `/learn/:nodeId`). No external untrusted redirects are accepted from query parameters.  
     *Fix availability:* Requires major upgrade to React Router 7 (`7.18.4`).
  3. **`tailwindcss` / `postcss-nested` (Moderate — GHSA-rj75-hqrm-r3gf):** Quadratic complexity in flat selector parsing allows CPU exhaustion during CSS compilation.  
     *Mitigation in KakshaSignal:* Tailwind CSS runs strictly at build-time during `npm run build` on trusted local developer files; no user-supplied CSS is compiled at runtime.  
     *Fix availability:* Requires Tailwind v4 major upgrade.

---

## 4. Residual Risks & Operational Considerations

1. **Shared Hackathon Demo Credentials:**
   - The teacher login currently accepts the shared demonstration code `TEACH2026`. This is by design for the Code Kernel ’26 evaluation panel to test Mrs. Sharma's command center without requiring a manual registration and email verification loop.
   - *Operational note:* Shared demo credentials must be replaced by individual teacher accounts with hashed passwords (bcrypt/argon2) and multi-factor authentication (MFA) prior to school-wide production rollout.
2. **In-Memory Rate Limiting:**
   - The current rate limiters (`ipBuckets`, `studentCreationsPerIp`) are maintained in-memory. If the server process restarts, rate counters reset. In an enterprise multi-instance deployment, this should be backed by Redis.
3. **Low-Bandwidth Session Caching:**
   - In low-bandwidth mode, GET requests are stored in browser `sessionStorage`. Sensitive student assessment answers are never stored in session storage.

---

## 5. Final Audit Remediation Verification (AUD-01 to AUD-05)

All 5 findings from the final comprehensive code audit (`FINAL_AUDIT_REPORT.md`) have been remediated and regression-tested:

1. **AUD-01 (Teacher Overview ESM require Bug):**
   - Fixed invalid CommonJS `require()` call in `server/routes/teacher.js:23`.
   - Verified that authenticated teachers with valid Bearer tokens load the class overview without HTTP 500 errors.
2. **AUD-05 (Student Record Protection & Cross-Student IDOR):**
   - Issued signed HMAC-SHA256 student session tokens at `POST /api/auth/student/login`.
   - Protected all student progress routes with `requireStudentOrTeacherAuth`. Verified students cannot access other students' records (403 Forbidden).
3. **AUD-02 (Session Secret Production Hardening):**
   - Startup fails closed if `NODE_ENV === 'production'` and `SESSION_SECRET` is unset or insecure.
   - Development/testing uses ephemeral 256-bit cryptographic random keys in memory, eliminating static fallback vectors.
4. **AUD-03 (Rate Limiter IP Spoofing Protection):**
   - Implemented `getClientIp()` in `server/middleware/rateLimiter.js`. Untrusted `x-forwarded-for` headers are ignored unless `TRUST_PROXY=true`.
5. **AUD-04 (Strict CORS Origin Allowlist):**
   - Removed wildcard subdomain matching. Restricted CORS allowlist to localhost, 127.0.0.1, and explicit demo origin `https://dhruv241113.github.io`. Additional origins require explicit `ALLOWED_ORIGINS` configuration.
