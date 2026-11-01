# KakshaSignal — Official Voiceover Script
### Code Kernel ’26 (GRIET × X-Kernel) Demonstration Video
**Engine:** Curriculum Continuity Pass (CCP)  
**Total Target Duration:** 2 minutes 58 seconds (178.0 seconds)  
**Voice Profile:** Professional, clear Indian-English neutral voice (`Microsoft Heera (en-IN)`)  
**Audio Mix:** Spoken narration ducked over ambient pedagogical soundtrack (`-1.1 dBFS` voice / `-18 dBFS` BGM ducked to `-24 dBFS`)

---

## Narration Timeline & Breakdown

### Scene 1: The Classroom Problem (0:00 – 0:21)
* **Duration:** 21.0 seconds
* **Spoken Start:** 0:01.0 | **Spoken End:** 0:20.0 (19.0s)
* **Narrator:**
  > "In every classroom, students learn at different speeds. Sometimes, a student struggles with a new concept not because they cannot learn it, but because an earlier foundation is missing. Teachers need to find that gap before it grows."
* **On-Screen Display:**
  > **One classroom. Different learning needs. One missing foundation can change everything.**
* **Pedagogical Focus:** Framing the cumulative deficit in Indian middle-school mathematics.

---

### Scene 2: Introduce KakshaSignal (0:21 – 0:39)
* **Duration:** 18.0 seconds
* **Spoken Start:** 0:22.0 | **Spoken End:** 0:34.5 (12.5s)
* **Narrator:**
  > "Meet KakshaSignal, a teacher-led adaptive learning system built to make learning gaps visible, recommend the next best learning step, and keep teachers in control."
* **On-Screen Display:**
  > **KakshaSignal**  
  > *Diagnose the gap. Adapt the next step. Keep the teacher in control.*
* **Product Interface:** Live landing page displaying 4 dual-persona launchers (Mrs. Sharma, Sneha Rao, Priya Singh, Aarav Patel), Teacher Portal, and Student Portal.

---

### Scene 3: Discover the Learning Gap (0:39 – 1:07)
* **Duration:** 28.0 seconds
* **Spoken Start:** 0:40.5 | **Spoken End:** 0:58.5 (18.0s)
* **Narrator:**
  > "Sneha is struggling with Class 8 Rational Numbers. Instead of simply marking her answer wrong, KakshaSignal traces the stored prerequisite relationships to identify an earlier concept that needs attention: Class 6 Fractions."
* **On-Screen Animation & Display:**
  > **Class 6 Fractions → Class 7 bridge concept → Class 8 Rational Numbers**  
  > `NCERT Class 6 Ch 7 -> Class 7 Ch 9 -> Class 8 Ch 1`
* **Product Interface:** Sneha Rao student dashboard with Diagnostic Gap Banner, interactive Root-Cause Trace Modal, empirical assessment evidence (20% score), and verified NCERT textbook mappings.

---

### Scene 4: The Adaptive Learning Loop (1:07 – 1:46)
* **Duration:** 39.0 seconds
* **Spoken Start:** 1:08.5 | **Spoken End:** 1:33.3 (24.8s)
* **Narrator:**
  > "Students then follow a structured Learn–Solve–Test cycle. They study the concept, practise with immediate feedback, and complete an assessment. Where supported, a parallel reassessment checks progress with different questions. The resulting score updates the recorded mastery state and informs the next step."
* **On-Screen Display:**
  > **Learn → Solve → Test → Review Progress**
* **Product Interface:** 
  1. **Stage 1 (Learn):** NCERT Class 6 Fractions concept definitions, visual fraction models, and exam pitfalls.
  2. **Stage 2 (Solve):** Formative practice with immediate bilingual feedback ("Correct! / सही उत्तर!").
  3. **Stage 3 (Test):** Parallel Form B reassessment questions and submission.
  4. **Review Progress:** Live score progression card showing mastery jump from 35% gap to 100% verified mastery.

---

### Scene 5: Empower the Teacher (1:46 – 2:11)
* **Duration:** 25.0 seconds
* **Spoken Start:** 1:47.0 | **Spoken End:** 2:02.1 (15.1s)
* **Narrator:**
  > "KakshaSignal does not replace the teacher. It gives educators explainable evidence, an overview of classroom needs, and control to assign, verify, or reset a learning intervention."
* **On-Screen Display:**
  > **Explainable decisions. Teacher-controlled action.**
* **Product Interface:** Mrs. Sharma’s Educator Dashboard: Class 7-A & 8-B competency heatmap matrix, student gap trace modal, and teacher control panel (*Assign Remedial Step*, *Verify & Skip*, *Reset Diagnostic*).

---

### Scene 6: Designed for Indian Classrooms (2:11 – 2:32)
* **Duration:** 21.0 seconds
* **Spoken Start:** 2:12.0 | **Spoken End:** 2:31.1 (19.1s)
* **Narrator:**
  > "Built with Indian classroom constraints in mind, KakshaSignal offers selected Hindi interface translations, reduced visual effects in low-bandwidth mode, and static-shell caching. Assessment and grading still require an active backend connection."
* **On-Screen Display:**
  > **Accessible interfaces. Lightweight delivery. Honest offline boundaries.**
* **Product Interface:**
  * Bilingual interface toggle (**"🇮🇳 हिन्दी"**).
  * Low-bandwidth mode toggle (**"⚡ Low-BW Mode"**) with live byte savings badge (`12.4 kB saved`) and session storage caching.
  * Static application shell caching via Service Worker (`sw.js`).
  * Honest boundaries disclaimer.

---

### Scene 7: Technical Credibility, Security & Closing (2:30 – 2:58)
* **Duration:** 28.0 seconds total

#### Part 7A: Technical Credibility & Prerequisite Ladder (2:30 – 2:40)
* **Visual:** NCERT / CBSE Prerequisite Continuity Ladder (`scene7_knowledge_ladder.png`)
* **Spoken Start:** 2:30.8 | **Spoken End:** 2:38.6
* **Narrator:**
  > "Under the interface, a deterministic prerequisite graph makes every recommendation inspectable across Classes 6 to 8."
* **On-Screen Display:** 31 Competency Nodes • 37 Dependency Vectors (Classes 6, 7 & 8)

#### Part 7B: Security & Verification (2:40 – 2:48)
* **Visual:** Dedicated Security & Verification Card (`scene7_security_verification.png`)
* **Spoken Start:** 2:40.2 | **Spoken End:** 2:48.0
* **Narrator:**
  > "The latest updates add signed sessions, classroom access checks, and 144 passing verification tests."
* **On-Screen Display:**
  * 1. Signed Sessions & Cryptographic Tokens (HMAC-SHA256)
  * 2. Classroom-Level Access Checks (IDOR Guard)
  * 3. Protected Endpoints & Request-Size Limits (64 KB)
  * 4. Security Regression Test Suite (26 automated assertions)
  * Bottom Banner: 144 Verification Checks on local report (protocol conformance verified; 7 client dependency advisories noted transparently)

#### Part 7C: Final Screen & Verified QR Codes (2:48 – 2:58)
* **Visual:** Final Closing Card with Dual Scannable QR Codes (`scene7_closing_card.png`)
* **Spoken Start:** 2:48.8 | **Spoken End:** 2:57.0
* **Narrator:**
  > "KakshaSignal helps teachers identify the gap, adapt the next step, and keep every learner moving forward."
* **On-Screen Display & QR Destinations:**
  * **Project Information QR:** `https://dhruv241113.github.io/KakshaSignal/`
  * **Source Code Repo QR:** `https://github.com/DHRUV241113/KakshaSignal`
  * **Core Motto:** *Diagnose the gap. Adapt the next step. Keep the teacher in control.*
  * **Code Kernel ’26 Credentials:** GRIET × X-Kernel National Engineering Hackathon

---

## Technical Pronunciation and Timing Notes
* **KakshaSignal**: Pronounced */kʌk-ʃɑː sɪɡ-nəl/* (Hindi *Kaksha* = Classroom).
* **NCERT**: Spoken cleanly as individual letters: *N-C-E-R-T*.
* **Learn–Solve–Test**: Deliberate, rhythmic pacing with micro-pauses between stages.
* **Form A / Form B**: Clear enunciation emphasizing parallel diagnostic vs post-remediation reassessment forms.
