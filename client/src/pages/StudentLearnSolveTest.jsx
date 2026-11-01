import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SafeMarkdown from '../components/SafeMarkdown';

export default function StudentLearnSolveTest() {
  const { nodeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, t, cachedFetch, isOnline, queueOfflineAttempt } = useApp();

  const initialTab = searchParams.get('tab') || 'learn';
  const [activeTab, setActiveTab] = useState(initialTab); // 'learn' | 'solve' | 'test'

  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState(null);
  
  // Practice/Solve state
  const [practiceQuiz, setPracticeQuiz] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceFeedback, setPracticeFeedback] = useState({});

  // Progressive Hints state
  const [hintsState, setHintsState] = useState({});

  // Adaptive Diagnostic Mode state
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [adaptiveSession, setAdaptiveSession] = useState({
    history: [],
    currentQuestion: null,
    currentDifficulty: 'medium',
    adaptationRationale: '',
    suspectedGap: null,
    confidence: 'none',
    shouldStop: false,
    stopReason: null,
    sessionStats: null
  });
  const [selectedAdaptiveOption, setSelectedAdaptiveOption] = useState(null);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);

  // Test state
  const [testQuiz, setTestQuiz] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);

  // Backward trace for failed tests
  const [gapTrace, setGapTrace] = useState(null);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'learn');
    setTestResult(null);
    setTestAnswers({});
    setPracticeAnswers({});
    setPracticeFeedback({});
    setHintsState({});
    setAdaptiveMode(false);
    setAdaptiveSession({
      history: [],
      currentQuestion: null,
      currentDifficulty: 'medium',
      adaptationRationale: '',
      suspectedGap: null,
      confidence: 'none',
      shouldStop: false,
      stopReason: null,
      sessionStats: null
    });
    setGapTrace(null);

    async function loadData() {
      setLoading(true);
      try {
        // Fetch learning content (cached in low-bandwidth mode)
        const fetcher = cachedFetch || fetch;
        const learnRes = await fetcher(`/api/student/learn/${nodeId}`);
        const learnData = await learnRes.json();
        setContentData(learnData);

        // Fetch practice questions
        const practiceRes = await fetcher(`/api/quiz/generate/${nodeId}?type=practice`);
        const practiceData = await practiceRes.json();
        setPracticeQuiz(practiceData);

        // Fetch test questions with studentId so post-remediation reassessment receives fresh Form B items
        const studentQuery = user?.id ? `&studentId=${user.id}` : '';
        const testRes = await fetch(`/api/quiz/generate/${nodeId}?type=mastery${studentQuery}`);
        const testData = await testRes.json();
        setTestQuiz(testData);

      } catch (err) {
        console.error('Error loading module data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [nodeId, searchParams]);

  const handlePracticeSelect = async (questionId, optionIdx, optionText = null) => {
    setPracticeAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    
    // Find option text from practice quiz if not passed directly
    const q = practiceQuiz?.questions?.find(item => item.id === questionId);
    const textToSend = optionText || (q && q.options && q.options[optionIdx]) || null;

    try {
      const res = await fetch('/api/quiz/check-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          questionId,
          selectedOption: optionIdx,
          selectedOptionText: textToSend
        })
      });

      if (res.ok) {
        const checkResult = await res.json();
        setPracticeFeedback(prev => ({
          ...prev,
          [questionId]: {
            selected: optionIdx,
            isCorrect: checkResult.isCorrect,
            text: checkResult.isCorrect ? t('feedbackCorrect') : t('feedbackIncorrect'),
            explanation: checkResult.explanation
          }
        }));
        return;
      }
    } catch (_) {}

    // Fallback: If offline and check-practice is unreachable, show explanation without assuming option 0
    setPracticeFeedback(prev => ({
      ...prev,
      [questionId]: {
        selected: optionIdx,
        isCorrect: false,
        text: t('feedbackExplanation')
      }
    }));
  };

  // Progressive Hint Handler (Hint 1 -> Hint 2 -> Hint 3 -> Full Solution)
  const handleRequestHint = async (questionId) => {
    const current = hintsState[questionId] || { level: 0, hints: [] };
    const nextLevel = Math.min(3, (current.level || 0) + 1);

    try {
      const res = await fetch('/api/quiz/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, hintLevel: nextLevel })
      });
      if (res.ok) {
        const hintData = await res.json();
        setHintsState(prev => {
          const prevEntry = prev[questionId] || { level: 0, hints: [] };
          return {
            ...prev,
            [questionId]: {
              level: hintData.hintLevel,
              hints: [
                ...prevEntry.hints.filter(h => h.level !== hintData.hintLevel),
                { level: hintData.hintLevel, title: hintData.hintTitle, text: hintData.hintText }
              ],
              hasMore: hintData.hasMoreHints,
              isFullSolutionAvailable: hintData.isFullSolutionAvailable,
              explanation: hintData.explanation,
              showSolution: prevEntry.showSolution || false
            }
          };
        });
      }
    } catch (err) {
      console.error('Failed to load hint:', err);
    }
  };

  const handleToggleSolution = (questionId) => {
    setHintsState(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        showSolution: !prev[questionId]?.showSolution
      }
    }));
  };

  // Adaptive Diagnostic Mode Handlers
  const handleStartAdaptiveMode = async () => {
    setAdaptiveMode(true);
    setAdaptiveLoading(true);
    try {
      const res = await fetch('/api/quiz/adaptive-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id,
          nodeId,
          history: [],
          form: 'A'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAdaptiveSession({
          history: [],
          currentQuestion: data.nextQuestion,
          currentDifficulty: data.currentDifficulty || 'medium',
          adaptationRationale: data.adaptationRationale,
          suspectedGap: data.suspectedGap,
          confidence: data.confidence || 'none',
          shouldStop: data.shouldStop,
          stopReason: data.stopReason,
          sessionStats: data.sessionStats
        });
        setSelectedAdaptiveOption(null);
      }
    } catch (err) {
      console.error('Failed to start adaptive session:', err);
    } finally {
      setAdaptiveLoading(false);
    }
  };

  const handleAdaptiveSelect = (optionIdx) => {
    setSelectedAdaptiveOption(optionIdx);
  };

  const handleAdaptiveSubmit = async () => {
    if (selectedAdaptiveOption === null || !adaptiveSession.currentQuestion) return;
    setAdaptiveLoading(true);

    const q = adaptiveSession.currentQuestion;

    // Check answer correctness via server
    let checkIsCorrect = false;
    let explanation = '';
    try {
      const checkRes = await fetch('/api/quiz/check-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: q.nodeId || nodeId,
          questionId: q.id,
          selectedOption: selectedAdaptiveOption,
          selectedOptionText: q.options[selectedAdaptiveOption]
        })
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        checkIsCorrect = checkData.isCorrect;
        explanation = checkData.explanation;
      }
    } catch (_) {}

    const newHistoryItem = {
      questionId: q.id,
      nodeId: q.nodeId || nodeId,
      selectedOption: selectedAdaptiveOption,
      isCorrect: checkIsCorrect,
      difficulty: q.difficulty || adaptiveSession.currentDifficulty,
      competency: q.competency,
      explanation
    };

    const nextHistory = [...adaptiveSession.history, newHistoryItem];

    try {
      const res = await fetch('/api/quiz/adaptive-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id,
          nodeId,
          history: nextHistory,
          form: 'A'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdaptiveSession({
          history: nextHistory,
          currentQuestion: data.nextQuestion,
          currentDifficulty: data.currentDifficulty || 'medium',
          adaptationRationale: data.adaptationRationale,
          suspectedGap: data.suspectedGap || adaptiveSession.suspectedGap,
          confidence: data.confidence || 'none',
          shouldStop: data.shouldStop,
          stopReason: data.stopReason,
          sessionStats: data.sessionStats
        });
        setSelectedAdaptiveOption(null);
      }
    } catch (err) {
      console.error('Adaptive step error:', err);
    } finally {
      setAdaptiveLoading(false);
    }
  };

  const handleTestSubmit = async () => {
    if (!user || !testQuiz) return;
    setSubmittingTest(true);

    const formattedAnswers = Object.entries(testAnswers).map(([qId, optIdx]) => ({
      questionId: qId,
      selectedOption: optIdx
    }));

    const submissionToken = `sub_${user.id}_${nodeId}_${Date.now()}`;

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          nodeId,
          quizType: 'mastery',
          answers: formattedAnswers,
          submissionToken
        })
      });

      const result = await res.json();
      setTestResult(result);

      // If failed, automatically trigger backward trace to find root cause!
      if (!result.passed) {
        const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const traceRes = await fetch(`/api/student/trace/${user.id}/${nodeId}`, { headers });
        const traceResult = await traceRes.json();
        setGapTrace(traceResult);
      }

    } catch (err) {
      console.error('Network unavailable for test submission — queuing offline:', err);

      // Queue offline attempt with serverVerified: false
      if (queueOfflineAttempt) {
        queueOfflineAttempt({
          submissionToken,
          studentId: user.id,
          studentName: user.name,
          nodeId,
          nodeLabel: node?.label || nodeId,
          quizType: 'mastery',
          form: testQuiz?.isParallelForm ? 'B' : 'A',
          answers: formattedAnswers,
          totalQuestions: testQuiz?.questions?.length || 5
        });
      }

      // Display an offline placeholder result (not server-verified)
      setTestResult({
        passed: null,
        percentage: null,
        correct: null,
        total: formattedAnswers.length,
        offlineQueued: true,
        serverVerified: false,
        message: t('offlineAttemptQueued')
      });

    } finally {
      setSubmittingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-slate-500">
        Preparing adaptive learning module...
      </div>
    );
  }

  const node = contentData?.node;
  const content = contentData?.content;
  const isParallelReassessment = Boolean(testQuiz?.isParallelForm);
  const assessmentLabel = isParallelReassessment
    ? 'Form B: Parallel Reassessment'
    : testQuiz?.isReassessment
      ? 'Reassessment: Available Items'
      : 'Form A: Baseline Diagnostic';
  const assessmentDescription = isParallelReassessment
    ? 'Parallel Form B items evaluate post-remediation mastery independently.'
    : testQuiz?.isReassessment
      ? 'This competency has no complete parallel Form B set; the available questions are used for reassessment.'
      : 'Initial Form A diagnostic items evaluate baseline competency.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <span>← Back to Learning Space</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            node?.class === 6
              ? 'bg-sky-100 text-sky-800'
              : node?.class === 7
              ? 'bg-amber-100 text-amber-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            Grade {node?.class} • Chapter {node?.chapter}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            CBSE / NCERT Strand
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {node?.label}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          {node?.description}
        </p>

        {/* 3-Stage Progress Nav Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 border-t border-slate-100 pt-6">
          <button
            onClick={() => setActiveTab('learn')}
            className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition ${
              activeTab === 'learn'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>1. 📖</span>
            <span className="uppercase">{t('learn')}</span>
          </button>

          <button
            onClick={() => setActiveTab('solve')}
            className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition ${
              activeTab === 'solve'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>2. ✏️</span>
            <span className="uppercase">{t('solve')}</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition ${
              activeTab === 'test'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>3. 🎯</span>
            <span className="uppercase">{t('test')}</span>
          </button>
        </div>

        {/* Current Active Stage Description */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800">
              {activeTab === 'learn' && t('stageLearnTitle')}
              {activeTab === 'solve' && t('stageSolveTitle')}
              {activeTab === 'test' && t('stageTestTitle')}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeTab === 'learn' && t('stageLearnDesc')}
              {activeTab === 'solve' && t('stageSolveDesc')}
              {activeTab === 'test' && t('stageTestDesc')}
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Stage {activeTab === 'learn' ? '1/3' : activeTab === 'solve' ? '2/3' : '3/3'}
          </span>
        </div>
      </div>

      {/* Offline Notice Banner */}
      {!isOnline && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs font-medium text-rose-800 animate-pulse">
          <span>📴</span>
          <span>{t('offlineNotice')}</span>
        </div>
      )}

      {/* STAGE 1: LEARN */}
      {activeTab === 'learn' && content && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="max-w-none text-sm text-slate-700 leading-relaxed">
            <SafeMarkdown content={content.explanation} />
          </div>

          {/* Key Formulas & Identities Card */}
          {content.keyFormulas && content.keyFormulas.length > 0 && (
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center space-x-2">
                <span>📐 Key Rules &amp; Mathematical Identities</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {content.keyFormulas.map((f, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs font-mono font-bold text-indigo-950 shadow-xs">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Tips & Misconception Warnings */}
          {content.tips && content.tips.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center space-x-2">
                <span>💡 Common Pitfalls &amp; Exam Strategy</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-amber-900">
                {content.tips.map((tip, i) => (
                  <li key={i}>
                    <SafeMarkdown content={tip} className="inline text-xs text-amber-900" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Button to proceed to Solve */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('solve')}
              className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md transition flex items-center space-x-2"
            >
              <span>Ready! Proceed to Guided Practice (Solve)</span>
              <span>→</span>
            </button>
          </div>

        </div>
      )}

      {/* STAGE 2: SOLVE (Guided Practice & Adaptive Learning Loop) */}
      {activeTab === 'solve' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Stage 2: Guided Interactive Drill &amp; Adaptive Engine</h3>
              <p className="text-xs text-slate-500">
                Formative practice with progressive hints and live adaptive question calibration.
              </p>
            </div>
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setAdaptiveMode(false)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  !adaptiveMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Standard Practice (with Hints)
              </button>
              <button
                onClick={() => {
                  if (!adaptiveMode && (!adaptiveSession.currentQuestion || adaptiveSession.shouldStop)) {
                    handleStartAdaptiveMode();
                  } else {
                    setAdaptiveMode(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  adaptiveMode
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🎯 Adaptive Engine</span>
              </button>
            </div>
          </div>

          {/* STANDARD PRACTICE MODE */}
          {!adaptiveMode && (
            <div className="space-y-6">
              {practiceQuiz?.questions?.map((q, qIdx) => {
                const selected = practiceAnswers[q.id];
                const feedback = practiceFeedback[q.id];
                const qHints = hintsState[q.id] || { level: 0, hints: [] };

                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-400">Question {qIdx + 1}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Competency: {q.competency}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-slate-900">
                      {q.text}
                    </p>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, oIdx) => {
                        const isOptionSelected = selected === oIdx;

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handlePracticeSelect(q.id, oIdx, opt)}
                            className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                              isOptionSelected
                                ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span className="font-mono mr-2 font-bold opacity-60">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Banner */}
                    {feedback && (
                      <div className={`p-3.5 rounded-xl text-xs font-medium mt-3 space-y-2 ${
                        feedback.isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {feedback.text}
                        </div>
                        {feedback.explanation && (
                          <div className="pt-2 border-t border-slate-200/60 text-slate-700">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                              Pedagogical Reason:
                            </div>
                            <SafeMarkdown content={feedback.explanation} className="text-xs" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* PROGRESSIVE HINTS DRAWER */}
                    <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                          <span>💡 Progressive Hint System</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 rounded text-slate-600">
                            {qHints.level}/3 Used
                          </span>
                        </span>

                        <div className="flex items-center space-x-2">
                          {qHints.level < 3 && (
                            <button
                              onClick={() => handleRequestHint(q.id)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition flex items-center space-x-1"
                            >
                              <span>💡</span>
                              <span>
                                {qHints.level === 0 ? 'Need Hint 1 (Concept)' : qHints.level === 1 ? 'Unlock Hint 2 (Formula)' : 'Unlock Hint 3 (Step-by-Step)'}
                              </span>
                            </button>
                          )}

                          {(qHints.isFullSolutionAvailable || selected !== undefined) && (
                            <button
                              onClick={() => handleToggleSolution(q.id)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 transition"
                            >
                              {qHints.showSolution ? 'Hide Full Solution' : 'View Full Solution & Explanation'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Activated Hints */}
                      {qHints.hints && qHints.hints.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {qHints.hints.map(h => (
                            <div
                              key={h.level}
                              className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                                h.level === 1
                                  ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                                  : h.level === 2
                                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span>Level {h.level}: {h.title}</span>
                                <span className="opacity-60 font-mono">Hint {h.level} of 3</span>
                              </div>
                              <div>{h.text}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display Full Solution (when toggled) */}
                      {qHints.showSolution && (
                        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1">
                          <span className="text-[10px] uppercase font-black text-indigo-800 tracking-wider block">
                            Complete Pedagogical Solution &amp; Explanation:
                          </span>
                          <SafeMarkdown content={qHints.explanation || feedback?.explanation || 'Apply the core NCERT formula to reach the solution.'} />
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ADAPTIVE DIAGNOSTIC ENGINE MODE */}
          {adaptiveMode && (
            <div className="space-y-6">
              {/* Adaptive Status Header */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">Adaptive Learning Loop Active</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      adaptiveSession.currentDifficulty === 'easy'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : adaptiveSession.currentDifficulty === 'medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                    }`}>
                      Difficulty: {adaptiveSession.currentDifficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Questions adapt difficulty and probe prerequisite concepts dynamically based on your answers.
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Answered</div>
                    <div className="font-mono font-bold text-slate-700">
                      {adaptiveSession.history.length} / 5
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
                    <div className="font-mono font-bold text-emerald-600">
                      {adaptiveSession.sessionStats?.correctCount ?? 0} Correct
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptation Rationale Banner */}
              {adaptiveSession.adaptationRationale && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start space-x-2">
                  <span className="text-sm">🔄</span>
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                      Adaptive Decision Rationale:
                    </span>
                    <span>{adaptiveSession.adaptationRationale}</span>
                  </div>
                </div>
              )}

              {/* Suspected Gap Card */}
              {adaptiveSession.suspectedGap && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  adaptiveSession.confidence === 'confirmed'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center space-x-1.5">
                      <span>{adaptiveSession.confidence === 'confirmed' ? '⚠️ Confirmed Foundational Deficit' : '🔍 Suspected Learning Gap'}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      adaptiveSession.confidence === 'confirmed'
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {adaptiveSession.confidence === 'confirmed' ? 'Confirmed Deficit' : 'Tentative (1 error)'}
                    </span>
                  </div>
                  <div>
                    <strong>Identified Concept:</strong> {adaptiveSession.suspectedGap.label} (Grade {adaptiveSession.suspectedGap.class})
                  </div>
                  <div className="text-[11px] opacity-90 leading-relaxed">
                    <strong>Pedagogical Reason:</strong> {adaptiveSession.suspectedGap.misconception || adaptiveSession.suspectedGap.rationale}
                  </div>
                </div>
              )}

              {/* Active Adaptive Question */}
              {!adaptiveSession.shouldStop && adaptiveSession.currentQuestion && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">
                      Adaptive Question #{adaptiveSession.history.length + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {adaptiveSession.currentQuestion.competency}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        adaptiveSession.currentQuestion.difficulty === 'easy'
                          ? 'bg-sky-100 text-sky-800'
                          : adaptiveSession.currentQuestion.difficulty === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {adaptiveSession.currentQuestion.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-slate-900">
                    {adaptiveSession.currentQuestion.text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {adaptiveSession.currentQuestion.options.map((opt, oIdx) => {
                      const isSelected = selectedAdaptiveOption === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleAdaptiveSelect(oIdx)}
                          className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-mono mr-2 font-bold opacity-60">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleAdaptiveSubmit}
                      disabled={selectedAdaptiveOption === null || adaptiveLoading}
                      className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-amber-500 hover:bg-amber-600 shadow-md transition disabled:opacity-40"
                    >
                      {adaptiveLoading ? 'Evaluating Answer...' : 'Submit Answer & Adapt →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Early Stop / Conclusive Summary */}
              {adaptiveSession.shouldStop && (
                <div className={`p-6 rounded-3xl border-2 text-center space-y-4 ${
                  adaptiveSession.stopReason === 'conclusive_mastery'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="text-3xl">
                    {adaptiveSession.stopReason === 'conclusive_mastery' ? '🏆' : '🔍'}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      {adaptiveSession.stopReason === 'conclusive_mastery'
                        ? 'Mastery Conclusively Verified!'
                        : 'Adaptive Diagnostic Complete'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
                      {adaptiveSession.adaptationRationale}
                    </p>
                  </div>

                  {adaptiveSession.identifiedGap && (
                    <div className="p-4 bg-white rounded-2xl border border-amber-200 text-left max-w-md mx-auto space-y-2">
                      <span className="text-[10px] font-bold uppercase text-amber-800">
                        Isolated Root-Cause Deficit:
                      </span>
                      <div className="font-bold text-sm text-slate-900">
                        {adaptiveSession.identifiedGap.label} (Grade {adaptiveSession.identifiedGap.class})
                      </div>
                      <p className="text-xs text-slate-600">
                        {adaptiveSession.identifiedGap.rationale || adaptiveSession.identifiedGap.description}
                      </p>
                      <button
                        onClick={() => navigate(`/learn-solve-test/${adaptiveSession.identifiedGap.id}?tab=learn`)}
                        className="w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition"
                      >
                        Start Remediation on {adaptiveSession.identifiedGap.label} →
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex justify-center space-x-3">
                    <button
                      onClick={handleStartAdaptiveMode}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
                    >
                      Restart Adaptive Drill
                    </button>
                    <button
                      onClick={() => setActiveTab('test')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Proceed to Benchmark Test →
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('learn')}
              className="text-xs font-bold text-slate-600 hover:underline"
            >
              ← Review Concepts
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center space-x-2"
            >
              <span>Ready for Mastery Test (Test)</span>
              <span>→</span>
            </button>
          </div>

        </div>
      )}

      {/* STAGE 3: TEST (Mastery Assessment & Diagnosis) */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {testResult ? (
            /* Results Screen */
            testResult.offlineQueued ? (
              /* Offline-Queued Placeholder – Not server-verified */
              <div className="space-y-5 text-center max-w-3xl mx-auto py-6">
                <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-lg bg-amber-400 text-white">
                  📴
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {t('offlineAttemptQueued')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-lg mx-auto">
                    {t('notServerVerified')}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                    <span>⚠️</span>
                    <span>{t('pendingSync')}</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your {testResult.total}-question assessment has been saved locally. It will be submitted to the school server and graded when your internet connection is restored. Do not close the browser.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-[11px] text-amber-700">
                    <span>Questions answered: <strong>{testResult.total}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">Server Verification Pending</span>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-200">
                  <button
                    onClick={() => {
                      setTestResult(null);
                      setTestAnswers({});
                    }}
                    className="font-bold text-slate-600 hover:text-slate-900 transition"
                  >
                    ← Retake Assessment (when online)
                  </button>
                  <button
                    onClick={() => navigate('/student')}
                    className="font-bold text-purple-700 hover:text-purple-900 transition"
                  >
                    Back to Learning Journey →
                  </button>
                </div>
              </div>
            ) : (
            /* Server-Verified Results Screen */
            <div className="space-y-6 text-center max-w-3xl mx-auto py-6">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-lg ${
                testResult.passed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}>
                {testResult.passed ? '🏆' : '🔍'}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {testResult.passed ? 'Competency Mastered!' : 'Learning Gap Detected'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Required passing threshold: 70% • Your score: <strong>{testResult.percentage}%</strong> ({testResult.correct}/{testResult.total})
                </p>
                {testResult.confidence && testResult.confidence !== 'none' && !testResult.passed && (
                  <div className="mt-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center space-x-1.5 ${
                      testResult.confidence === 'confirmed'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      <span>{testResult.confidence === 'confirmed' ? '⚠️' : '🔍'}</span>
                      <span>
                        {testResult.confidence === 'confirmed'
                          ? `Confirmed Learning Gap (${testResult.errorCount || 2}+ Corroborated Errors)`
                          : 'Suspected Learning Gap (1 Ambiguous Error — Probe Recommended)'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Before vs After Score Progression Card (Form B Parallel Reassessment) */}
              {testResult.reassessment && testResult.reassessment.isReassessment ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {t('scoreProgression')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {testQuiz?.form || 'Form B (Parallel Form)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('beforeScore')}</div>
                      <div className="text-lg font-black text-rose-600 mt-0.5">
                        {testResult.reassessment.beforePercentage !== null && testResult.reassessment.beforePercentage !== undefined
                          ? `${testResult.reassessment.beforePercentage}%`
                          : 'N/A (First Attempt)'}
                      </div>
                      <div className="text-[10px] text-slate-400">Baseline Diagnostic</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('afterScore')}</div>
                      <div className="text-lg font-black text-emerald-600 mt-0.5">
                        {testResult.reassessment.afterPercentage}%
                      </div>
                      <div className="text-[10px] text-slate-400">Post-Remediation</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Delta</div>
                      <div className="text-lg font-black text-purple-700 mt-0.5">
                        {testResult.reassessment.scoreDelta !== null && testResult.reassessment.scoreDelta >= 0
                          ? `+${testResult.reassessment.scoreDelta}%`
                          : `${testResult.reassessment.scoreDelta ?? 0}%`}
                      </div>
                      <div className="text-[10px] text-slate-400">Attempts: {testResult.reassessment.attempts}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic text-center pt-1 leading-relaxed">
                    {t('reassessmentNotice')}
                  </div>
                </div>
              ) : (
                /* Initial Assessment Score Summary (Form A Baseline) */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Baseline Assessment Result
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {testQuiz?.form || 'Form A: Baseline Diagnostic'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Score: <strong className="text-slate-900">{testResult.percentage}%</strong> ({testResult.correct}/{testResult.total} correct)</span>
                    <span>Status: <strong className={testResult.passed ? 'text-emerald-600' : 'text-rose-600'}>{testResult.passed ? 'Mastered' : 'Gap Found'}</strong></span>
                  </div>
                </div>
              )}

              {/* Personalized Next-Step Adaptive Recommendation Card */}
              {testResult.recommendation ? (
                <div className={`p-5 rounded-2xl border-2 text-left space-y-3 ${
                  testResult.passed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      testResult.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {testResult.passed ? '🎯 Recommended Next Step' : '🔍 Targeted Prerequisite Remediation'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Grade {testResult.recommendation.targetClass}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      {testResult.recommendation.title}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {testResult.recommendation.message}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate(testResult.recommendation.actionUrl)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 ${
                        testResult.passed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <span>{testResult.recommendation.actionLabel}</span>
                    </button>
                  </div>
                </div>
              ) : testResult.passed ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left space-y-2">
                  <p className="font-bold">✅ Prerequisite Cleared!</p>
                  <p>
                    You have successfully established mastery for <strong>{node?.label}</strong>.
                    Subsequent dependent topics in Grade {node?.class} and above are now unblocked.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/student')}
                      className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                    >
                      Return to Learning Journey →
                    </button>
                  </div>
                </div>
              ) : (
                /* Explainable Prerequisite Trace Card (Fallback when recommendation not present) */
                <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-left space-y-4">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 uppercase">
                      Explainable Root-Cause Trace
                    </span>
                    <h4 className="font-bold text-sm text-rose-900 mt-1">
                      Why did this happen?
                    </h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      Don't worry! In the Curriculum Continuity Pass model, falling below 70% is not a failure — it points to an unstrengthened prerequisite from an earlier grade.
                    </p>
                  </div>

                  {gapTrace?.rootGaps && gapTrace.rootGaps.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Identified Foundational Anchor:
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-purple-900">
                            {gapTrace.rootGaps[0].label}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Grade {gapTrace.rootGaps[0].class} • Ch {gapTrace.rootGaps[0].chapter}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/learn-solve-test/${gapTrace.rootGaps[0].id}?tab=learn`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
                        >
                          Strengthen This Concept First →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Question-by-Question Review with Pedagogical Explanations */}
              {Array.isArray(testResult.results) && testResult.results.length > 0 && (
                <div className="text-left space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      Detailed Question Review & Explanations ({testResult.correct}/{testResult.total})
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Form: {testQuiz?.form || (testResult.reassessment?.isReassessment ? 'Form B' : 'Form A')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {testResult.results.map((item, idx) => (
                      <div
                        key={item.questionId || idx}
                        className={`p-4 rounded-2xl border text-left space-y-2.5 transition ${
                          item.isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Q{idx + 1}: {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                          {item.competency && (
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.competency}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-800 font-medium">
                          <SafeMarkdown content={item.questionText || ''} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className={`p-2 rounded-xl border ${
                            item.isCorrect
                              ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-rose-100/60 border-rose-300 text-rose-950'
                          }`}>
                            <span className="text-[10px] block uppercase font-bold text-slate-500">Your Answer:</span>
                            <span>{item.selectedOptionText || '(No answer provided)'}</span>
                          </div>

                          {!item.isCorrect && (
                            <div className="p-2 rounded-xl border bg-emerald-100/60 border-emerald-300 text-emerald-950 font-semibold">
                              <span className="text-[10px] block uppercase font-bold text-emerald-700">Correct Answer:</span>
                              <span>{item.correctOptionText}</span>
                            </div>
                          )}
                        </div>

                        {item.misconception && (
                          <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-800">
                              <span>Identified Misconception: {item.misconception.label}</span>
                              {item.misconception.prerequisiteLabel && (
                                <span className="font-mono text-purple-800 font-semibold">
                                  Prerequisite: {item.misconception.prerequisiteLabel} (Gr {item.misconception.prerequisiteClass})
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-slate-800">{item.misconception.misconception}</div>
                            <div className="text-[11px] text-amber-900/80 leading-relaxed">{item.misconception.rationale}</div>
                          </div>
                        )}

                        {item.explanation && (
                          <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 block">
                              Pedagogical Explanation:
                            </span>
                            <SafeMarkdown content={item.explanation} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-200">
                <button
                  onClick={() => {
                    setTestResult(null);
                    setTestAnswers({});
                  }}
                  className="font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  ← Retake Assessment
                </button>
                <button
                  onClick={() => navigate('/student')}
                  className="font-bold text-purple-700 hover:text-purple-900 transition"
                >
                  Back to Learning Journey →
                </button>
              </div>

            </div>
            ) /* end server-verified results */
          ) : (
            /* Active Test Quiz */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900">Competency Assessment Test</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      testQuiz?.isReassessment
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-sky-100 text-sky-800 border-sky-300'
                    }`}>
                      {assessmentLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {assessmentDescription}
                    {' • '}70% passing threshold (&gt;= 4/5 correct)
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  Target: &gt;= 4 / 5 Correct
                </div>
              </div>

              {testQuiz?.isReassessment ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <span>🔄</span>
                      <span>{isParallelReassessment ? 'Parallel Reassessment Active (Form B)' : 'Post-Remediation Assessment'}</span>
                    </span>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      {isParallelReassessment
                        ? 'You are answering parallel Form B questions to evaluate post-remediation mastery independently from initial diagnostic items.'
                        : 'A complete parallel Form B set is not authored for this competency, so the available question pool is used.'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-purple-200 text-purple-900 self-start sm:self-auto">
                    {testQuiz?.form || 'Form B (Parallel Form)'}
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <span>📋</span>
                      <span>Baseline Diagnostic Active (Form A)</span>
                    </span>
                    <p className="text-[11px] text-sky-700 mt-0.5">
                      Initial diagnostic assessment to evaluate foundational competency before remediation.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-sky-200 text-sky-900 self-start sm:self-auto">
                    {testQuiz?.form || 'Form A: Baseline Diagnostic'}
                  </span>
                </div>
              )}

              {testQuiz?.questions?.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-400">Q{idx + 1} of {testQuiz.questions.length}</span>
                    <span className="text-[10px] font-mono text-slate-400">{q.competency}</span>
                  </div>

                  <p className="font-bold text-sm text-slate-900">
                    {q.text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = testAnswers[q.id] === oIdx;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-mono mr-2 font-bold opacity-60">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Answered: <strong>{Object.keys(testAnswers).length}</strong> of {testQuiz?.questions?.length || 5}
                </span>

                <button
                  onClick={handleTestSubmit}
                  disabled={submittingTest || Object.keys(testAnswers).length < (testQuiz?.questions?.length || 5)}
                  className="py-3 px-8 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-40"
                >
                  {submittingTest ? 'Grading...' : 'Submit Assessment →'}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
