import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentLearnSolveTest from './pages/StudentLearnSolveTest';
import { useApp } from './context/AppContext';

export default function App() {
  const { user, lowBandwidth } = useApp();

  return (
    <div className={`min-h-screen flex flex-col ${lowBandwidth ? 'font-sans' : ''}`}>
      <Navbar />
      
      {/* Low-bandwidth demo indicator */}
      {lowBandwidth && (
        <div className="bg-amber-500 text-slate-900 text-xs font-bold py-1 px-4 text-center">
          Low-bandwidth demo indicator enabled — an API connection is still required.
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route
            path="/teacher"
            element={
              user && user.role === 'teacher' ? (
                <TeacherDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/student"
            element={
              user && user.role === 'student' ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/learn-solve-test/:nodeId"
            element={
              user && user.role === 'student' ? (
                <StudentLearnSolveTest />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Curriculum Continuity Pass (CCP)</strong> • Code Kernel ’26 National Engineering Hackathon
          </div>
          <div className="text-[11px] text-slate-400">
            CBSE / NEP 2020 Competency-Based Learning &amp; Diagnostics
          </div>
        </div>
      </footer>
    </div>
  );
}
