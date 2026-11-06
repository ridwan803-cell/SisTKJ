import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { X, User, Phone, Mail, Hash, Shield, Image } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
];

export const StudentModal: React.FC = () => {
  const { 
    isStudentModalOpen, 
    setIsStudentModalOpen, 
    studentToEdit, 
    setStudentToEdit, 
    addStudent, 
    updateStudent, 
    activeClassId, 
    classes 
  } = useApp();

  const isEditing = !!studentToEdit;

  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [classId, setClassId] = useState(activeClassId);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0]);
  const [status, setStatus] = useState<'aktif' | 'mutasi'>('aktif');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setNisn(studentToEdit.nisn);
      setGender(studentToEdit.gender);
      setClassId(studentToEdit.classId);
      setParentName(studentToEdit.parentName);
      setParentPhone(studentToEdit.parentPhone);
      setParentEmail(studentToEdit.parentEmail || '');
      setAvatarUrl(studentToEdit.avatarUrl || AVATAR_PRESETS[0]);
      setStatus(studentToEdit.status);
    } else {
      setName('');
      setNisn(`0068${Math.floor(100000 + Math.random() * 900000)}`);
      setGender('L');
      setClassId(activeClassId);
      setParentName('');
      setParentPhone('');
      setParentEmail('');
      setAvatarUrl(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
      setStatus('aktif');
    }
    setErrors({});
  }, [studentToEdit, activeClassId, isStudentModalOpen]);

  if (!isStudentModalOpen) return null;

  const handleClose = () => {
    setIsStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap siswa wajib diisi.';
    if (!nisn.trim()) newErrors.nisn = 'NISN siswa wajib diisi.';
    else if (!/^\d{10}$/.test(nisn.trim())) newErrors.nisn = 'NISN harus berupa 10 digit angka.';
    if (!parentName.trim()) newErrors.parentName = 'Nama orang tua / wali wajib diisi.';
    if (!parentPhone.trim()) newErrors.parentPhone = 'Nomor WhatsApp wali wajib diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && studentToEdit) {
      updateStudent(studentToEdit.id, {
        name: name.trim(),
        nisn: nisn.trim(),
        gender,
        classId,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        avatarUrl,
        status,
      });
    } else {
      addStudent({
        name: name.trim(),
        nisn: nisn.trim(),
        gender,
        classId,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        avatarUrl,
        status,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Perbarui profil & identitas ${studentToEdit?.name}` : 'Daftarkan peserta didik baru ke sistem kelas'}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Row 1: Nama & NISN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap Siswa: *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizky Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full py-2 px-3 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                NISN (10 Digit): *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="0068921101"
                value={nisn}
                onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full font-mono py-2 px-3 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.nisn ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.nisn && <p className="text-[11px] text-rose-500 mt-0.5">{errors.nisn}</p>}
            </div>
          </div>

          {/* Row 2: Jenis Kelamin, Kelas, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Jenis Kelamin:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Rombel / Kelas:
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status Siswa:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'aktif' | 'mutasi')}
                className="w-full py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="aktif">Aktif</option>
                <option value="mutasi">Mutasi / Pindah</option>
              </select>
            </div>
          </div>

          {/* Section Divider: Data Orang Tua */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Informasi Orang Tua / Wali Murid
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Orang Tua / Wali: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Bambang Sudiro"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className={`w-full py-2 px-3 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.parentName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.parentName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.parentName}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor WhatsApp Wali (Notifikasi): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className={`w-full font-mono py-2 px-3 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.parentPhone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.parentPhone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.parentPhone}</p>}
              </div>
            </div>

            <div className="mt-3">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Orang Tua / Wali (Opsional):
              </label>
              <input
                type="email"
                placeholder="bambang.sudiro@gmail.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section: Avatar Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Pilih Foto Profil Siswa:
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    avatarUrl === url ? 'ring-2 ring-blue-600 ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preset ${i}`}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              {isEditing ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
