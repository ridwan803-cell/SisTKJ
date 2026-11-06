import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { getTodayDateString } from '../data/initialData';
import { 
  CheckCircle2, 
  Calendar, 
  Send, 
  Download,
  AlertCircle,
  Edit3
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { 
    activeClass, 
    currentClassStudents, 
    attendance, 
    setStudentAttendance, 
    markAllPresent, 
    getDailyAttendanceStats,
    setSelectedStudentForWhatsApp,
    supabaseConfig,
    setStudentToEdit,
    setIsStudentModalOpen
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stats = getDailyAttendanceStats(selectedDate);

  // Filter students based on status and search query
  const filteredStudents = currentClassStudents.filter(student => {
    const studentRecord = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
    const status = studentRecord ? studentRecord.status : 'Hadir';

    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.nisn.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Tanggal', 'Status', 'Catatan', 'Waktu Tercatat'];
    const rows = currentClassStudents.map((st, idx) => {
      const rec = attendance.find(a => a.studentId === st.id && a.date === selectedDate);
      return [
        idx + 1,
        st.nisn,
        `"${st.name}"`,
        activeClass.name,
        selectedDate,
        rec ? rec.status : 'Hadir',
        `"${rec?.note || ''}"`,
        rec?.timeRecorded || '07:00'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Absensi_${activeClass.name}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Breadcrumb Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{activeClass.name}</span>
            <span aria-hidden="true">·</span>
            <span>{activeClass.major}</span>
            <span aria-hidden="true">·</span>
            <span>Wali Kelas: {activeClass.homeroomTeacher}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Absensi Presensi Real-Time
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              aria-label="Tanggal Presensi"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
            />
          </div>

          <button
            onClick={() => markAllPresent(selectedDate)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tandai Semua Hadir
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Real-time Indicator banner */}
      <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Mode Sinkronisasi:</span>
          <span>{supabaseConfig.isConnected ? 'Supabase Realtime Cloud (Postgres changes)' : 'Multi-Tab Broadcast Channel (Lokal Aktif)'}</span>
        </div>
        <span className="font-mono tabular-nums text-slate-500">
          Update otomatis setiap perubahan
        </span>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Siswa</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.total}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">Hadir</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.hadir}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-amber-600 dark:text-amber-400 block mb-1">Sakit</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {stats.sakit}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">Izin</span>
          <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {stats.izin}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-rose-600 dark:text-rose-400 block mb-1">Alpa / Tanpa Keterangan</span>
          <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {stats.alpa}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tingkat Kehadiran</span>
          <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {stats.rate}%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        
        {/* Interactive Segmented Filter Controls */}
        <div className="flex flex-wrap items-center gap-1">
          {['all', 'Hadir', 'Sakit', 'Izin', 'Alpa'].map((status) => {
            const label = status === 'all' ? 'Semua Siswa' : status;
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold">Profil Siswa</th>
                <th className="py-3 px-4 font-semibold">Status Kehadiran</th>
                <th className="py-3 px-4 font-semibold">Waktu Presensi</th>
                <th className="py-3 px-4 font-semibold">Keterangan / Alasan</th>
                <th className="py-3 px-4 font-semibold text-right">Notifikasi Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const record = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                  const currentStatus = record ? record.status : 'Hadir';
                  const isAlpaOrSakit = currentStatus === 'Alpa' || currentStatus === 'Sakit';

                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono tabular-nums">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              // Fallback if image fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
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
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-mono tabular-nums">NISN: {student.nisn}</span>
                              <span aria-hidden="true">·</span>
                              <span>Wali: {student.parentName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Attendance Buttons */}
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 gap-1">
                          {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map((st) => {
                            const isSelected = currentStatus === st;
                            let activeClass = 'bg-slate-900 text-white';
                            if (st === 'Hadir') activeClass = 'bg-emerald-600 text-white';
                            if (st === 'Sakit') activeClass = 'bg-amber-600 text-white';
                            if (st === 'Izin') activeClass = 'bg-blue-600 text-white';
                            if (st === 'Alpa') activeClass = 'bg-rose-600 text-white';

                            return (
                              <button
                                key={st}
                                onClick={() => setStudentAttendance(student.id, selectedDate, st)}
                                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                                  isSelected
                                    ? activeClass + ' shadow-xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Time Recorded */}
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {record?.timeRecorded || '07:00'} WIB
                      </td>

                      {/* Note / Remarks */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          defaultValue={record?.note || ''}
                          placeholder="Tambahkan catatan khusus..."
                          onBlur={(e) => {
                            if (e.target.value !== (record?.note || '')) {
                              setStudentAttendance(student.id, selectedDate, currentStatus, e.target.value);
                            }
                          }}
                          className="w-full text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                        />
                      </td>

                      {/* Notification Trigger to Parent */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentForWhatsApp(student)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            isAlpaOrSakit
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                          }`}
                          title={`Kirim pemberitahuan presensi ke ${student.parentName}`}
                        >
                          <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Kirim WA Ortu</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful Guidance Notice */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          Data presensi tersimpan otomatis dan disinkronkan ke seluruh perangkat guru, siswa, serta wali murid. 
          Klik tombol <strong>Kirim WA Ortu</strong> untuk otomatis membuka pesan WhatsApp terformat lengkap dengan nama siswa dan status presensi terkini.
        </p>
      </div>

    </div>
  );
};
