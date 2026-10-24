import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StudentLearnSolveTest() {
  const { nodeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, t, cachedFetch } = useApp();

  const initialTab = searchParams.get('tab') || 'learn';
  const [activeTab, setActiveTab] = useState(initialTab); // 'learn' | 'solve' | 'test'

  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState(null);
  
  // Practice/Solve state
  const [practiceQuiz, setPracticeQuiz] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceFeedback, setPracticeFeedback] = useState({});

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

  const handleTestSubmit = async () => {
    if (!user || !testQuiz) return;
    setSubmittingTest(true);

    const formattedAnswers = Object.entries(testAnswers).map(([qId, optIdx]) => ({
      questionId: qId,
      selectedOption: optIdx
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          nodeId,
          quizType: 'mastery',
          answers: formattedAnswers
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
      console.error('Failed to submit test:', err);
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

      {/* STAGE 1: LEARN */}
      {activeTab === 'learn' && content && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {content.explanation}
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
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900">
                {content.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
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

      {/* STAGE 2: SOLVE (Guided Practice) */}
      {activeTab === 'solve' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Guided Interactive Drill</h3>
              <p className="text-xs text-slate-500">
                Attempt these formative problems. Immediate pedagogical feedback will explain each step.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Ungraded Practice
            </span>
          </div>

          <div className="space-y-6">
            {practiceQuiz?.questions?.map((q, qIdx) => {
              const selected = practiceAnswers[q.id];
              const feedback = practiceFeedback[q.id];

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
                    <div className={`p-3 rounded-xl text-xs font-medium mt-3 ${
                      feedback.isCorrect
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}>
                      {feedback.text}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

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
            <div className="space-y-6 text-center max-w-xl mx-auto py-6">
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

              {testResult.passed ? (
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
                /* Explainable Prerequisite Trace Card */
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

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setTestResult(null);
                        setTestAnswers({});
                      }}
                      className="font-bold text-slate-600 hover:underline"
                    >
                      Try Test Again
                    </button>
                    <button
                      onClick={() => navigate('/student')}
                      className="font-bold text-purple-700 hover:underline"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>
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
