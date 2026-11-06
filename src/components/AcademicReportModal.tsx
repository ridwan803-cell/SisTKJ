import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const AcademicReportModal: React.FC = () => {
  const { 
    selectedStudentForReport, 
    setSelectedStudentForReport, 
    activeClass, 
    grades, 
    calculateStudentGrade,
    getStudentAttendanceStats
  } = useApp();

  if (!selectedStudentForReport) return null;

  const student = selectedStudentForReport;
  const gradeCalc = calculateStudentGrade(student.id);
  const attStats = getStudentAttendanceStats(student.id);
  const studentGrades = grades.filter(g => g.studentId === student.id);

  // Generate automated narrative description
  const generateNarrative = () => {
    if (gradeCalc.finalScore >= 90) {
      return `Ananda ${student.name} menunjukkan penguasaan yang sangat istimewa pada seluruh capaian pembelajaran kejuruan, khususnya dalam perancangan database relasional, rekayasa logika pemrograman, dan arsitektur web modern. Sangat direkomendasikan untuk mewakili sekolah pada Lomba Kompetensi Siswa (LKS) dan penempatan magang industri prioritas.`;
    }
    if (gradeCalc.finalScore >= 80) {
      return `Ananda ${student.name} telah mencapai kompetensi kejuruan dengan predikat Kompeten. Menunjukkan etos kerja bengkel/lab yang disiplin, mampu menyelesaikan jobsheet tepat waktu, dan memiliki pemahaman solid pada implementasi antarmuka web. Perlu konsistensi dalam pendokumentasian kode program.`;
    }
    if (gradeCalc.finalScore >= activeClass.kktp) {
      return `Ananda ${student.name} telah mencapai batas kriteria ketuntasan (KKTP). Mampu mengikuti alur praktikum dasar dengan baik. Disarankan untuk lebih aktif berlatih secara mandiri pada materi algoritma dan relasi basis data agar kesiapan uji sertifikasi kejuruan semakin matang.`;
    }
    return `Ananda ${student.name} belum mencapai ketuntasan kriteria minimal (KKTP: ${activeClass.kktp}). Memerlukan program remedial terstruktur dan pendampingan intensif dari guru pembimbing serta perhatian belajar tambahan dari orang tua di rumah.`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl print:max-w-none print:w-full print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        
        {/* Floating Modal Control Bar (Hidden during Print) */}
        <div className="no-print sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Preview Dokumen E-Rapor Resmi SMK
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={() => setSelectedStudentForReport(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-12 space-y-6 bg-white text-slate-900 font-sans print:p-4">
          
          {/* Kop Surat Resmi Sekolah */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="text-[11px] font-bold tracking-widest text-slate-700 uppercase">
              PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
            </div>
            <div className="text-xs font-bold tracking-wider text-slate-800 uppercase">
              DINAS PENDIDIKAN DAN KEBUDAYAAN REPUBLIK INDONESIA
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
              SMK LAMBANAN
            </h1>
            <p className="text-[11px] text-slate-600">
              Jalan Pendidikan Kejuruan Lambanan No. 10 · Website: smklambanan.sch.id · Email: info@smklambanan.sch.id
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center py-1">
            <h2 className="text-base font-bold uppercase tracking-wider underline">
              LAPORAN CAPAIAN HASIL BELAJAR SISWA (E-RAPOR SMK)
            </h2>
            <span className="text-xs text-slate-600">
              Tahun Ajaran {activeClass.academicYear} · Semester {activeClass.semester}
            </span>
          </div>

          {/* Student Identity Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-600">Nama Peserta Didik</span>
                <span className="font-bold">: {student.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600">Nomor Induk Siswa (NISN)</span>
                <span className="font-mono">: {student.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600">Program Keahlian</span>
                <span className="font-semibold">: {activeClass.major}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-600">Kelas / Rombel</span>
                <span className="font-bold">: {activeClass.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600">Mata Pelajaran</span>
                <span className="font-semibold">: {activeClass.subjectName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-600">Nama Orang Tua / Wali</span>
                <span>: {student.parentName}</span>
              </div>
            </div>
          </div>

          {/* Assessment Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              A. Capaian Pembelajaran & Penilaian Kompetensi Kejuruan
            </h3>

            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2">Tujuan / Capaian Pembelajaran (TP)</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Tipe Asesmen</th>
                  <th className="border border-slate-300 p-2 text-center w-16">KKTP</th>
                  <th className="border border-slate-300 p-2 text-center w-16">Nilai</th>
                  <th className="border border-slate-300 p-2 text-center w-20">Ketercapaian</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((g, idx) => (
                  <tr key={g.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">{g.competencyCode}</td>
                    <td className="border border-slate-300 p-2 text-center capitalize">{g.assessmentType.replace('_', ' ')}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{activeClass.kktp}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold">{g.score}</td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className={`font-semibold ${g.score >= activeClass.kktp ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {g.score >= activeClass.kktp ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Summary Row */}
                <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-400">
                  <td colSpan={4} className="border border-slate-300 p-2.5 text-right uppercase">
                    Nilai Akhir Rapor & Predikat Kelulusan:
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono text-sm text-blue-700 font-black">
                    {gradeCalc.finalScore}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-xs">
                    {gradeCalc.predicate} ({gradeCalc.predicateLabel})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Narrative Feedback Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              B. Deskripsi Capaian Kompetensi & Evaluasi Guru
            </h3>
            <div className="p-3.5 rounded border border-slate-300 bg-slate-50 text-xs leading-relaxed text-slate-800">
              {generateNarrative()}
            </div>
          </div>

          {/* Industry Work Ethic & Character */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              C. Budaya Kerja Industri & Sikap Kerja (Standar 5R)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-slate-200">
                <span className="font-semibold block mb-1">Kedisiplinan & Keselamatan Kerja (K3):</span>
                <span className="text-slate-600">Sangat Baik (Mematuhi SOP Lab dan jadwal piket bengkel).</span>
              </div>
              <div className="p-3 rounded border border-slate-200">
                <span className="font-semibold block mb-1">Kerja Sama Tim & Komunikasi Proyek:</span>
                <span className="text-slate-600">Aktif berkontribusi dan responsif dalam diskusi kelompok.</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              D. Catatan Kehadiran (Presensi)
            </h3>
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div className="p-2 border border-slate-300 rounded">
                <span className="text-slate-500 block text-[11px]">Hadir</span>
                <span className="font-bold font-mono text-sm">{attStats.hadir} Hari</span>
              </div>
              <div className="p-2 border border-slate-300 rounded">
                <span className="text-slate-500 block text-[11px]">Sakit</span>
                <span className="font-bold font-mono text-sm">{attStats.sakit} Hari</span>
              </div>
              <div className="p-2 border border-slate-300 rounded">
                <span className="text-slate-500 block text-[11px]">Izin</span>
                <span className="font-bold font-mono text-sm">{attStats.izin} Hari</span>
              </div>
              <div className="p-2 border border-slate-300 rounded">
                <span className="text-slate-500 block text-[11px]">Tanpa Keterangan (Alpa)</span>
                <span className="font-bold font-mono text-sm">{attStats.alpa} Hari</span>
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-xs text-center border-t border-slate-200">
            <div>
              <p className="text-slate-500 mb-16">Mengetahui,<br />Orang Tua / Wali Siswa</p>
              <p className="font-bold underline uppercase">{student.parentName}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-16">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Guru Mata Pelajaran / Wali Kelas</p>
              <p className="font-bold underline uppercase">{activeClass.homeroomTeacher}</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 198504122010011008</p>
            </div>

            <div>
              <p className="text-slate-500 mb-16">Mengetahui,<br />Kepala SMK Lambanan</p>
              <p className="font-bold underline uppercase">Dr. H. Sulaiman, M.Pd.</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 197208151998021002</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
