import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, t, lowBandwidth } = useApp();
  const navigate = useNavigate();

  const [topicsData, setTopicsData] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClassTab, setSelectedClassTab] = useState('all');

  const fetchStudentData = async () => {
    if (!user || user.role !== 'student') return;
    setLoading(true);
    try {
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const [topicsRes, pathRes, progressRes] = await Promise.all([
        fetch(`/api/student/topics/${user.id}`, { headers }),
        fetch(`/api/student/path/${user.id}`, { headers }),
        fetch(`/api/student/progress/${user.id}`, { headers })
      ]);

      const [topics, path, progress] = await Promise.all([
        topicsRes.json(),
        pathRes.json(),
        progressRes.json()
      ]);

      setTopicsData(topics);
      setPathData(path);
      setProgressData(progress);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  if (!user || user.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-600">Please sign in as a student to access your personalized learning journey.</p>
      </div>
    );
  }

  const stats = progressData?.stats || { totalNodes: 0, mastered: 0, gaps: 0, inProgress: 0, notStarted: 0 };
  const allTopics = topicsData?.allTopics || [];

  const filteredTopics = selectedClassTab === 'all'
    ? allTopics
    : allTopics.filter(t => t.class === parseInt(selectedClassTab));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-purple-200 backdrop-blur-sm">
              <span>{user.classroom?.name || 'Mathematics'}</span>
              <span>•</span>
              <span>Grade {user.classroom?.classLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Welcome back, {user.name}! <span className="text-3xl sm:text-4xl">🌟</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
              Your personalized curriculum continuity path dynamically adapts based on your conceptual foundations.
            </p>
          </div>

          {/* Quick Mastery Stat */}
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-center min-w-[140px]">
            <div className="text-2xl font-black text-emerald-400">
              {stats.mastered} <span className="text-xs text-white/70 font-normal">/ {stats.totalNodes}</span>
            </div>
            <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider mt-0.5">
              Competencies Mastered
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Learning Path / Prerequisite Gap Alert */}
      {pathData?.hasGaps && pathData.rootGaps && pathData.rootGaps.length > 0 ? (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
              ⚠️
            </div>
            <div className="flex-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-200 text-rose-900 uppercase tracking-wider">
                Curriculum Continuity Diagnostic
              </span>
              <h3 className="text-lg font-bold text-rose-900 mt-1">
                Foundational Gap Identified in Grade {pathData.rootGaps[0].class}!
              </h3>
              <p className="text-xs sm:text-sm text-rose-800 mt-1">
                You experienced difficulty in <strong>{pathData.diagnosticEvidence?.nodeLabel || `Grade ${user.classroom?.classLevel} topic`}</strong>.
                Our prerequisite tracer discovered that this relies on{' '}
                <strong>{pathData.rootGaps.map(g => `${g.label} (Grade ${g.class})`).join(' and ')}</strong>.
                Mastering this root foundation first will make your current class topics straightforward!
              </p>
            </div>
          </div>

          {/* Recommended Next Action Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-rose-200/80">
            <div className="text-xs font-semibold text-rose-900">
              Recommended Remedial Step: <span className="underline font-bold">{pathData.recommendedPath?.[0]?.label || pathData.rootGaps[0].label} (Grade {pathData.recommendedPath?.[0]?.class || pathData.rootGaps[0].class})</span>
            </div>
            <button
              onClick={() => navigate(`/learn-solve-test/${pathData.recommendedPath?.[0]?.id || pathData.rootGaps[0].id}`)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md transition flex items-center space-x-2"
            >
              <span>Start 3-Stage Remedial Loop (Learn → Solve → Test)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎉</div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">Foundations are Clear!</h4>
              <p className="text-xs text-emerald-800">
                No active prerequisite gaps detected. Pick any chapter below to take its competency diagnostic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">
          Curriculum Competency Modules
        </h2>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
          <button
            onClick={() => setSelectedClassTab('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedClassTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Grades (6–{user.classroom?.classLevel || 8})
          </button>
          <button
            onClick={() => setSelectedClassTab('6')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedClassTab === '6' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade 6
          </button>
          <button
            onClick={() => setSelectedClassTab('7')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedClassTab === '7' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grade 7
          </button>
          {user.classroom?.classLevel >= 8 && (
            <button
              onClick={() => setSelectedClassTab('8')}
              className={`px-3 py-1.5 font-bold rounded-lg transition ${
                selectedClassTab === '8' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grade 8
            </button>
          )}
        </div>
      </div>

      {/* Topic Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading curriculum competencies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => {
            const mastery = topic.mastery;
            const status = mastery?.status || 'not_started';

            const isMastered = status === 'mastered';
            const isGap = status === 'gap_found';
            const isInProgress = ['learning', 'practicing', 'testing'].includes(status);

            return (
              <div
                key={topic.id}
                className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isGap
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isMastered
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      topic.class === 6
                        ? 'bg-sky-100 text-sky-800'
                        : topic.class === 7
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      Grade {topic.class} • Chapter {topic.chapter}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isMastered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isGap
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isMastered
                        ? '✓ Mastered'
                        : isGap
                        ? '⚠️ Gap Detected'
                        : isInProgress
                        ? '📖 In Progress'
                        : 'Pending'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {topic.label}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/learn-solve-test/${topic.id}?tab=learn`)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <span className="text-base mr-0.5">📖</span> Learn &amp; Review
                  </button>

                  <button
                    onClick={() => navigate(`/learn-solve-test/${topic.id}?tab=test`)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition text-white ${
                      isGap
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : isMastered
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isMastered ? 'Retest' : isGap ? 'Remediate' : 'Take Quiz'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
