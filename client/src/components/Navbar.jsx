import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' }
];

export default function Navbar() {
  const {
    user, activeClassroom, setActiveClassroom,
    lang, setLang,
    lowBandwidth, setLowBandwidth, savedBytes,
    isOnline, offlineQueue, syncOfflineQueue, isSyncing, syncStatusMsg,
    logout, t
  } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = (offlineQueue || []).filter(
    item => item.status === 'pending' || !item.serverVerified
  ).length;

  const cycleLang = () => {
    const idx = LANG_OPTIONS.findIndex(l => l.code === lang);
    const next = LANG_OPTIONS[(idx + 1) % LANG_OPTIONS.length];
    setLang(next.code);
  };

  const currentLangOption = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Branding */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0"
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-md shrink-0">
              KS
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 leading-tight">
                  KakshaSignal
                </span>
                <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
                  NEP 2020
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block truncate max-w-xs">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Controls */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-3 shrink-0">

            {/* Connectivity / Offline Badge */}
            <div className="flex items-center space-x-1">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                }`}
                title={isOnline ? 'Connected to school server' : 'Network unavailable — working offline from cache'}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span>{isOnline ? t('onlineMode') : t('offlineMode')}</span>
              </span>

              {/* Pending Sync Counter */}
              {pendingCount > 0 && (
                <button
                  onClick={() => {
                    if (isOnline && !isSyncing) syncOfflineQueue();
                  }}
                  disabled={isSyncing || !isOnline}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                    isSyncing
                      ? 'bg-blue-50 border-blue-300 text-blue-700 cursor-wait'
                      : isOnline
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                  title={isSyncing ? t('syncing') : `${pendingCount} attempt(s) pending server verification`}
                >
                  <span>{isSyncing ? '⏳' : '🔄'}</span>
                  <span>{isSyncing ? t('syncing') : `${pendingCount} ${t('pendingSync')}`}</span>
                </button>
              )}
            </div>

            {/* Sync Success Toast */}
            {syncStatusMsg && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse whitespace-nowrap">
                ✅ {syncStatusMsg}
              </span>
            )}
            
            {/* Low-connectivity toggle */}
            <button
              onClick={() => setLowBandwidth(!lowBandwidth)}
              title="Toggle low-bandwidth optimization (session cache & animation suppression)"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                lowBandwidth
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${lowBandwidth ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>{lowBandwidth ? '⚡ Low-BW' : 'Standard 4G'}</span>
              {lowBandwidth && savedBytes > 0 && (
                <span className="font-mono font-bold text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                  {(savedBytes / 1024).toFixed(1)} kB saved
                </span>
              )}
            </button>

            {/* Language Toggle (EN / HI / GU) */}
            <button
              onClick={cycleLang}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition whitespace-nowrap shrink-0 flex items-center space-x-1"
              title="Cycle language: English → हिन्दी → ગુજરાતી"
            >
              <span>{currentLangOption.flag}</span>
              <span>{currentLangOption.label}</span>
            </button>

            {/* Teacher Classroom Switcher */}
            {user?.role === 'teacher' && user.classrooms && user.classrooms.length > 0 && (
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                <span className="text-xs font-medium text-slate-500 px-1.5">Class:</span>
                <select
                  value={activeClassroom?.id || ''}
                  onChange={(e) => {
                    const selected = user.classrooms.find(c => c.id === parseInt(e.target.value));
                    if (selected) setActiveClassroom(selected);
                  }}
                  className="bg-white border-0 text-xs font-bold rounded-md px-2 py-1 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {user.classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Code: {c.join_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider">
                    {user.role === 'teacher' ? 'Educator' : `Class ${user.classroom?.classLevel || ''}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition border border-rose-200 whitespace-nowrap"
                  title={t('logout')}
                >
                  {t('logout')}
                </button>
              </div>
            ) : null}

          </div>

          {/* Mobile Right Bar: Language Pill + Hamburger Toggle */}
          <div className="flex lg:hidden items-center space-x-1.5">
            {/* Quick Online Status Dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
              title={isOnline ? 'Online' : 'Offline'}
            />

            {/* Quick Language Cycle Button */}
            <button
              onClick={cycleLang}
              className="px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-800 active:bg-slate-200 min-h-[38px] flex items-center space-x-1 shrink-0"
              title="Change Language"
            >
              <span>{currentLangOption.flag}</span>
              <span className="text-[11px] font-extrabold">{currentLangOption.code.toUpperCase()}</span>
            </button>

            {/* Hamburger / Close Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center text-base font-bold shrink-0 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          
          {/* User Profile Overview */}
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-900">{user.name}</div>
                <div className="text-[11px] font-bold text-emerald-700">
                  {user.role === 'teacher' ? '👩‍🏫 Educator Portal' : `🎓 Student — Class ${user.classroom?.classLevel || ''}`}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 min-h-[36px]"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500 py-1">
              Welcome to KakshaSignal (Not signed in)
            </div>
          )}

          {/* Connectivity Status & Sync Action */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="truncate">{isOnline ? t('onlineMode') : t('offlineMode')}</span>
            </div>

            <button
              onClick={() => setLowBandwidth(!lowBandwidth)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                lowBandwidth ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>{lowBandwidth ? '⚡ 2G/Low-BW' : '📶 Standard 4G'}</span>
            </button>
          </div>

          {/* Pending Sync Card (if any pending) */}
          {pendingCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
              <div className="text-xs text-amber-900 font-bold">
                <span>⚠️ {pendingCount} attempt(s) pending sync</span>
              </div>
              <button
                onClick={() => {
                  if (isOnline && !isSyncing) syncOfflineQueue();
                }}
                disabled={!isOnline || isSyncing}
                className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 min-h-[36px]"
              >
                {isSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
            </div>
          )}

          {/* Teacher Classroom Switcher (Mobile) */}
          {user?.role === 'teacher' && user.classrooms && user.classrooms.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Active Classroom:
              </label>
              <select
                value={activeClassroom?.id || ''}
                onChange={(e) => {
                  const selected = user.classrooms.find(c => c.id === parseInt(e.target.value));
                  if (selected) {
                    setActiveClassroom(selected);
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-800"
              >
                {user.classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Join Code: {c.join_code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Direct Navigation Links */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="py-1.5 text-emerald-700 hover:underline"
            >
              🏠 Home
            </button>
            {user?.role === 'teacher' && (
              <button
                onClick={() => {
                  navigate('/teacher');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 text-slate-800 hover:underline"
              >
                📊 Teacher Matrix
              </button>
            )}
            {user?.role === 'student' && (
              <button
                onClick={() => {
                  navigate('/student');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 text-slate-800 hover:underline"
              >
                🎓 Student Journey
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
