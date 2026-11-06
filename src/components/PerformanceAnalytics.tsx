import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Lightbulb, 
  BarChart2, 
  AlertCircle
} from 'lucide-react';

export const PerformanceAnalytics: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    grades, 
    calculateStudentGrade, 
    teachingMetrics,
    setSelectedStudentForReport
  } = useApp();

  // Class analytics calculations
  const studentScores = currentClassStudents.map(st => {
    const calc = calculateStudentGrade(st.id);
    return {
      student: st,
      finalScore: calc.finalScore,
      predicate: calc.predicate,
      isPassing: calc.isPassing,
      status: calc.status,
    };
  });

  const totalStudents = studentScores.length || 1;
  const passingStudents = studentScores.filter(s => s.isPassing);
  const remedialStudents = studentScores.filter(s => !s.isPassing);
  const passRate = Math.round((passingStudents.length / totalStudents) * 100);

  const avgClassScore = Math.round(
    studentScores.reduce((acc, s) => acc + s.finalScore, 0) / totalStudents
  );

  const highestScore = Math.max(...studentScores.map(s => s.finalScore));
  const lowestScore = Math.min(...studentScores.map(s => s.finalScore));

  // Score brackets distribution
  const brackets = [
    { label: 'Sangat Kompeten (90 - 100)', count: studentScores.filter(s => s.finalScore >= 90).length, color: 'bg-emerald-500' },
    { label: 'Kompeten (80 - 89)', count: studentScores.filter(s => s.finalScore >= 80 && s.finalScore < 90).length, color: 'bg-blue-500' },
    { label: 'Cukup Kompeten (75 - 79)', count: studentScores.filter(s => s.finalScore >= 75 && s.finalScore < 80).length, color: 'bg-amber-500' },
    { label: 'Perlu Remedial (< 75)', count: studentScores.filter(s => s.finalScore < 75).length, color: 'bg-rose-500' },
  ];

  // Competency breakdown
  const competencyCodes = [
    { code: 'TP 1: Konfigurasi Database Real-time & API', label: 'Konfigurasi DB Realtime & API' },
    { code: 'TP 2: Implementasi State & Reactive UI', label: 'State & UI Interaktif' },
    { code: 'TP 3: Proyek Aplikasi Fullstack Terintegrasi', label: 'Proyek Fullstack PBL' },
    { code: 'UTS Teori & Logika Pemrograman Web', label: 'UTS Konsep & Logika' },
  ];

  const competencyMastery = competencyCodes.map(c => {
    const items = grades.filter(g => g.competencyCode === c.code && currentClassStudents.some(st => st.id === g.studentId));
    const avg = items.length ? Math.round(items.reduce((acc, i) => acc + i.score, 0) / items.length) : 75;
    const masteryPct = Math.min(100, Math.round((avg / 100) * 100));
    return {
      ...c,
      avg,
      masteryPct,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Evaluasi Mutu Pembelajaran SMK</span>
            <span aria-hidden="true">·</span>
            <span>{activeClass.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analitik Performa & Evaluasi Metode Pengajaran
          </h1>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          Kriteria KKTP: {activeClass.kktp}
        </div>
      </div>

      {/* Top Statistical KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Tingkat Ketuntasan</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {passRate}%
          </div>
          <span className="text-[11px] text-slate-400">
            {passingStudents.length} dari {totalStudents} siswa tuntas
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Rata-Rata Kelas</span>
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {avgClassScore}
          </div>
          <span className="text-[11px] text-slate-400">
            Skala asesmen 0 - 100
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Nilai Tertinggi</span>
            <span className="text-emerald-500 font-mono font-bold">MAX</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {highestScore}
          </div>
          <span className="text-[11px] text-slate-400">
            Pencapaian optimal siswa
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Perlu Remedial</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {remedialStudents.length}
          </div>
          <span className="text-[11px] text-slate-400">
            Siswa membutuhkan bimbingan
          </span>
        </div>
      </div>

      {/* Grid: Distribution Histogram & Competency Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Score Distribution & Remedial Action (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Distribution Histogram */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribusi Sebaran Nilai Siswa
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Visualisasi ketercapaian kompetensi menurut kategori
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {brackets.map((b) => {
                const pct = Math.round((b.count / totalStudents) * 100);
                return (
                  <div key={b.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {b.label}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {b.count} Siswa ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${b.color} transition-all duration-500`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remedial Priority List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Daftar Siswa Prioritas Remedial
              </h2>
              <span className="text-xs font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                {remedialStudents.length} Siswa di Bawah KKTP
              </span>
            </div>

            {remedialStudents.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 py-3">
                Luar biasa! Seluruh siswa telah tuntas memenuhi kriteria ketuntasan (KKTP).
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {remedialStudents.map(({ student, finalScore }) => (
                  <div key={student.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {student.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        NISN: {student.nisn} · Wali: {student.parentName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        Nilai: {finalScore}
                      </span>
                      <button
                        onClick={() => setSelectedStudentForReport(student)}
                        className="px-2 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Buka Rapor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teaching Methods Evaluation & Competency Mastery (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Competency Mastery Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Penguasaan Tiap Capaian Pembelajaran (TP)
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ketercapaian indikator kompetensi kejuruan SMK
              </span>
            </div>

            <div className="space-y-3.5 pt-2">
              {competencyMastery.map((c) => (
                <div key={c.code} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {c.label}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                      Rata-rata: {c.avg}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.avg >= 85 ? 'bg-emerald-500' : c.avg >= 75 ? 'bg-blue-500' : 'bg-rose-500'}`}
                      style={{ width: `${c.masteryPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Method Evaluation & Actionable Recommendations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Evaluasi Efektivitas Metode Pengajaran Guru
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Data komparatif metode untuk menentukan strategi pengajaran berikutnya
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {teachingMetrics.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.methodName}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      Rata-rata: <strong className="text-blue-600 dark:text-blue-400">{m.avgScore}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Partisipasi Aktif: <strong className="font-mono text-slate-800 dark:text-slate-200">{m.engagementScore}%</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Tingkat Kelulusan: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{m.passRate}%</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">Kelebihan:</strong> {m.pros}
                  </p>

                  <div className="p-2 rounded bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px] border border-amber-200/60 dark:border-amber-900/40">
                    <strong>Rekomendasi Tindak Lanjut:</strong> {m.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
