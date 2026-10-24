import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const { loginTeacher, loginStudent, t, lang } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('teacher'); // 'teacher' | 'student'
  const [teacherCode, setTeacherCode] = useState('TEACH2026');
  const [studentName, setStudentName] = useState('Sneha Rao');
  const [studentJoinCode, setStudentJoinCode] = useState('JOIN8B');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTeacherSubmit = async (e, overrideCode) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);

    const codeToUse = (overrideCode || teacherCode).trim();

    try {
      const res = await fetch('/api/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse })
      });
      const data = await res.json();
      if (res.ok) {
        loginTeacher(data.teacher, data.classrooms, data.token);
        navigate('/teacher');
      } else {
        setError(data.error || 'Invalid teacher code');
      }
    } catch (err) {
      setError('Connection failed. Make sure backend server is running on :3001');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e, overrideName, overrideJoinCode) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);

    const nameToUse = (overrideName || studentName).trim();
    const joinCodeToUse = (overrideJoinCode || studentJoinCode).trim();

    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToUse,
          joinCode: joinCodeToUse
        })
      });
      const data = await res.json();
      if (res.ok) {
        loginStudent(data.student, data.classroom, data.token);
        navigate('/student');
      } else {
        setError(data.error || 'Invalid credentials or class code');
      }
    } catch (err) {
      setError('Connection failed. Make sure backend server is running on :3001');
    } finally {
      setLoading(false);
    }
  };

  const quickDemo = async (role, codeOrName, joinCode = null) => {
    if (role === 'teacher') {
      setTeacherCode(codeOrName);
      setActiveTab('teacher');
      handleTeacherSubmit(null, codeOrName);
    } else {
      setStudentName(codeOrName);
      if (joinCode) setStudentJoinCode(joinCode);
      setActiveTab('student');
      handleStudentSubmit(null, codeOrName, joinCode);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Hero Section */}
        <div className="text-center space-y-2 sm:space-y-3.5 md:space-y-4 mb-4 sm:mb-7 md:mb-10">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span>Code Kernel ’26</span>
            <span>•</span>
            <span>GRIET × X-Kernel Hackathon</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-[1.85rem] xs:text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance max-w-2xl mx-auto">
              KakshaSignal
            </h1>
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-700">
              Powered by Curriculum Continuity Pass (CCP) Engine
            </p>
          </div>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed px-1 sm:px-0">
            KakshaSignal is a teacher-led adaptive learning system for Indian classrooms. It uses student responses to identify likely learning gaps, recommends an explainable Learn–Solve–Test pathway, and helps teachers decide what each student should do next.
          </p>

          {/* Quick Demo Launch Pills */}
          <div className="pt-2 sm:pt-3">
            <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center mb-2">
              ⚡ 1-Click Evaluation Launchers (Judge Ready):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-left">
              {/* Launcher 1: Teacher */}
              <button
                type="button"
                onClick={() => quickDemo('teacher', 'TEACH2026')}
                className="p-3 rounded-2xl bg-white border border-emerald-300 hover:bg-emerald-50 shadow-sm transition group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👩‍🏫</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-900 truncate group-hover:text-emerald-700">
                      Mrs. Sharma
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700">
                      Teacher Command Center
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Multi-class heatmap & gap trace overrides
                </div>
              </button>

              {/* Launcher 2: Sneha Rao (Class 8 Flagship) */}
              <button
                type="button"
                onClick={() => quickDemo('student', 'Sneha Rao', 'JOIN8B')}
                className="p-3 rounded-2xl bg-white border border-purple-300 hover:bg-purple-50 shadow-sm transition group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👧</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-purple-900 truncate group-hover:text-purple-700">
                      Sneha Rao (Class 8-B)
                    </div>
                    <div className="text-[10px] font-semibold text-purple-700">
                      Flagship Build Demo
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Class 8 Rational Numbers → Class 6 Fractions
                </div>
              </button>

              {/* Launcher 3: Priya Singh (Class 7 Decode Proposal) */}
              <button
                type="button"
                onClick={() => quickDemo('student', 'Priya Singh', 'JOIN7A')}
                className="p-3 rounded-2xl bg-white border border-amber-300 hover:bg-amber-50 shadow-sm transition group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👩‍🎓</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-900 truncate group-hover:text-amber-700">
                      Priya Singh (Class 7-A)
                    </div>
                    <div className="text-[10px] font-semibold text-amber-700">
                      Decode Proposal Demo
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Unlike Fractions & Decimals Gap → Class 6
                </div>
              </button>

              {/* Launcher 4: Aarav Patel (Class 7 Generalization) */}
              <button
                type="button"
                onClick={() => quickDemo('student', 'Aarav Patel', 'JOIN7A')}
                className="p-3 rounded-2xl bg-white border border-sky-300 hover:bg-sky-50 shadow-sm transition group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👦</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-sky-900 truncate group-hover:text-sky-700">
                      Aarav Patel (Class 7-A)
                    </div>
                    <div className="text-[10px] font-semibold text-sky-700">
                      Mastery Progression
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Active learning modules & diagnostics
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Mode Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden max-w-lg mx-auto w-full">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => { setActiveTab('teacher'); setError(null); }}
              className={`py-2.5 sm:py-3.5 md:py-4 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition ${
                activeTab === 'teacher'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base sm:text-lg">👩‍🏫</span> {t('teacherPortal')}
            </button>
            <button
              onClick={() => { setActiveTab('student'); setError(null); }}
              className={`py-2.5 sm:py-3.5 md:py-4 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base sm:text-lg">🎓</span> {t('studentPortal')}
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Teacher Login Form */}
            {activeTab === 'teacher' ? (
              <form onSubmit={handleTeacherSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teacher Authorization Code
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    placeholder="Enter code (Default: TEACH2026)"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold tracking-wider uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Demo Code: <span className="font-mono font-bold text-slate-700">TEACH2026</span>
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold">Features in Teacher View:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-800">
                    <li>Multi-class learning gap heatmap</li>
                    <li>Prerequisite backward trace to Class 6 root concepts</li>
                    <li>Full teacher override control (assign, skip, retest)</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Enter Teacher Portal →'}
                </button>
              </form>
            ) : (
              /* Student Login Form */
              <form onSubmit={handleStudentSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Sneha Rao, Aditya Verma"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Classroom Join Code
                  </label>
                  <input
                    type="text"
                    required
                    value={studentJoinCode}
                    onChange={(e) => setStudentJoinCode(e.target.value)}
                    placeholder="e.g. JOIN7A or JOIN8B"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold uppercase tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try <span className="font-mono font-bold text-slate-700">JOIN8B</span> (Class 8) or <span className="font-mono font-bold text-slate-700">JOIN7A</span> (Class 7)
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                  <div className="font-bold">Features in Student View:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-purple-800">
                    <li>3-Stage Learn–Solve–Test adaptive loops</li>
                    <li>Automatic backward remediation when gaps emerge</li>
                    <li>Low-bandwidth indicator (API connection required)</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-700 shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Enter Student Learning Space →'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Hackathon Alignment Footer Notice */}
        <div className="mt-5 sm:mt-8 text-center text-[11px] sm:text-xs text-slate-500 max-w-xl mx-auto space-y-0.5 sm:space-y-1 px-2">
          <p className="font-semibold text-slate-700">
            Compliant with NEP 2020 & CBSE Competency-Based Education (CBE) Framework
          </p>
          <p>
            Zero black-box AI hallucinations: All diagnostic traces and remedial paths are deterministic, explainable, and teacher-supervised.
          </p>
        </div>

      </div>
    </div>
  );
}
