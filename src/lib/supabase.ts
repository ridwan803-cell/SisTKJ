import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage or Vite environment variables
export const getSupabaseConfig = () => {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('edusmk_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('edusmk_supabase_key') : null;

  const url = storedUrl || (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const anonKey = storedKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return { url, anonKey };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('edusmk_supabase_url', url.trim());
    localStorage.setItem('edusmk_supabase_key', anonKey.trim());
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return supabaseInstance;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !key) {
    return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
  }
  if (!url.startsWith('https://')) {
    return { success: false, message: 'URL Supabase harus dimulai dengan https://' };
  }

  try {
    const testClient = createClient(url, key);
    // Simple ping to check if Supabase REST endpoint responds
    const { error } = await testClient.from('classes').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "classes" does not exist')) {
      return { success: false, message: `Koneksi gagal: ${error.message}` };
    }
    return { 
      success: true, 
      message: 'Koneksi ke Supabase berhasil! Database siap digunakan untuk sinkronisasi real-time.' 
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Error koneksi: ${errorMsg}` };
  }
};

// SQL Schema Generator for Supabase SQL Editor
export const generateSupabaseSchemaSql = (): string => {
  return `-- ===================================================
-- SMKLAMBANAN - Database Schema & Security Rules
-- Silakan salin & jalankan script ini di Supabase SQL Editor
-- ===================================================

-- 1. Tabel Kelas
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    major TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL DEFAULT 'Ganjil',
    homeroom_teacher TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    kktp NUMERIC NOT NULL DEFAULT 75,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Siswa
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    nisn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Presensi / Absensi Real-time
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpa')) NOT NULL,
    note TEXT,
    time_recorded VARCHAR(10) NOT NULL,
    recorded_by TEXT NOT NULL,
    synced_with_parent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Nilai & Capaian Pembelajaran
CREATE TABLE IF NOT EXISTS public.grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    competency_code TEXT NOT NULL,
    score NUMERIC NOT NULL,
    max_score NUMERIC DEFAULT 100,
    date_recorded DATE NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Tugas Harian
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    competency TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('praktik', 'teori', 'proyek')) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    total_submissions INTEGER DEFAULT 0,
    rubric JSONB DEFAULT '[]'::jsonb,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Pengumpulan Tugas (Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'Diserahkan',
    repo_url TEXT,
    file_url TEXT,
    student_notes TEXT,
    score NUMERIC,
    teacher_feedback TEXT
);

-- 7. Tabel Materi Pembelajaran
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_size TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel Log Notifikasi Orang Tua
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Terkirim',
    channel TEXT DEFAULT 'WhatsApp',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Supabase Realtime untuk tabel attendance dan grades
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.grades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Buat Policy Akses Terbuka untuk Lingkungan Sekolah & Dashboard Terintegrasi
CREATE POLICY "Public Read Classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public All Attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Public All Grades" ON public.grades FOR ALL USING (true);
CREATE POLICY "Public All Assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Public All Submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Public Read Materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Public All Notifications" ON public.notifications FOR ALL USING (true);
`;
};
