import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  MessageSquare, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const ParentNotificationCenter: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    attendance, 
    notifications, 
    sendParentNotification, 
    calculateStudentGrade,
    generateWhatsAppLink
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentClassStudents[0]?.id || '');
  const [notificationType, setNotificationType] = useState<'Absensi' | 'Tugas' | 'Perkembangan Nilai' | 'Pemberitahuan Khusus'>('Absensi');
  const [customText, setCustomText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastDispatchedUrl, setLastDispatchedUrl] = useState<string | null>(null);

  const selectedStudent = currentClassStudents.find(s => s.id === selectedStudentId) || currentClassStudents[0];

  // Auto-generate template preview text
  const getPreviewText = () => {
    if (!selectedStudent) return '';
    const today = getTodayDateString();

    if (notificationType === 'Absensi') {
      const att = attendance.find(a => a.studentId === selectedStudent.id && a.date === today);
      const status = att?.status || 'Hadir';
      return `*LAPORAN PRESENSI SMKLAMBANAN*\n\nYth. Bapak/Ibu *${selectedStudent.parentName}*,\n\nKami menginformasikan presensi ananda hari ini:\n• Nama: *${selectedStudent.name}*\n• Kelas: *${activeClass.name}*\n• Tanggal: *${today}*\n• Status Kehadiran: *${status}*${att?.note ? ` (${att.note})` : ''}\n\nMohon senantiasa membimbing ananda untuk disiplin hadir di sekolah.\n\nWali Kelas: *${activeClass.homeroomTeacher}*`;
    }

    if (notificationType === 'Perkembangan Nilai') {
      const calc = calculateStudentGrade(selectedStudent.id);
      return `*LAPORAN PERKEMBANGAN AKADEMIK SMKLAMBANAN*\n\nYth. Bapak/Ibu *${selectedStudent.parentName}*,\n\nBerikut ringkasan capaian kompetensi ananda:\n• Nama: *${selectedStudent.name}*\n• Mata Pelajaran: *${activeClass.subjectName}*\n• Nilai Rata-rata: *${calc.finalScore}*\n• Predikat: *${calc.predicate} (${calc.predicateLabel})*\n• Status KKTP (Batas 75): *${calc.status}*\n\n${!calc.isPassing ? '⚠️ Catatan: Ananda memerlukan bimbingan remedial pada hari Kamis di Lab Komputer.' : 'Apresiasi atas kerja keras ananda dan dukungan orang tua di rumah.'}\n\nSalam hormat,\n*${activeClass.homeroomTeacher}*`;
    }

    if (notificationType === 'Tugas') {
      return `*PEMBERITAHUAN TUGAS BELAJAR*\n\nYth. Bapak/Ibu *${selectedStudent.parentName}*,\n\nMohon bantuan mengingatkan ananda *${selectedStudent.name}* untuk menyelesaikan tugas praktik kejuruan yang mendekati batas waktu pengumpulan pada sistem e-learning sekolah.\n\nTerima kasih,\n*${activeClass.homeroomTeacher}*`;
    }

    return customText || `Pemberitahuan khusus dari pihak sekolah untuk wali murid dari ${selectedStudent.name}.`;
  };

  const handleSend = () => {
    if (!selectedStudent) return;
    const msg = customText || getPreviewText();
    const result = sendParentNotification(selectedStudent.id, notificationType, msg, 'WhatsApp');

    if (result.url) {
      setLastDispatchedUrl(result.url);
      window.open(result.url, '_blank');
    }
    setCustomText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action: Send to all Absent Students today
  const handleBroadcastAbsent = () => {
    const today = getTodayDateString();
    const absentStudents = currentClassStudents.filter(st => {
      const rec = attendance.find(a => a.studentId === st.id && a.date === today);
      return rec?.status === 'Alpa' || rec?.status === 'Sakit';
    });

    if (absentStudents.length === 0) {
      alert('Tidak ada siswa yang berstatus Alpa atau Sakit hari ini.');
      return;
    }

    absentStudents.forEach(st => {
      sendParentNotification(st.id, 'Absensi');
    });

    alert(`Berhasil membuat notifikasi presensi untuk ${absentStudents.length} wali murid! Riwayat telah diperbarui.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Pusat Komunikasi Orang Tua</span>
            <span aria-hidden="true">·</span>
            <span>Gateway WhatsApp & Notifikasi Sekolah</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifikasi Orang Tua Siswa
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBroadcastAbsent}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Kirim Laporan Siswa Tidak Hadir Hari Ini
          </button>
        </div>
      </div>

      {/* Main Grid: Send Message Box on Left, Notification Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Dispatch (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Kirim Pesan Notifikasi Baru
            </h2>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Pilih Siswa / Wali Murid:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {currentClassStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} — Wali: {st.parentName} ({st.parentPhone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Kategori Informasi:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Absensi', 'Perkembangan Nilai', 'Tugas', 'Pemberitahuan Khusus'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNotificationType(cat)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded border text-center transition-colors ${
                    notificationType === cat
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Live Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Isi Pesan (Siap Terkirim ke WhatsApp):
              </label>
              <button
                type="button"
                onClick={() => handleCopy('preview', customText || getPreviewText())}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {copiedId === 'preview' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedId === 'preview' ? 'Tersalin' : 'Salin Pesan'}
              </button>
            </div>
            <textarea
              rows={6}
              value={customText || getPreviewText()}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full font-sans text-xs p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp ke Wali Murid</span>
          </button>

          {lastDispatchedUrl && (
            <div className="text-center">
              <a
                href={lastDispatchedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Buka kembali tautan WhatsApp Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Historical Notification Logs (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Riwayat Pengiriman Notifikasi
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Log transparansi komunikasi sekolah dengan orang tua
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {notifications.length} Terkirim
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[550px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada riwayat notifikasi yang terkirim.
              </div>
            ) : (
              notifications.map((log) => (
                <div key={log.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {log.studentName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Wali: {log.parentName}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {new Date(log.sentAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      [{log.category}]
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {log.channel} ({log.parentPhone})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 leading-relaxed whitespace-pre-line">
                    {log.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(log.id, log.message)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === log.id ? 'Tersalin' : 'Salin Pesan'}</span>
                    </button>

                    <a
                      href={generateWhatsAppLink(log.parentPhone, log.message)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Send className="w-3 h-3" />
                      <span>Kirim Ulang ke WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
