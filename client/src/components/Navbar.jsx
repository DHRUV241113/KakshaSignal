import React from 'react';
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
      <div className="max-w-7xl mx-auto px-2.5 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base sm:text-2xl shadow-md shrink-0">
              KS
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs xs:text-sm sm:text-lg tracking-tight text-slate-900 leading-tight truncate sm:whitespace-normal">
                  KakshaSignal
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  NEP 2020 CBE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">

            {/* Connectivity / Offline Badge */}
            <div className="flex items-center space-x-1">
              <span
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                }`}
                title={isOnline ? 'Connected to school server' : 'Network unavailable — working offline from cache'}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span>{isOnline ? t('onlineMode') : t('offlineMode')}</span>
              </span>

              {/* Pending Sync Counter */}
              {pendingCount > 0 && (
                <button
                  onClick={() => {
                    if (isOnline && !isSyncing) syncOfflineQueue();
                  }}
                  disabled={isSyncing || !isOnline}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                    isSyncing
                      ? 'bg-blue-50 border-blue-300 text-blue-700 cursor-wait'
                      : isOnline
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer'
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
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse whitespace-nowrap">
                ✅ {syncStatusMsg}
              </span>
            )}
            
            {/* Low-connectivity toggle */}
            <button
              onClick={() => setLowBandwidth(!lowBandwidth)}
              title="Toggle low-bandwidth optimization (session cache & animation suppression)"
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                lowBandwidth
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${lowBandwidth ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>{lowBandwidth ? '⚡ Low-BW' : 'Standard 4G'}</span>
              {lowBandwidth && savedBytes > 0 && (
                <span className="hidden xs:inline font-mono font-bold text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                  {(savedBytes / 1024).toFixed(1)} kB saved
                </span>
              )}
            </button>

            {/* Language Toggle (EN / HI / GU) */}
            <button
              onClick={cycleLang}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition whitespace-nowrap shrink-0"
              title="Cycle language: English → हिन्दी → ગુજરાતી"
            >
              {currentLangOption.flag} {currentLangOption.label}
            </button>

            {/* Teacher Classroom Switcher */}
            {user?.role === 'teacher' && user.classrooms && user.classrooms.length > 0 && (
              <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
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
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider">
                    {user.role === 'teacher' ? 'Educator' : `Class ${user.classroom?.classLevel || ''}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 transition border border-rose-200 whitespace-nowrap"
                  title={t('logout')}
                >
                  {t('logout')}
                </button>
              </div>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
}
