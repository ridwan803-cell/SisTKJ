import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AttendanceManager } from './components/AttendanceManager';
import { GradeBookManager } from './components/GradeBookManager';
import { AssignmentManager } from './components/AssignmentManager';
import { MaterialHub } from './components/MaterialHub';
import { ParentNotificationCenter } from './components/ParentNotificationCenter';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { StudentPortal } from './components/StudentPortal';
import { StudentManager } from './components/StudentManager';
import { StudentModal } from './components/StudentModal';
import { DeleteStudentModal } from './components/DeleteStudentModal';
import { AcademicReportModal } from './components/AcademicReportModal';
import { SupabaseModal } from './components/SupabaseModal';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { 
  CheckCircle, 
  Database, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole, activeClass, setIsSupabaseModalOpen, supabaseConfig } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('data_siswa');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* If user switches to Siswa or Orang Tua role, give them the student portal or access to tabs */}
        {currentRole !== 'guru' ? (
          <StudentPortal />
        ) : (
          <>
            {currentTab === 'data_siswa' && <StudentManager />}
            {currentTab === 'absensi' && <AttendanceManager />}
            {currentTab === 'nilai' && <GradeBookManager />}
            {currentTab === 'tugas' && <AssignmentManager />}
            {currentTab === 'materi' && <MaterialHub />}
            {currentTab === 'notifikasi' && <ParentNotificationCenter />}
            {currentTab === 'analitik' && <PerformanceAnalytics />}
          </>
        )}

      </main>

      {/* Official Footnote & Status */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              SMKLAMBANAN
            </span>
            <span aria-hidden="true">·</span>
            <span>SMK Lambanan (Terakreditasi A Unggul)</span>
            <span aria-hidden="true">·</span>
            <span>Kurikulum Merdeka Kejuruan</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Status: {supabaseConfig.isConnected ? 'Supabase Cloud Connected' : 'Local Storage Mode'}</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Tahun Ajaran {activeClass.academicYear}</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AcademicReportModal />
      <SupabaseModal />
      <WhatsAppPreviewModal />
      <StudentModal />
      <DeleteStudentModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
