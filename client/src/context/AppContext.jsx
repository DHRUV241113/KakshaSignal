import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

const translations = {
  en: {
    appName: "KakshaSignal",
    tagline: "Teacher-Controlled Adaptive Learning for Indian Classrooms",
    teacherPortal: "Teacher Portal",
    studentPortal: "Student Portal",
    logout: "Exit / Switch Role",
    lowBandwidth: "Low Bandwidth Mode",
    normalBandwidth: "Standard 4G/WiFi",
    classroom: "Classroom",
    students: "Students",
    gapsDetected: "Critical Gaps",
    masteryRate: "Mastery Rate",
    classHeatmap: "Curriculum Continuity Heatmap",
    prereqChain: "Prerequisite Knowledge Chain",
    teacherControl: "Teacher Interventions",
    learn: "Learn",
    solve: "Solve",
    test: "Test",
    diagnosticQuiz: "Diagnostic Quiz",
    practiceDrill: "Guided Practice",
    masteryTest: "Competency Mastery Test",
    traceRootCause: "Trace Root Cause",
    overrideAction: "Teacher Action",
    assignRemedial: "Assign Remedial Step",
    skipTopic: "Mark as Verified (Skip)",
    reassignTopic: "Re-diagnose Topic",
    submit: "Submit",
    next: "Next",
    backToDashboard: "Back to Dashboard",
    class6: "Class 6 Foundation",
    class7: "Class 7 Intermediate",
    class8: "Class 8 Advanced",
    status_mastered: "Mastered",
    status_gap_found: "Learning Gap Found",
    status_learning: "In Remediation",
    status_diagnosed: "Diagnosed",
    status_not_started: "Pending Diagnostic",
    beforeScore: "Baseline Diagnostic (Before)",
    afterScore: "Post-Remediation Reassessment (After)",
    scoreProgression: "Competency Score Progression",
    reassessmentNotice: "Demonstration of adaptive mastery tracking based on seeded reassessment answers; does not represent empirical clinical trials or human learning gains.",
    empiricalEvidence: "Empirical Assessment Evidence",
    whyRequired: "Why is this prerequisite required?",
    formParallel: "Form B: Parallel Reassessment",
    formStandard: "Form A: Baseline Diagnostic",
    cacheOptimized: "Low-Bandwidth Cache Active (Payload Saved)",
    remediationSuccess: "Remediation Successful — Competency Mastered!",
    remedialPath: "Ordered Remediation Ladder",
    feedbackCorrect: "✅ Excellent! Your reasoning is correct.",
    feedbackIncorrect: "💡 Not quite. Re-check the prerequisite rule above and try again.",
    feedbackExplanation: "Pedagogical Explanation",
    stageLearnTitle: "Stage 1: Concept Mastery (Learn)",
    stageSolveTitle: "Stage 2: Guided Practice (Solve)",
    stageTestTitle: "Stage 3: Competency Benchmark (Test)",
    stageLearnDesc: "Review foundational properties and key exam misconceptions.",
    stageSolveDesc: "Formative problem solving with immediate pedagogical feedback.",
    stageTestDesc: "Deterministic benchmark assessment (70% passing threshold).",
    passedBadge: "Mastered (>= 70%)",
    gapBadge: "Gap Detected (< 70%)",
    // Round 2 Additions:
    hint1Title: "Hint 1: Concept Reminder",
    hint2Title: "Hint 2: Formula & Method",
    hint3Title: "Hint 3: Step-by-Step Guidance",
    requestHint: "Need a Hint?",
    showSolution: "Show Complete Solution",
    hideSolution: "Hide Solution",
    fullSolution: "Complete Pedagogical Solution & Derivation",
    adaptiveEngine: "Adaptive Diagnostic Engine",
    adaptiveActive: "Adaptive Questioning Active",
    adaptiveRationale: "Why was this question selected?",
    suspectedGap: "Suspected Gap (1 error)",
    confirmedGap: "Confirmed Learning Gap (2+ errors)",
    difficulty: "Difficulty",
    easy: "Foundational (Easy)",
    medium: "Standard (Medium)",
    hard: "Advanced (Hard)",
    stopDiagnostic: "End Diagnostic Session",
    diagnosticComplete: "Diagnostic Questioning Complete",
    // Offline Learning & Sync:
    offlineMode: "Offline Mode",
    onlineMode: "Online",
    offlineBadge: "Working Offline (Cached)",
    pendingSync: "Pending Server Sync",
    syncedBadge: "Server-Verified & Synced",
    syncNow: "Sync Pending Attempts",
    syncing: "Syncing with School Server...",
    offlineAttemptQueued: "Assessment saved offline. Pending server verification upon reconnect.",
    offlineNotice: "You are currently offline. Lessons and practice remain fully accessible from local cache.",
    notServerVerified: "⚠️ Not Server-Verified: Local attempt awaiting server verification.",
    syncSuccess: "All pending attempts successfully synchronized and verified by server.",
    cachedLessonsAvailable: "Lessons and practice cached for offline study"
  },
  hi: {
    appName: "कक्षासिग्नल (KakshaSignal)",
    tagline: "भारतीय कक्षाओं के लिए शिक्षक-नियंत्रित अनुकूली शिक्षण समाधान",
    teacherPortal: "शिक्षक पोर्टल",
    studentPortal: "छात्र पोर्टल",
    logout: "बाहर निकलें / भूमिका बदलें",
    lowBandwidth: "कम बैंडविड्थ मोड (2G/धीमा इंटरनेट)",
    normalBandwidth: "मानक 4G/वाई-फाई",
    classroom: "कक्षा",
    students: "विद्यार्थी",
    gapsDetected: "गंभीर सीखने की कमियां",
    masteryRate: "दक्षता दर",
    classHeatmap: "पाठ्यक्रम निरंतरता हीटमैप",
    prereqChain: "पूर्व-आवश्यक ज्ञान श्रृंखला",
    teacherControl: "शिक्षक हस्तक्षेप",
    learn: "सीखें (Learn)",
    solve: "अभ्यास करें (Solve)",
    test: "जांचें (Test)",
    diagnosticQuiz: "निदानात्मक प्रश्नोत्तरी",
    practiceDrill: "मार्गदर्शित अभ्यास",
    masteryTest: "दक्षता मूल्यांकन परीक्षा",
    traceRootCause: "मूल कारण की पहचान",
    overrideAction: "शिक्षक निर्णय",
    assignRemedial: "उपचारात्मक अभ्यास सौंपें",
    skipTopic: "सत्यापित मानकर आगे बढ़ें",
    reassignTopic: "पुनः निदान निर्धारित करें",
    submit: "जमा करें",
    next: "आगे बढ़ें",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    class6: "कक्षा 6 बुनियादी",
    class7: "कक्षा 7 मध्यवर्ती",
    class8: "कक्षा 8 उन्नत",
    status_mastered: "दक्ष (Mastered)",
    status_gap_found: "सीखने में कमी (Gap Found)",
    status_learning: "सुधार जारी (In Remediation)",
    status_diagnosed: "निदान पूर्ण (Diagnosed)",
    status_not_started: "प्रारंभ नहीं हुआ (Pending)",
    beforeScore: "प्रारंभिक स्कोर (पहले)",
    afterScore: "सुधार उपरांत पुनः मूल्यांकन (बाद में)",
    scoreProgression: "दक्षता स्कोर में सुधार",
    reassessmentNotice: "अनुकूली दक्षता ट्रैकिंग का प्रदर्शन; यह कृत्रिम डेटा पर आधारित है और वास्तविक मानव सीखने के लाभ का दावा नहीं करता।",
    empiricalEvidence: "मूल्यांकन प्रमाण",
    whyRequired: "यह पूर्व-आवश्यक चरण क्यों आवश्यक है?",
    formParallel: "फॉर्म बी: समानांतर पुनः परीक्षा",
    formStandard: "फॉर्म ए: प्रारंभिक निदान",
    cacheOptimized: "कम बैंडविड्थ कैश सक्रिय (डेटा की बचत)",
    remediationSuccess: "उपचार सफल रहा — अवधारणा में दक्षता प्राप्त हुई!",
    remedialPath: "क्रमबद्ध उपचारात्मक मार्ग",
    feedbackCorrect: "✅ बहुत बढ़िया! आपका उत्तर और तर्क बिल्कुल सही है।",
    feedbackIncorrect: "💡 थोड़ा गलत है। ऊपर दिए गए नियम को दोबारा देखकर पुनः प्रयास करें।",
    feedbackExplanation: "शैक्षणिक व्याख्या",
    stageLearnTitle: "चरण 1: अवधारणा सीखें (Learn)",
    stageSolveTitle: "चरण 2: मार्गदर्शित अभ्यास (Solve)",
    stageTestTitle: "चरण 3: दक्षता परीक्षण (Test)",
    stageLearnDesc: "मूलभूत नियमों और सामान्य त्रुटियों की समीक्षा करें।",
    stageSolveDesc: "तत्काल शैक्षणिक फीडबैक के साथ निर्देशित अभ्यास।",
    stageTestDesc: "स्वचालित मानक मूल्यांकन (70% उत्तीर्ण सीमा)।",
    passedBadge: "दक्ष (>= 70%)",
    gapBadge: "सीखने में कमी (< 70%)",
    // Round 2 Additions:
    hint1Title: "संकेत 1: अवधारणा स्मरण",
    hint2Title: "संकेत 2: सूत्र एवं विधि",
    hint3Title: "संकेत 3: चरणबद्ध मार्गदर्शन",
    requestHint: "संकेत चाहिए?",
    showSolution: "संपूर्ण हल देखें",
    hideSolution: "हल छुपाएं",
    fullSolution: "संपूर्ण शैक्षणिक हल एवं व्याख्या",
    adaptiveEngine: "अनुकूली निदानात्मक इंजन",
    adaptiveActive: "अनुकूली प्रश्न चयन सक्रिय",
    adaptiveRationale: "यह प्रश्न क्यों चुना गया?",
    suspectedGap: "संभावित कमी (1 त्रुटि)",
    confirmedGap: "पुष्ट सीखने की कमी (2+ त्रुटियां)",
    difficulty: "कठिनाई स्तर",
    easy: "बुनियादी (सरल)",
    medium: "मानक (मध्यम)",
    hard: "उन्नत (कठिन)",
    stopDiagnostic: "निदान सत्र समाप्त करें",
    diagnosticComplete: "निदानात्मक प्रश्नोत्तरी पूर्ण",
    // Offline Learning & Sync:
    offlineMode: "ऑफलाइन मोड",
    onlineMode: "ऑनलाइन",
    offlineBadge: "ऑफलाइन कार्य (कैश आधारित)",
    pendingSync: "सर्वर सिंक लंबित",
    syncedBadge: "सर्वर द्वारा सत्यापित एवं सिंक पूर्ण",
    syncNow: "लंबित प्रयास सिंक करें",
    syncing: "स्कूल सर्वर से सिंक हो रहा है...",
    offlineAttemptQueued: "मूल्यांकन ऑफलाइन सुरक्षित किया गया। नेटवर्क आने पर सर्वर सत्यापन लंबित।",
    offlineNotice: "आप वर्तमान में ऑफलाइन हैं। पाठ एवं अभ्यास स्थानीय कैश से पूरी तरह उपलब्ध हैं।",
    notServerVerified: "⚠️ सर्वर द्वारा अभी सत्यापित नहीं: स्थानीय प्रयास सिंक की प्रतीक्षा में है।",
    syncSuccess: "सभी लंबित प्रयास सफलतापूर्वक सिंक एवं सर्वर द्वारा सत्यापित हो गए।",
    cachedLessonsAvailable: "ऑफलाइन अध्ययन के लिए पाठ एवं प्रश्न उपलब्ध हैं"
  },
  gu: {
    appName: "કક્ષાસિગ્નલ (KakshaSignal)",
    tagline: "ભારતીય વર્ગખંડો માટે શિક્ષક-નિયંત્રિત અનુકૂલિત શિક્ષણ પદ્ધતિ",
    teacherPortal: "શિક્ષક પોર્ટલ",
    studentPortal: "વિદ્યાર્થી પોર્ટલ",
    logout: "બહાર નીકળો / ભૂમિકા બદલો",
    lowBandwidth: "ઓછો બેન્ડવિડ્થ મોડ (2G/ધીમું નેટવર્ક)",
    normalBandwidth: "પ્રમાણભૂત 4G/વાઇ-ફાઇ",
    classroom: "વર્ગખંડ",
    students: "વિદ્યાર્થીઓ",
    gapsDetected: "શીખવાની ગંભીર ખામીઓ",
    masteryRate: "દક્ષતા દર",
    classHeatmap: "અભ્યાસક્રમ સાતત્ય હીટમેપ",
    prereqChain: "પૂર્વ-જરૂરી જ્ઞાન શૃંખલા",
    teacherControl: "શિક્ષક હસ્તક્ષેપ",
    learn: "શીખો (Learn)",
    solve: "મહાવરો કરો (Solve)",
    test: "કસોટી આપો (Test)",
    diagnosticQuiz: "નિદાનાત્મક ક્વિઝ",
    practiceDrill: "માર્ગદર્શિત મહાવરો",
    masteryTest: "દક્ષતા મૂલ્યાંકન કસોટી",
    traceRootCause: "મૂળ કારણની શોધ",
    overrideAction: "શિક્ષક નિર્ણય",
    assignRemedial: "ઉપચારાત્મક કાર્ય સોંપો",
    skipTopic: "ચકાસાયેલ ગણી આગળ વધો",
    reassignTopic: "ફરીથી નિદાન નક્કી કરો",
    submit: "સબમિટ કરો",
    next: "આગળ વધો",
    backToDashboard: "ડેશબોર્ડ પર પાછા જાઓ",
    class6: "ધોરણ 6 પાયો",
    class7: "ધોરણ 7 મધ્યવર્તી",
    class8: "ધોરણ 8 ઉચ્ચ સ્તર",
    status_mastered: "સિદ્ધ થયેલ (Mastered)",
    status_gap_found: "શીખવામાં ખામી (Gap Found)",
    status_learning: "સુધારણા ચાલુ (In Remediation)",
    status_diagnosed: "નિદાન પૂર્ણ (Diagnosed)",
    status_not_started: "બાકી (Pending)",
    beforeScore: "પ્રારંભિક સ્કોર (પહેલાં)",
    afterScore: "સુધારણા પછી પુનઃ મૂલ્યાંકન (પછી)",
    scoreProgression: "દક્ષતા સ્કોરમાં સુધારો",
    reassessmentNotice: "અનુકૂલિત દક્ષતા ટ્રેકિંગનું નિદર્શન; આ કૃત્રિમ ડેટા પર આધારિત છે અને વાસ્તવિક માનવ શિક્ષણના દાવા કરતું નથી.",
    empiricalEvidence: "મૂલ્યાંકન પુરાવા",
    whyRequired: "આ પૂર્વ-જરૂરિયાત શા માટે જરૂરી છે?",
    formParallel: "ફોર્મ બી: સમાંતર પુનઃ કસોટી",
    formStandard: "ફોર્મ એ: પ્રારંભિક નિદાન",
    cacheOptimized: "ઓછો બેન્ડવિડ્થ કૅશ સક્રિય (ડેટા બચત)",
    remediationSuccess: "ઉપચાર સફળ રહ્યો — સંકલ્પનામાં દક્ષતા પ્રાપ્ત થઈ!",
    remedialPath: "ક્રમબદ્ધ ઉપચારાત્મક માર્ગ",
    feedbackCorrect: "✅ ઉત્તમ! તમારો જવાબ અને તર્ક સાચો છે.",
    feedbackIncorrect: "💡 થોડી ભૂલ છે. ઉપર આપેલો નિયમ ફરીથી જોઈને પ્રયાસ કરો.",
    feedbackExplanation: "શૈક્ષણિક સમજૂતી",
    stageLearnTitle: "તબક્કો 1: સંકલ્પના શીખો (Learn)",
    stageSolveTitle: "તબક્કો 2: માર્ગદર્શિત મહાવરો (Solve)",
    stageTestTitle: "તબક્કો 3: દક્ષતા કસોટી (Test)",
    stageLearnDesc: "પાયાના નિયમો અને સામાન્ય ભૂલોનું પુનરાવર્તન કરો.",
    stageSolveDesc: "તાત્કાલિક શૈક્ષણિક પ્રતિસાદ સાથે મહાવરો.",
    stageTestDesc: "ધોરણસર મૂલ્યાંકન કસોટી (70% ઉત્તીર્ણ મર્યાદા).",
    passedBadge: "દક્ષ (>= 70%)",
    gapBadge: "શીખવામાં ખામી (< 70%)",
    // Round 2 Additions:
    hint1Title: "સંકેત 1: સંકલ્પના સ્મરણ",
    hint2Title: "સંકેત 2: સૂત્ર અને પદ્ધતિ",
    hint3Title: "સંકેત 3: પગલાંવાર માર્ગદર્શન",
    requestHint: "સંકેતની જરૂર છે?",
    showSolution: "સંપૂર્ણ ઉકેલ જુઓ",
    hideSolution: "ઉકેલ છુપાવો",
    fullSolution: "સંપૂર્ણ શૈક્ષણિક ઉકેલ અને સમજૂતી",
    adaptiveEngine: "અનુકૂલિત નિદાન એન્જિન",
    adaptiveActive: "અનુકૂલિત પ્રશ્ન પસંદગી સક્રિય",
    adaptiveRationale: "આ પ્રશ્ન કેમ પસંદ કરવામાં આવ્યો?",
    suspectedGap: "સંભવિત ખામી (1 ભૂલ)",
    confirmedGap: "પુષ્ટ શીખવાની ખામી (2+ ભૂલો)",
    difficulty: "મુશ્કેલી સ્તર",
    easy: "સરળ (પાયાનું)",
    medium: "મધ્યમ (પ્રમાણભૂત)",
    hard: "કઠિન (ઉચ્ચ)",
    stopDiagnostic: "નિદાન સત્ર પૂર્ણ કરો",
    diagnosticComplete: "નિદાનાત્મક સત્ર પૂર્ણ થયું",
    // Offline Learning & Sync:
    offlineMode: "ઑફલાઇન મોડ",
    onlineMode: "ઑનલાઇન",
    offlineBadge: "ઑફલાઇન કાર્ય (કૅશ આધારિત)",
    pendingSync: "સર્વર સિંક બાકી",
    syncedBadge: "સર્વર દ્વારા ચકાસાયેલ અને સિંક પૂર્ણ",
    syncNow: "બાકી પ્રયાસો સિંક કરો",
    syncing: "શાળા સર્વર સાથે સિંક થઈ રહ્યું છે...",
    offlineAttemptQueued: "મૂલ્યાંકન ઑફલાઇન સચવાયું. નેટવર્ક આવ્યે સર્વર ચકાસણી થશે.",
    offlineNotice: "તમે હાલમાં ઑફલાઇન છો. પાઠ અને મહાવરો લોકલ કૅશમાંથી સંપૂર્ણ ઉપલબ્ધ છે.",
    notServerVerified: "⚠️ સર્વર દ્વારા હજુ ચકાસાયેલ નથી: લોકલ પ્રયાસ સિંક થવાની રાહમાં છે.",
    syncSuccess: "બધા બાકી પ્રયાસો સફળતાપૂર્વક સિંક અને સર્વર દ્વારા ચકાસાયા.",
    cachedLessonsAvailable: "ઑફલાઇન અભ્યાસ માટે પાઠ અને પ્રશ્નો ઉપલબ્ધ છે"
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ccp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeClassroom, setActiveClassroom] = useState(() => {
    const saved = localStorage.getItem('ccp_active_classroom');
    return saved ? JSON.parse(saved) : null;
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ccp_lang') || 'en';
  });

  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [savedBytes, setSavedBytes] = useState(0);

  // Connectivity and Offline Sync State
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ccp_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ccp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ccp_user');
    }
  }, [user]);

  useEffect(() => {
    if (activeClassroom) {
      localStorage.setItem('ccp_active_classroom', JSON.stringify(activeClassroom));
    } else {
      localStorage.removeItem('ccp_active_classroom');
    }
  }, [activeClassroom]);

  useEffect(() => {
    localStorage.setItem('ccp_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (lowBandwidth) {
      document.body.setAttribute('data-low-bandwidth', 'true');
    } else {
      document.body.removeAttribute('data-low-bandwidth');
    }
  }, [lowBandwidth]);

  // Queue an offline practice or test attempt
  const queueOfflineAttempt = useCallback((attempt) => {
    const item = {
      id: attempt.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      submissionToken: attempt.submissionToken || `tok_off_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId: attempt.studentId || user?.id,
      studentName: attempt.studentName || user?.name || 'Student',
      nodeId: attempt.nodeId,
      nodeLabel: attempt.nodeLabel || attempt.nodeId,
      quizType: attempt.quizType || 'mastery',
      form: attempt.form || 'A',
      answers: attempt.answers || [],
      totalQuestions: attempt.totalQuestions || 5,
      timestamp: new Date().toISOString(),
      serverVerified: false,
      status: 'pending' // 'pending' | 'syncing' | 'synced'
    };

    setOfflineQueue(prev => {
      const existingIdx = prev.findIndex(x => x.id === item.id || (x.submissionToken && x.submissionToken === item.submissionToken));
      const nextQueue = existingIdx >= 0 ? prev.map((x, i) => i === existingIdx ? item : x) : [item, ...prev];
      try {
        localStorage.setItem('ccp_offline_queue', JSON.stringify(nextQueue));
      } catch (_) {}
      return nextQueue;
    });

    return item;
  }, [user]);

  // Synchronize pending offline attempts with idempotency protection
  const syncOfflineQueue = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return { synced: 0, failed: 0 };

    let currentQueue = [];
    try {
      const raw = localStorage.getItem('ccp_offline_queue');
      currentQueue = raw ? JSON.parse(raw) : [];
    } catch (_) {
      return { synced: 0, failed: 0 };
    }

    const pending = currentQueue.filter(item => item.status === 'pending' || !item.serverVerified);
    if (pending.length === 0) return { synced: 0, failed: 0 };

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;
    const updatedQueue = [...currentQueue];

    for (const item of pending) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            studentId: item.studentId,
            nodeId: item.nodeId,
            quizType: item.quizType,
            answers: item.answers,
            submissionToken: item.submissionToken || item.id
          })
        });

        if (res.ok) {
          const resData = await res.json();
          const idx = updatedQueue.findIndex(x => x.id === item.id);
          if (idx !== -1) {
            updatedQueue[idx] = {
              ...updatedQueue[idx],
              status: 'synced',
              serverVerified: true,
              syncedAt: new Date().toISOString(),
              serverScore: resData.percentage ?? resData.score,
              serverPassed: resData.passed,
              serverMasteryStatus: resData.masteryStatus
            };
            syncedCount++;
          }
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    try {
      localStorage.setItem('ccp_offline_queue', JSON.stringify(updatedQueue));
    } catch (_) {}
    setOfflineQueue(updatedQueue);
    setIsSyncing(false);

    if (syncedCount > 0) {
      setSyncStatusMsg(`Synchronized ${syncedCount} offline attempt(s) with school server.`);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }

    return { synced: syncedCount, failed: failedCount };
  }, [isSyncing, user]);

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-synchronize pending items when connection is re-established
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue]);

  // Resilient network optimizer with offline fallback & low-bandwidth caching
  const cachedFetch = async (url, options = {}, retries = 2) => {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    const headers = { ...(options.headers || {}) };
    if (user?.token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    const finalOptions = { ...options, headers };

    // Offline short-circuit for GET: serve from persistent offline asset store immediately
    if (method === 'GET' && !navigator.onLine) {
      const offlineKey = `ccp_offline_asset_${url}`;
      const offlineCached = localStorage.getItem(offlineKey) || sessionStorage.getItem(`ccp_cache_${url}`);
      if (offlineCached) {
        return new Response(offlineCached, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-CCP-Offline': 'HIT' }
        });
      }
    }

    // Low bandwidth session cache check
    if (lowBandwidth && method === 'GET') {
      const cacheKey = `ccp_cache_${url}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setSavedBytes(prev => prev + cached.length);
        return new Response(cached, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-CCP-Cache': 'HIT' }
        });
      }
    }

    // Resilient network fetch with backoff and persistent offline caching
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutMs = options.timeout || (lowBandwidth ? 15000 : 10000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, { ...finalOptions, signal: controller.signal });
        clearTimeout(timeoutId);

        if (method === 'GET' && response.ok) {
          const text = await response.clone().text();
          // Always persist lessons and quizzes into offline asset store
          if (url.includes('/api/student/learn/') || url.includes('/api/quiz/generate/') || url.includes('/api/student/topics/') || url.includes('/api/graph/competencies')) {
            try {
              localStorage.setItem(`ccp_offline_asset_${url}`, text);
            } catch (_) {}
          }
          if (lowBandwidth) {
            try {
              sessionStorage.setItem(`ccp_cache_${url}`, text);
            } catch (_) {}
          }
        }
        return response;
      } catch (err) {
        if (attempt === retries) {
          // If network failed completely on GET, check persistent offline asset cache
          if (method === 'GET') {
            const offlineKey = `ccp_offline_asset_${url}`;
            const offlineCached = localStorage.getItem(offlineKey) || sessionStorage.getItem(`ccp_cache_${url}`);
            if (offlineCached) {
              return new Response(offlineCached, {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'X-CCP-Offline': 'FALLBACK' }
              });
            }
          }
          throw err;
        }
        // Wait backoff: 300ms, 600ms
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  };

  const loginTeacher = (teacherData, classrooms, token = null) => {
    const sessionToken = token || teacherData?.token || null;
    const userData = { role: 'teacher', ...teacherData, classrooms, token: sessionToken };
    setUser(userData);
    if (classrooms && classrooms.length > 0) {
      setActiveClassroom(classrooms[0]);
    }
  };

  const loginStudent = (studentData, classroomData, token = null) => {
    try { sessionStorage.clear(); } catch (_) {}
    const sessionToken = token || studentData?.token || null;
    const userData = { role: 'student', ...studentData, classroom: classroomData, token: sessionToken };
    setUser(userData);
    setActiveClassroom(classroomData);
  };

  const logout = () => {
    try { sessionStorage.clear(); } catch (_) {}
    setUser(null);
    setActiveClassroom(null);
    localStorage.removeItem('ccp_user');
    localStorage.removeItem('ccp_active_classroom');
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeClassroom,
        setActiveClassroom,
        lang,
        setLang,
        lowBandwidth,
        setLowBandwidth,
        savedBytes,
        isOnline,
        offlineQueue,
        queueOfflineAttempt,
        syncOfflineQueue,
        isSyncing,
        syncStatusMsg,
        loginTeacher,
        loginStudent,
        logout,
        t,
        cachedFetch
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
