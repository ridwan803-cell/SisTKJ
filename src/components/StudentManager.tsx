import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  Send, 
  Users, 
  UserCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const StudentManager: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    setIsStudentModalOpen, 
    setStudentToEdit, 
    setStudentToDelete,
    setSelectedStudentForReport,
    setSelectedStudentForWhatsApp,
    generateWhatsAppLink
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'L' | 'P'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'aktif' | 'mutasi'>('all');

  // Filter logic
  const filteredStudents = currentClassStudents.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.nisn.includes(searchQuery) ||
                          st.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'all' || st.gender === filterGender;
    const matchesStatus = filterStatus === 'all' || st.status === filterStatus;

    return matchesSearch && matchesGender && matchesStatus;
  });

  // KPI calculations
  const total = currentClassStudents.length;
  const lakiLaki = currentClassStudents.filter(s => s.gender === 'L').length;
  const perempuan = currentClassStudents.filter(s => s.gender === 'P').length;
  const aktif = currentClassStudents.filter(s => s.status === 'aktif').length;

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleOpenDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Manajemen Rombel</span>
            <span aria-hidden="true">·</span>
            <span>{activeClass.name} ({activeClass.major})</span>
            <span aria-hidden="true">·</span>
            <span>Wali Kelas: {activeClass.homeroomTeacher}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kelola Data Siswa & Peserta Didik
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Siswa Kelas</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {total}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Terdaftar di sistem</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">Siswa Laki-Laki</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {lakiLaki}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{total ? Math.round((lakiLaki / total) * 100) : 0}% dari rombel</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-purple-600 dark:text-purple-400 block mb-1">Siswa Perempuan</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
            {perempuan}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{total ? Math.round((perempuan / total) * 100) : 0}% dari rombel</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">Status Aktif Belajar</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {aktif}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Siap mengikuti KBM</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        
        {/* Gender and Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterGender('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterGender === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Gender
          </button>
          <button
            onClick={() => setFilterGender('L')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterGender === 'L'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Laki-laki
          </button>
          <button
            onClick={() => setFilterGender('P')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterGender === 'P'
                ? 'bg-purple-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Perempuan
          </button>

          <span className="text-slate-300 dark:text-slate-700 px-1">|</span>

          <button
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'aktif' : filterStatus === 'aktif' ? 'mutasi' : 'all')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Status: {filterStatus === 'all' ? 'Semua' : filterStatus === 'aktif' ? 'Aktif' : 'Mutasi'}
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama, NISN, atau nama wali..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th className="py-3 px-3 font-semibold w-10 text-center">No</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Data Peserta Didik</th>
                <th className="py-3 px-3 font-semibold text-center w-16">L/P</th>
                <th className="py-3 px-4 font-semibold min-w-[180px]">Orang Tua / Wali</th>
                <th className="py-3 px-3 font-semibold min-w-[130px]">Kontak WhatsApp</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Status</th>
                <th className="py-3 px-4 font-semibold text-right min-w-[160px]">Menu Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr 
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono tabular-nums">
                      {idx + 1}
                    </td>

                    {/* Avatar & Name & NISN */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block text-xs">
                            {student.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            NISN: {student.nisn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-mono font-bold text-xs ${
                        student.gender === 'L' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {student.gender}
                      </span>
                    </td>

                    {/* Parent Info */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {student.parentName}
                      </span>
                      {student.parentEmail && (
                        <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                          {student.parentEmail}
                        </span>
                      )}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <a
                        href={generateWhatsAppLink(student.parentPhone, `Halo Bapak/Ibu ${student.parentName}, wali murid dari ${student.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                        title="Buka percakapan WhatsApp langsung"
                      >
                        <span>{student.parentPhone}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[11px] font-semibold capitalize ${
                        student.status === 'aktif' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Menu Edit & Hapus Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Tombol Edit Siswa */}
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Edit Data Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Edit</span>
                        </button>

                        {/* Tombol Hapus Siswa */}
                        <button
                          onClick={() => handleOpenDelete(student)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Hapus Data Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Hapus</span>
                        </button>

                        {/* Rapor Quick Link */}
                        <button
                          onClick={() => setSelectedStudentForReport(student)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Lihat Rapor Akademik Siswa"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Quick Link */}
                        <button
                          onClick={() => setSelectedStudentForWhatsApp(student)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600"
                          title="Kirim Notifikasi WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informative Guidance */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          Data siswa yang ditambahkan, diedit, atau dihapus akan langsung tersinkronisasi ke seluruh tabel 
          (Buku Nilai, Presensi Absensi Harian, dan Tugas Praktikum) secara real-time serta disimpan ke database Supabase Cloud.
        </p>
      </div>

    </div>
  );
};
