import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const WhatsAppPreviewModal: React.FC = () => {
  const { 
    selectedStudentForWhatsApp, 
    setSelectedStudentForWhatsApp, 
    activeClass, 
    attendance, 
    sendParentNotification, 
    calculateStudentGrade,
    generateWhatsAppLink 
  } = useApp();

  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!selectedStudentForWhatsApp) return null;

  const student = selectedStudentForWhatsApp;
  const today = getTodayDateString();
  const att = attendance.find(a => a.studentId === student.id && a.date === today);
  const status = att ? att.status : 'Hadir';
  const gradeCalc = calculateStudentGrade(student.id);

  const defaultMessage = `*PEMBERITAHUAN KEHADIRAN & AKADEMIK SMKLAMBANAN*\n\nYth. Bapak/Ibu *${student.parentName}*,\n\nKami menginformasikan perkembangan ananda di sekolah hari ini (${today}):\n• Nama: *${student.name}*\n• Kelas: *${activeClass.name}*\n• Status Presensi: *${status}*${att?.note ? ` (${att.note})` : ''}\n• Nilai Rata-rata Mapel: *${gradeCalc.finalScore}* (Predikat ${gradeCalc.predicate})\n• Status KKTP: *${gradeCalc.status}*\n\n${status === 'Alpa' ? '⚠️ Mohon konfirmasi kehadiran ananda kepada wali kelas secepatnya.' : 'Terima kasih atas kerja sama dan perhatian Bapak/Ibu dalam mendukung proses belajar ananda.'}\n\nSalam hormat,\n*${activeClass.homeroomTeacher}*\nWali Kelas ${activeClass.name}\nSMK Lambanan`;

  const finalMessage = customText || defaultMessage;
  const waUrl = generateWhatsAppLink(student.parentPhone, finalMessage);

  const handleSend = () => {
    sendParentNotification(student.id, 'Absensi', finalMessage, 'WhatsApp');
    window.open(waUrl, '_blank');
    setSelectedStudentForWhatsApp(null);
    setCustomText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kirim Pesan WhatsApp ke Wali Murid
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Wali: {student.parentName} ({student.parentPhone})
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedStudentForWhatsApp(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Format Pesan WhatsApp (Bisa diedit):
            </label>
            <button
              onClick={handleCopy}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={finalMessage}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full text-xs font-sans p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Destination preview */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span>Tujuan: <strong>{student.parentName}</strong></span>
          <span className="font-mono tabular-nums">{student.parentPhone}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setSelectedStudentForWhatsApp(null)}
            className="px-3.5 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp Web</span>
          </button>
        </div>

      </div>
    </div>
  );
};
