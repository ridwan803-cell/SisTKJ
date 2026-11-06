import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Check
} from 'lucide-react';

export const AssignmentManager: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    assignments, 
    submissions, 
    createAssignment, 
    gradeSubmission,
    currentRole,
    activeStudent,
    submitAssignment
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );

  // New assignment form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCompetency, setNewCompetency] = useState('TP 2: Implementasi State & Reactive UI');
  const [newType, setNewType] = useState<'praktik' | 'teori' | 'proyek'>('praktik');
  const [newDeadline, setNewDeadline] = useState('2026-11-15T23:59');

  // Student submission form state (for role === 'siswa')
  const [submissionRepo, setSubmissionRepo] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Active assignment
  const currentAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];

  // Submissions for current assignment
  const currentSubmissions = submissions.filter(s => s.assignmentId === currentAssignment?.id);

  // Student's own submission
  const mySubmission = submissions.find(
    s => s.assignmentId === currentAssignment?.id && s.studentId === activeStudent.id
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createAssignment({
      classId: activeClass.id,
      title: newTitle,
      description: newDesc,
      competency: newCompetency,
      type: newType,
      deadline: new Date(newDeadline).toISOString(),
      rubric: [
        { criteria: 'Ketepatan Logika & Fungsi', weight: 40 },
        { criteria: 'Kerapian Kode & Standar Industri', weight: 30 },
        { criteria: 'Dokumentasi & Testing Mandiri', weight: 30 },
      ],
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssignment) return;

    submitAssignment(currentAssignment.id, activeStudent.id, {
      repoUrl: submissionRepo,
      fileUrl: submissionFile,
      notes: submissionNotes,
    });

    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{activeClass.name}</span>
            <span aria-hidden="true">·</span>
            <span>{activeClass.subjectName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pengelolaan Tugas Harian & Jobsheet Praktikum
          </h1>
        </div>

        {currentRole === 'guru' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Tugas Baru
          </button>
        )}
      </div>

      {/* Main Split Layout: Assignment List on Left, Detail & Submissions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Assignment Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Daftar Tugas ({assignments.length})
            </span>
          </div>

          <div className="space-y-2">
            {assignments.map((asg) => {
              const isSelected = asg.id === currentAssignment?.id;
              const subCount = submissions.filter(s => s.assignmentId === asg.id).length;
              const isDeadlinePassed = new Date(asg.deadline) < new Date();

              return (
                <div
                  key={asg.id}
                  onClick={() => setSelectedAssignmentId(asg.id)}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      Tipe: {asg.type}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {subCount}/{currentClassStudents.length} Terkumpul
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {asg.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-mono tabular-nums text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(asg.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>

                    {isDeadlinePassed ? (
                      <span className="text-[11px] text-rose-500 font-medium">Batas Terlewat</span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Aktif</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Assignment Detail & Submissions (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {currentAssignment ? (
            <>
              {/* Assignment Overview Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mb-0.5">
                      {currentAssignment.competency}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {currentAssignment.title}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums shrink-0">
                    Batas Akhir: {new Date(currentAssignment.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {currentAssignment.description}
                </p>

                {/* Rubric Matrix */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Rubrik Penilaian Kompetensi:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentAssignment.rubric.map((r, i) => (
                      <div key={i} className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{r.criteria}</span>
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                          {r.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Siswa View: Submission Box */}
              {currentRole === 'siswa' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Kumpulkan Tugas ({activeStudent.name})
                  </h3>

                  {submissionSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Tugas berhasil dikumpulkan ke sistem! Guru dapat langsung memeriksa dan memberikan feedback.
                    </div>
                  )}

                  {mySubmission && mySubmission.status === 'Dinilai' ? (
                    <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Status: Telah Dinilai oleh Guru
                        </span>
                        <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          Nilai: {mySubmission.score} / 100
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic">
                        Feedback Guru: &quot;{mySubmission.teacherFeedback || 'Kerja bagus!'}&quot;
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleStudentSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                          Tautan Repositori GitHub / Gitlab:
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/username/project-smk"
                          value={submissionRepo}
                          onChange={(e) => setSubmissionRepo(e.target.value)}
                          className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                          Tautan Demo Live Vercel / Google Drive:
                        </label>
                        <input
                          type="url"
                          placeholder="https://nama-aplikasi.vercel.app"
                          value={submissionFile}
                          onChange={(e) => setSubmissionFile(e.target.value)}
                          className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                          Catatan Praktikum & Refleksi Mandiri:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ceritakan kendala atau pencapaian saat menyelesaikan jobsheet ini..."
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        {mySubmission ? 'Perbarui Pengumpulan Tugas' : 'Kirim Tugas Sekarang'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Guru / Admin View: Submissions Review Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Pengumpulan Siswa ({currentSubmissions.length}/{currentClassStudents.length})
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    Kelas: {activeClass.name}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentClassStudents.map((st) => {
                    const sub = currentSubmissions.find(s => s.studentId === st.id);
                    const isSubmitted = !!sub;

                    return (
                      <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isSubmitted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                              NISN: {st.nisn} · {isSubmitted ? `Terkumpul ${new Date(sub.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : 'Belum mengumpulkan'}
                            </span>
                            {sub?.studentNotes && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                                &quot;{sub.studentNotes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Grading Action */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {sub?.repoUrl && (
                            <a
                              href={sub.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Repo
                            </a>
                          )}

                          {currentRole === 'guru' ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="Nilai"
                                defaultValue={sub?.score || ''}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (!isNaN(val) && val > 0 && sub) {
                                    gradeSubmission(sub.id, val, sub.teacherFeedback || 'Tugas telah dinilai.');
                                  }
                                }}
                                className="w-14 py-1 px-1.5 text-center font-mono font-semibold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Beri feedback..."
                                defaultValue={sub?.teacherFeedback || ''}
                                onBlur={(e) => {
                                  if (sub && e.target.value !== sub.teacherFeedback) {
                                    gradeSubmission(sub.id, sub.score || 80, e.target.value);
                                  }
                                }}
                                className="w-32 sm:w-44 py-1 px-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                              />
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {sub?.score ? `${sub.score} / 100` : 'Menunggu Nilai'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Pilih tugas dari daftar di sebelah kiri untuk melihat rincian pengumpulan.
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Buat Tugas Harian / Praktikum Baru
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Tugas:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktikum 05: Autentikasi Pengguna & Token JWT"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Capaian Pembelajaran (TP):
                </label>
                <select
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="TP 1: Konfigurasi Database Real-time & API">TP 1: Konfigurasi Database Real-time & API</option>
                  <option value="TP 2: Implementasi State & Reactive UI">TP 2: Implementasi State & Reactive UI</option>
                  <option value="TP 3: Proyek Aplikasi Fullstack Terintegrasi">TP 3: Proyek Aplikasi Fullstack Terintegrasi</option>
                  <option value="TP 4: Pengujian & Optimasi Standar Industri">TP 4: Pengujian & Optimasi Standar Industri</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Tipe Tugas:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'praktik' | 'teori' | 'proyek')}
                    className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="praktik">Praktikum Lab</option>
                    <option value="proyek">Proyek PBL</option>
                    <option value="teori">Teori / Refleksi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Batas Waktu (Deadline):
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi & Instruksi Pengerjaan:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan petunjuk pengerjaan langkah-demi-langkah..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
