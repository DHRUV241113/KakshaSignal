import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function StudentGapTraceModal({ student, gapNode, traceData, onClose, onActionSuccess }) {
  const { user, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('assign');
  const [targetNode, setTargetNode] = useState(traceData?.rootGaps?.[0]?.id || gapNode?.id || '');
  const [note, setNote] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (traceData?.rootGaps?.[0]?.id) {
      setTargetNode(traceData.rootGaps[0].id);
    } else if (gapNode?.id) {
      setTargetNode(gapNode.id);
    }
  }, [traceData, gapNode]);

  if (!student || !gapNode) return null;

  const handleExecuteAction = async () => {
    if (!user || user.role !== 'teacher') return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/teacher/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          studentId: student.id,
          nodeId: targetNode,
          action: selectedAction,
          note: note.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Action successfully applied for ${student.name}!` });
        if (onActionSuccess) onActionSuccess(data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to submit action' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network connection error' });
    } finally {
      setLoading(false);
    }
  };

  const rootGaps = traceData?.rootGaps || [];
  const recommendedPath = traceData?.recommendedPath || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                Gap Trace Diagnosis
              </span>
              <span className="text-xs text-slate-400">Explainable Backward Root-Cause Analysis</span>
            </div>
            <h2 className="text-xl font-bold mt-1">
              {student.name} — <span className="text-emerald-400">{gapNode.label}</span> (Grade {gapNode.class})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 transition hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Diagnostic Assessment Evidence */}
          {traceData?.diagnosticEvidence && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Empirical Assessment Evidence
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    Original Diagnostic on {traceData.diagnosticEvidence.nodeLabel} (Class {traceData.diagnosticEvidence.classLevel})
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    traceData.diagnosticEvidence.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {traceData.diagnosticEvidence.score !== null
                      ? `Score: ${traceData.diagnosticEvidence.percentage}% (${traceData.diagnosticEvidence.correctAnswers}/${traceData.diagnosticEvidence.totalQuestions} correct)`
                      : 'Status: Deficit Seeded'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Threshold: <strong>70%</strong>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Result below mastery threshold (&lt;70%) automatically triggered the backward prerequisite graph traversal to locate foundational deficits.
              </p>
            </div>
          )}

          {/* Root-Cause Explanation Alert */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <div className="flex items-start space-x-3">
              <span className="text-xl">🔍</span>
              <div>
                <h4 className="font-bold">Explainable Curriculum Diagnostic:</h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  The student failed competency evaluation for <strong>{gapNode.label}</strong> ({gapNode.ncertBook || `Grade ${gapNode.class}`} • {gapNode.ncertChapter || `Ch ${gapNode.chapter}`}).
                  Instead of repeating the grade-level syllabus, the backward prerequisite tracer evaluated prior dependency chains.
                  {rootGaps.length > 0 ? (
                    <span>
                      {' '}The foundational deficit was traced back to <strong>{rootGaps.map(g => `${g.label} (${g.ncertBook || `Grade ${g.class}`} • ${g.ncertChapter || `Ch ${g.chapter}`})`).join(', ')}</strong>.
                    </span>
                  ) : (
                    <span> No earlier prerequisites were found broken. Remediation can begin on this topic directly.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Backward Trace Step-by-Step Chain */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Prerequisite Dependency Chain (Topological Remediation Order)
            </h4>

            <div className="space-y-2">
              {recommendedPath.map((item, idx) => {
                const isRoot = rootGaps.some(r => r.id === item.id);
                const isTarget = item.id === gapNode.id;

                return (
                  <div key={item.id} className="space-y-1">
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isRoot
                          ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                          : isTarget
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isRoot
                            ? 'bg-rose-600 text-white'
                            : isTarget
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex flex-wrap items-center gap-1.5">
                            <span>{item.label}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {item.ncertChapter ? `${item.ncertChapter}` : `Grade ${item.class} • Ch ${item.chapter}`}
                            </span>
                            {item.ncertBook && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200">
                                {item.ncertBook}
                              </span>
                            )}
                            {isRoot && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                                ROOT CAUSE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.description}
                          </div>
                          {item.rationale && (
                            <div className="mt-1.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-900 flex items-start space-x-1.5">
                              <span className="font-bold text-emerald-700 shrink-0">Why required:</span>
                              <span className="leading-tight">{item.rationale}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.mastery?.status === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.mastery?.status === 'gap_found'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.mastery?.status === 'mastered'
                            ? 'Mastered'
                            : item.mastery?.status === 'gap_found'
                            ? 'Deficit Confirmed'
                            : 'Unassessed'}
                        </span>
                      </div>
                    </div>

                    {/* Verified NCERT Edge Connector */}
                    {item.edgeToNext && (
                      <div className="my-1.5 ml-8 pl-4 border-l-2 border-dashed border-emerald-400 py-1 space-y-0.5 text-[11px] bg-slate-50/50 rounded-r-lg p-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-emerald-800 text-[10px]">
                            📚 Verified NCERT Prerequisite Link:
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-900 text-[10px]">
                            {item.edgeToNext.ncertSource}
                          </span>
                          {item.edgeToNext.type === 'pedagogical_assumption' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                              Pedagogical Assumption
                            </span>
                          )}
                        </div>
                        {item.edgeToNext.rationale && (
                          <div className="text-slate-600 text-[11px] italic leading-tight pt-0.5">
                            ↳ {item.edgeToNext.rationale}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Interventions / Override Panel */}
          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <span>Teacher Discretion & Control Panel</span>
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AI Suggests • Teacher Decides
              </span>
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Override automated AI routing or designate a personalized intervention.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <label className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                selectedAction === 'assign'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="teacherAction"
                  value="assign"
                  checked={selectedAction === 'assign'}
                  onChange={() => setSelectedAction('assign')}
                  className="sr-only"
                />
                <div className="font-bold text-xs text-emerald-900">1. Assign Remedial Module</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Route student directly to targeted Learn-Solve-Test loop
                </div>
              </label>

              <label className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                selectedAction === 'skip'
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="teacherAction"
                  value="skip"
                  checked={selectedAction === 'skip'}
                  onChange={() => setSelectedAction('skip')}
                  className="sr-only"
                />
                <div className="font-bold text-xs text-blue-900">2. Verify & Skip</div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Teacher confirmed concept offline; mark as mastered
                </div>
              </label>

              <label className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                selectedAction === 'reassign'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="teacherAction"
                  value="reassign"
                  checked={selectedAction === 'reassign'}
                  onChange={() => setSelectedAction('reassign')}
                  className="sr-only"
                />
                <div className="font-bold text-xs text-amber-900">3. Reset Diagnostic</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Clear previous score and prompt student to retake quiz
                </div>
              </label>
            </div>

            {/* Target Node Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Competency for this Action:
                </label>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                >
                  {recommendedPath.map((item) => (
                    <option key={item.id} value={item.id}>
                      Class {item.class}: {item.label} {rootGaps.some(r => r.id === item.id) ? '(Root Cause)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Guidance Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., Focus on basic fraction conversions before revisiting equation solving."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {statusMessage && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs font-semibold ${
                statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Apply Teacher Intervention'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
