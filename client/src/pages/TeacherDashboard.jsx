import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PrerequisiteGraphView from '../components/PrerequisiteGraphView';
import StudentGapTraceModal from '../components/StudentGapTraceModal';

export default function TeacherDashboard() {
  const { user, activeClassroom, setActiveClassroom, t } = useApp();
  
  const [heatmapData, setHeatmapData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'graph'
  const [filterGrade, setFilterGrade] = useState('all');
  
  // Modal state
  const [selectedStudentForTrace, setSelectedStudentForTrace] = useState(null);
  const [selectedGapNode, setSelectedGapNode] = useState(null);
  const [traceData, setTraceData] = useState(null);
  const [loadingTrace, setLoadingTrace] = useState(false);

  const fetchClassData = async () => {
    if (!activeClassroom) return;
    setLoading(true);
    try {
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const [overviewRes, graphRes] = await Promise.all([
        fetch(`/api/teacher/class/${activeClassroom.id}/overview`, { headers }),
        fetch('/api/teacher/knowledge-graph')
      ]);

      const [overview, graph] = await Promise.all([
        overviewRes.json(),
        graphRes.json()
      ]);

      setHeatmapData(overview);
      setGraphData(graph);
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [activeClassroom]);

  const handleCellClick = async (student, node, statusObj) => {
    // If student has a gap or we want to inspect root causes
    setSelectedStudentForTrace(student);
    setSelectedGapNode(node);
    setLoadingTrace(true);

    try {
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const res = await fetch(`/api/student/trace/${student.id}/${node.id}`, { headers });
      const data = await res.json();
      setTraceData(data);
    } catch (err) {
      console.error('Failed to trace gap:', err);
    } finally {
      setLoadingTrace(false);
    }
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-600">Please sign in as a teacher to access this portal.</p>
      </div>
    );
  }

  const students = heatmapData?.students || [];
  const nodes = heatmapData?.nodes || [];

  // Filter nodes by selected grade tab in heatmap
  const filteredNodes = filterGrade === 'all'
    ? nodes.filter(n => n.class <= (activeClassroom?.class_level || 8))
    : nodes.filter(n => n.class === parseInt(filterGrade));

  // Compute aggregate statistics
  const totalMastered = students.reduce((acc, s) => acc + s.mastered, 0);
  const totalGaps = students.reduce((acc, s) => acc + s.gapFound, 0);
  const totalInProgress = students.reduce((acc, s) => acc + s.inProgress, 0);
  const totalCells = students.length * filteredNodes.length || 1;
  const classMasteryPercentage = Math.round((totalMastered / totalCells) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Classroom Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Teacher Control Command
            </span>
            <span className="text-xs text-slate-500 font-medium">{user.school}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {activeClassroom ? activeClassroom.name : 'Classroom Overview'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class Join Code: <strong className="font-mono text-emerald-700 font-bold">{activeClassroom?.join_code}</strong> • Grade {activeClassroom?.class_level} Mathematics
          </p>
        </div>

        {/* Classroom Quick Selector Tabs */}
        {user.classrooms && user.classrooms.length > 1 && (
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2">Switch:</span>
            {user.classrooms.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveClassroom(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeClassroom?.id === c.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{students.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active student learners</div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50/20 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Active Learning Gaps</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{totalGaps}</div>
          <div className="text-[11px] text-rose-700 mt-1">Requires prerequisite trace</div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Mastered Competencies</div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{totalMastered}</div>
          <div className="text-[11px] text-emerald-800 mt-1">Met &gt;70% competency benchmark</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Mastery Index</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{classMasteryPercentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all assessed strands</div>
        </div>
      </div>

      {/* Tab Navigation: Heatmap vs Knowledge Ladder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'heatmap'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 Student Gap Heatmap
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'graph'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🕸️ Prerequisite Knowledge Ladder
          </button>
        </div>

        {activeTab === 'heatmap' && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-500">Filter Grade Columns:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setFilterGrade('all')}
                className={`px-2.5 py-1 rounded font-bold ${filterGrade === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                All (6 to {activeClassroom?.class_level})
              </button>
              <button
                onClick={() => setFilterGrade('6')}
                className={`px-2.5 py-1 rounded font-bold ${filterGrade === '6' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}
              >
                Class 6
              </button>
              <button
                onClick={() => setFilterGrade('7')}
                className={`px-2.5 py-1 rounded font-bold ${filterGrade === '7' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
              >
                Class 7
              </button>
              {activeClassroom?.class_level >= 8 && (
                <button
                  onClick={() => setFilterGrade('8')}
                  className={`px-2.5 py-1 rounded font-bold ${filterGrade === '8' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                >
                  Class 8
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500">
          Loading classroom diagnostics...
        </div>
      ) : activeTab === 'graph' ? (
        <PrerequisiteGraphView
          nodes={graphData?.nodes || []}
          edges={graphData?.edges || []}
          onSelectNode={(node) => {
            console.log('Selected node:', node);
          }}
        />
      ) : (
        /* Heatmap Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Legend */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="font-bold text-slate-700">Diagnostic Status Legend:</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block"></span>
                <span className="text-slate-600">Mastered (Passed &gt;70%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block animate-pulse"></span>
                <span className="font-bold text-rose-700">Learning Gap Detected (Click to Trace)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block"></span>
                <span className="text-slate-600">In Remediation</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block"></span>
                <span className="text-slate-500">Pending Evaluation</span>
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-xs font-extrabold text-slate-900 uppercase tracking-wider sticky left-0 bg-slate-100 z-30 min-w-[160px] border-r border-slate-200">
                    Student (Roll No)
                  </th>
                  <th className="px-3 py-3.5 text-xs font-bold text-slate-600 text-center border-r border-slate-200">
                    Mastery Summary
                  </th>
                  {filteredNodes.map((node) => (
                    <th
                      key={node.id}
                      className="px-2 py-3 text-[11px] font-bold text-slate-700 text-center min-w-[120px] max-w-[140px] border-r border-slate-200"
                      title={`${node.label} (Grade ${node.class}, Ch ${node.chapter}): ${node.description}`}
                    >
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono mb-1 ${
                        node.class === 6 ? 'bg-sky-100 text-sky-800' : node.class === 7 ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        G{node.class} • Ch{node.chapter}
                      </span>
                      <div className="truncate font-semibold">{node.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Student Name */}
                    <td className="py-3 pl-4 pr-3 text-xs font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 whitespace-nowrap">
                      <div>{student.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">Roll: {student.rollNumber || student.id}</div>
                    </td>

                    {/* Quick Stats */}
                    <td className="px-3 py-3 text-center border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5 text-xs">
                        <span className="font-bold text-emerald-700">{student.mastered}✓</span>
                        <span className="text-slate-300">/</span>
                        <span className={`font-bold ${student.gapFound > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {student.gapFound}✗
                        </span>
                      </div>
                    </td>

                    {/* Node Cells */}
                    {filteredNodes.map((node) => {
                      const statusObj = student.nodeStatuses?.[node.id] || { status: 'not_started' };
                      const status = statusObj.status;

                      let cellStyle = 'bg-slate-100 text-slate-400 hover:bg-slate-200';
                      let label = '—';

                      if (status === 'mastered') {
                        cellStyle = 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-xs';
                        label = `${Math.round((statusObj.masteryScore || statusObj.score || 0.8) * 100)}%`;
                      } else if (status === 'gap_found') {
                        cellStyle = 'bg-rose-500 text-white font-black hover:bg-rose-600 animate-pulse cursor-pointer shadow';
                        label = `${Math.round((statusObj.score || 0.4) * 100)}% 🔍`;
                      } else if (status === 'learning' || status === 'practicing' || status === 'testing') {
                        cellStyle = 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500';
                        label = 'Learn';
                      } else if (status === 'diagnosed') {
                        cellStyle = 'bg-blue-100 text-blue-900 font-medium hover:bg-blue-200';
                        label = `${Math.round((statusObj.score || 0.6) * 100)}%`;
                      }

                      return (
                        <td
                          key={node.id}
                          onClick={() => handleCellClick(student, node, statusObj)}
                          className={`px-2 py-2 text-center border-r border-slate-200 cursor-pointer transition select-none`}
                          title={`${student.name} on ${node.label}: ${status}. Click to inspect / trace root cause.`}
                        >
                          <div className={`py-1.5 px-2 rounded-lg text-xs transition duration-150 ${cellStyle}`}>
                            {label}
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Gap Trace Modal */}
      {selectedStudentForTrace && selectedGapNode && (
        <StudentGapTraceModal
          student={selectedStudentForTrace}
          gapNode={selectedGapNode}
          traceData={traceData}
          onClose={() => {
            setSelectedStudentForTrace(null);
            setSelectedGapNode(null);
            setTraceData(null);
          }}
          onActionSuccess={() => {
            fetchClassData(); // Refresh heatmap
          }}
        />
      )}

    </div>
  );
}
