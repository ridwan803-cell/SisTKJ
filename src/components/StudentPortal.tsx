import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { 
    activeStudent, 
    activeClass, 
    grades, 
    assignments, 
    submissions, 
    materials, 
    getStudentAttendanceStats, 
    calculateStudentGrade,
    setSelectedStudentForReport,
    currentRole,
    students,
    setActiveStudentId
  } = useApp();

  const attStats = getStudentAttendanceStats(activeStudent.id);
  const gradeCalc = calculateStudentGrade(activeStudent.id);

  // Student specific grades
  const studentGrades = grades.filter(g => g.studentId === activeStudent.id);

  // Active assignments
  const pendingAssignments = assignments.filter(asg => {
    const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === activeStudent.id);
    return !sub || sub.status !== 'Dinilai';
  });

  return (
    <div className="space-y-6">
      
      {/* Student Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activeStudent.avatarUrl}
              alt={activeStudent.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentRole === 'orang_tua' ? 'Mode Portal Orang Tua' : 'Mode Portal Siswa'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeClass.name}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">NISN: {activeStudent.nisn}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {activeStudent.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wali Murid: <strong>{activeStudent.parentName}</strong> ({activeStudent.parentPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch student dropdown */}
            <select
              aria-label="Pilih Profil Siswa"
              value={activeStudent.id}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nisn})
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedStudentForReport(activeStudent)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak Rapor Akademik</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime KPI Overview: Nilai Akhir & Absensi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Nilai Akhir Rapor</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {gradeCalc.finalScore}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Predikat {gradeCalc.predicate}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Status: {gradeCalc.status}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Kehadiran (Absensi)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {attStats.percentage}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {attStats.hadir} Hadir · {attStats.sakit} Sakit · {attStats.izin} Izin · {attStats.alpa} Alpa
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Rata-rata Praktikum</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {gradeCalc.praktikAvg}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Bobot asesmen praktik 30%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tugas Belum Selesai</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {pendingAssignments.length}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Harap segera dikumpulkan
          </span>
        </div>
      </div>

      {/* Main Grid: Detail Nilai Transparan on Left, Tugas & Materi on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Nilai & Feedback Transparan (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Transparansi Nilai & Umpan Balik Guru
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Setiap nilai dilengkapi catatan evaluasi langsung dari pengajar
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              KKTP: {activeClass.kktp}
            </span>
          </div>

          <div className="space-y-3">
            {studentGrades.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada data nilai tercatat untuk siswa ini.
              </p>
            ) : (
              studentGrades.map((g) => {
                const isUnderKKTP = g.score < activeClass.kktp;
                return (
                  <div 
                    key={g.id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {g.competencyCode}
                      </span>
                      <span className={`font-mono tabular-nums text-sm font-bold ${
                        isUnderKKTP ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {g.score} / {g.maxScore}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{g.assessmentType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Tanggal: {g.dateRecorded}</span>
                    </div>

                    {g.feedback && (
                      <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 italic">
                        &quot;{g.feedback}&quot;
                      </p>
                    )}

                    {isUnderKKTP && (
                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] border border-rose-200 dark:border-rose-900">
                        Nilai di bawah kriteria minimum (75). Hubungi Pak Ridwan untuk konfirmasi jadwal sesi remedial.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Assignments & Quick Materials (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Tasks Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Tugas Harian & Praktikum Saya
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {assignments.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => {
                const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === activeStudent.id);
                const isSubmitted = !!sub;

                return (
                  <div key={asg.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                        {asg.title}
                      </span>
                      {isSubmitted ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                          <CheckCircle className="w-3 h-3" />
                          {sub.status}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
                          Belum Kumpul
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums">
                        Batas: {new Date(asg.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      {sub?.score && (
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          Nilai: {sub.score}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Materials Download Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Materi Belajar Terbaru
              </h2>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Siap Unduh
              </span>
            </div>

            <div className="space-y-2.5">
              {materials.slice(0, 3).map((mat) => (
                <div key={mat.id} className="p-2.5 rounded border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="pr-2 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {mat.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {mat.category} · {mat.fileSize}
                    </span>
                  </div>

                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 shrink-0"
                    title="Unduh Materi"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
