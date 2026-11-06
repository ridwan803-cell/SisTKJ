import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Database, 
  Moon, 
  Sun, 
  GraduationCap, 
  UserCheck, 
  Users
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    classes, 
    activeClassId, 
    setActiveClassId, 
    isDarkMode, 
    setIsDarkMode,
    setIsSupabaseModalOpen,
    supabaseConfig,
    students,
    activeStudentId,
    setActiveStudentId
  } = useApp();

  const navItems = [
    { id: 'data_siswa', label: 'Data Siswa' },
    { id: 'absensi', label: 'Absensi Real-Time' },
    { id: 'nilai', label: 'Buku Nilai' },
    { id: 'tugas', label: 'Tugas Harian' },
    { id: 'materi', label: 'Materi Belajar' },
    { id: 'notifikasi', label: 'Notifikasi Ortu' },
    { id: 'analitik', label: 'Analitik' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                SMKLAMBANAN
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                Sistem Absensi & Nilai Siswa Real-time
              </span>
            </div>
          </div>

          {/* Navigation Links (Visible on Tablet/Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Class Selector Dropdown */}
            <div className="hidden sm:flex items-center">
              <select
                aria-label="Pilih Kelas"
                value={activeClassId}
                onChange={(e) => setActiveClassId(e.target.value)}
                className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.major.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher Button Group */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setCurrentRole('guru')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  currentRole === 'guru'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Beralih ke Akun Guru"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Guru</span>
              </button>
              <button
                onClick={() => setCurrentRole('siswa')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  currentRole === 'siswa'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Beralih ke Portal Siswa"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Siswa</span>
              </button>
              <button
                onClick={() => setCurrentRole('orang_tua')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  currentRole === 'orang_tua'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Beralih ke Mode Orang Tua"
              >
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Ortu</span>
              </button>
            </div>

            {/* Switch Student selector when in Siswa / Ortu mode */}
            {currentRole !== 'guru' && (
              <div className="hidden lg:flex items-center">
                <select
                  aria-label="Pilih Siswa"
                  value={activeStudentId}
                  onChange={(e) => setActiveStudentId(e.target.value)}
                  className="text-xs font-medium py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Supabase Integration Button */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              title="Konfigurasi Database Supabase & Panduan Vercel"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden xl:inline text-slate-700 dark:text-slate-300">
                {supabaseConfig.isConnected ? 'Supabase Terhubung' : 'Supabase / Vercel'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
