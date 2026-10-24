import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const translations = {
  en: {
    appName: "Curriculum Continuity Pass",
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
    gapBadge: "Gap Detected (< 70%)"
  },
  hi: {
    appName: "करिकुलम कंटीन्यूटी पास (CCP)",
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
    gapBadge: "सीखने में कमी (< 70%)"
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

  const [lang, setLang] = useState('en');
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [savedBytes, setSavedBytes] = useState(0);

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
    if (lowBandwidth) {
      document.body.setAttribute('data-low-bandwidth', 'true');
    } else {
      document.body.removeAttribute('data-low-bandwidth');
    }
  }, [lowBandwidth]);

  // Network optimizer for low-bandwidth environments
  const cachedFetch = async (url, options = {}) => {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    const headers = { ...(options.headers || {}) };
    if (user?.token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    const finalOptions = { ...options, headers };

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
      const response = await fetch(url, finalOptions);
      if (response.ok) {
        const text = await response.clone().text();
        try {
          sessionStorage.setItem(cacheKey, text);
        } catch (_) {}
      }
      return response;
    }
    return fetch(url, finalOptions);
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
    // Clear any low-bandwidth cached responses from a previous student session
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
