import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteStudentModal: React.FC = () => {
  const { 
    studentToDelete, 
    setStudentToDelete, 
    deleteStudent, 
    activeClass 
  } = useApp();

  if (!studentToDelete) return null;

  const handleConfirmDelete = () => {
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        
        {/* Header Warning */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Konfirmasi Hapus Data Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tindakan ini akan menghapus data siswa secara permanen dari sistem kelas dan database real-time.
            </p>
          </div>
          <button
            onClick={() => setStudentToDelete(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Target Summary Box */}
        <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              {studentToDelete.name}
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              NISN: {studentToDelete.nisn}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Kelas: {activeClass.name} · Wali: {studentToDelete.parentName} ({studentToDelete.parentPhone})
          </div>
          <div className="pt-1 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
            ⚠️ Seluruh data absensi presensi, rekap nilai asesmen, dan tugas siswa ini akan ikut dibersihkan.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setStudentToDelete(null)}
            className="px-4 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus Data Siswa</span>
          </button>
        </div>

      </div>
    </div>
  );
};
