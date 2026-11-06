import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Download, 
  Send, 
  Sparkles,
  Info,
  Edit3
} from 'lucide-react';
import { Student } from '../types';

export const GradeBookManager: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    grades, 
    updateGradeScore, 
    calculateStudentGrade,
    setSelectedStudentForReport,
    setSelectedStudentForWhatsApp,
    setStudentToEdit,
    setIsStudentModalOpen
  } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'tuntas' | 'remedial'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Assessment columns definitions
  const competencies = [
    { code: 'TP 1: Konfigurasi Database Real-time & API', type: 'formatif_tugas' as const, label: 'TP 1: DB & API' },
    { code: 'TP 2: Implementasi State & Reactive UI', type: 'praktik_lab' as const, label: 'TP 2: Lab UI/UX' },
    { code: 'TP 3: Proyek Aplikasi Fullstack Terintegrasi', type: 'proyek_pbl' as const, label: 'TP 3: Proyek PBL' },
    { code: 'UTS Teori & Logika Pemrograman Web', type: 'uts_tengah_semester' as const, label: 'UTS Tengah Smtr' },
  ];

  const filteredStudents = currentClassStudents.filter(student => {
    const gradeCalc = calculateStudentGrade(student.id);
    const matchesFilter = 
      filterMode === 'all' || 
      (filterMode === 'tuntas' && gradeCalc.isPassing) || 
      (filterMode === 'remedial' && !gradeCalc.isPassing);

    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nisn.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  const handleExportGradesCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'TP 1 (DB)', 'TP 2 (Lab)', 'TP 3 (Proyek)', 'UTS', 'Nilai Akhir', 'Predikat', 'Status'];
    const rows = currentClassStudents.map((st, idx) => {
      const calc = calculateStudentGrade(st.id);
      const tp1 = grades.find(g => g.studentId === st.id && g.competencyCode === competencies[0].code)?.score || 0;
      const tp2 = grades.find(g => g.studentId === st.id && g.competencyCode === competencies[1].code)?.score || 0;
      const tp3 = grades.find(g => g.studentId === st.id && g.competencyCode === competencies[2].code)?.score || 0;
      const uts = grades.find(g => g.studentId === st.id && g.competencyCode === competencies[3].code)?.score || 0;

      return [
        idx + 1,
        st.nisn,
        `"${st.name}"`,
        tp1,
        tp2,
        tp3,
        uts,
        calc.finalScore,
        calc.predicate,
        calc.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Nilai_${activeClass.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Mata Pelajaran: {activeClass.subjectName}</span>
            <span aria-hidden="true">·</span>
            <span>Batas KKTP: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeClass.kktp}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Buku Nilai & Asesmen Capaian Pembelajaran
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGradesCSV}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ekspor Leger Nilai (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Siswa ({currentClassStudents.length})
          </button>
          <button
            onClick={() => setFilterMode('tuntas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'tuntas'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tuntas KKTP
          </button>
          <button
            onClick={() => setFilterMode('remedial')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'remedial'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Perlu Remedial
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grade Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th className="py-3 px-3 font-semibold w-10 text-center">No</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Nama Siswa</th>
                
                {/* Competency Columns */}
                {competencies.map((c) => (
                  <th key={c.code} className="py-3 px-3 font-semibold text-center min-w-[110px]">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{c.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {c.type === 'praktik_lab' ? 'Praktik (30%)' : c.type === 'proyek_pbl' ? 'Proyek (30%)' : 'Formatif (20%)'}
                    </div>
                  </th>
                ))}

                <th className="py-3 px-3 font-semibold text-center min-w-[90px]">
                  <div className="text-blue-600 dark:text-blue-400">Nilai Akhir</div>
                  <div className="text-[10px] text-slate-400 font-normal">Kalkulasi Otomatis</div>
                </th>
                <th className="py-3 px-3 font-semibold text-center min-w-[80px]">Predikat</th>
                <th className="py-3 px-3 font-semibold text-center min-w-[100px]">Status KKTP</th>
                <th className="py-3 px-4 font-semibold text-right min-w-[150px]">Aksi & Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: Student, idx: number) => {
                  const gradeCalc = calculateStudentGrade(student.id);

                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {student.name}
                          </span>
                          <button
                            onClick={() => {
                              setStudentToEdit(student);
                              setIsStudentModalOpen(true);
                            }}
                            className="p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit Data Siswa Ini"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                          NISN: {student.nisn}
                        </span>
                      </td>

                      {/* Interactive editable inputs for each competency */}
                      {competencies.map((c) => {
                        const gradeItem = grades.find(
                          g => g.studentId === student.id && g.competencyCode === c.code
                        );
                        const scoreVal = gradeItem ? gradeItem.score : 75;
                        const isUnderKKTP = scoreVal < activeClass.kktp;

                        return (
                          <td key={c.code} className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              defaultValue={scoreVal}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val) && val !== scoreVal) {
                                  updateGradeScore(student.id, c.code, c.type, val);
                                }
                              }}
                              className={`w-16 py-1 px-2 text-center font-mono tabular-nums font-semibold rounded border text-xs transition-all ${
                                isUnderKKTP
                                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Calculated Final Score */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-sm text-slate-900 dark:text-white">
                        {gradeCalc.finalScore}
                      </td>

                      {/* Predicate */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold text-xs ${
                          gradeCalc.predicate === 'A' ? 'text-emerald-600 dark:text-emerald-400' :
                          gradeCalc.predicate === 'B' ? 'text-blue-600 dark:text-blue-400' :
                          gradeCalc.predicate === 'C' ? 'text-amber-600 dark:text-amber-400' :
                          'text-rose-600 dark:text-rose-400'
                        }`}>
                          {gradeCalc.predicate} ({gradeCalc.predicateLabel.split(' ')[0]})
                        </span>
                      </td>

                      {/* Status KKTP */}
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs font-medium ${
                          gradeCalc.isPassing 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400 font-semibold'
                        }`}>
                          {gradeCalc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Official Report Card Modal Trigger */}
                          <button
                            onClick={() => setSelectedStudentForReport(student)}
                            className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1"
                            title="Buka Lembar Rapor Akademik Resmi Siswa"
                          >
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span>Rapor</span>
                          </button>

                          {/* WhatsApp Parent Notification */}
                          <button
                            onClick={() => setSelectedStudentForWhatsApp(student)}
                            className={`p-1 rounded border transition-colors ${
                              !gradeCalc.isPassing
                                ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Kirim Laporan Nilai ke WhatsApp Orang Tua"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Weighting Info Footnote */}
      <div className="p-3.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Standar Pembobotan Nilai Kurikulum Merdeka Kejuruan (SMK):
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-blue-800 dark:text-blue-300">
            <span>• Asesmen Formatif / Tugas Harian: <strong>20%</strong></span>
            <span>• Praktikum Lab & Bengkel: <strong>30%</strong></span>
            <span>• Proyek Berbasis Masalah (PBL): <strong>30%</strong></span>
            <span>• Asesmen Sumatif Akhir / UTS: <strong>20%</strong></span>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
            Setiap nilai yang diubah pada tabel di atas langsung tersimpan ke local reactive store & Supabase Realtime serta memperbarui kalkulasi rapor secara otomatis.
          </p>
        </div>
      </div>

    </div>
  );
};
