export type UserRole = 'guru' | 'siswa' | 'orang_tua';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarUrl: string;
  status: 'aktif' | 'mutasi';
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "XII RPL 1"
  major: string; // e.g. "Rekayasa Perangkat Lunak"
  academicYear: string; // e.g. "2026/2027"
  semester: 'Ganjil' | 'Genap';
  homeroomTeacher: string;
  subjectName: string; // e.g. "Pemrograman Web & Perangkat Bergerak"
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default: 75)
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  timeRecorded: string;
  recordedBy: string;
  syncedWithParent?: boolean;
}

export type AssessmentType = 
  | 'formatif_tugas'
  | 'formatif_kuis'
  | 'praktik_lab'
  | 'proyek_pbl'
  | 'uts_tengah_semester'
  | 'ukk_akhir_semester';

export interface GradeItem {
  id: string;
  studentId: string;
  classId: string;
  assessmentType: AssessmentType;
  competencyCode: string; // e.g. "TP 1: Konfigurasi Database Real-time"
  score: number;
  maxScore: number;
  dateRecorded: string;
  feedback?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  competency: string;
  type: 'praktik' | 'teori' | 'proyek';
  deadline: string;
  totalSubmissions: number;
  rubric: Array<{ criteria: string; weight: number }>;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: 'Diserahkan' | 'Dinilai' | 'Terlambat' | 'Belum';
  repoUrl?: string;
  fileUrl?: string;
  studentNotes?: string;
  score?: number;
  teacherFeedback?: string;
}

export interface Material {
  id: string;
  classId: string;
  title: string;
  category: 'Modul Ajar' | 'Jobsheet Praktikum' | 'Video Tutorial' | 'Presentasi Slides';
  format: 'PDF' | 'DOCX' | 'MP4' | 'ZIP';
  fileSize: string;
  uploadedAt: string;
  downloadCount: number;
  url: string;
  description: string;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  category: 'Absensi' | 'Tugas' | 'Perkembangan Nilai' | 'Pemberitahuan Khusus';
  message: string;
  sentAt: string;
  status: 'Terkirim' | 'Gagal' | 'Pending';
  channel: 'WhatsApp' | 'Email';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  tableCount: number;
  lastSyncTime?: string;
}

export interface TeachingEvaluationMetric {
  methodName: string; // e.g. "Project-Based Learning (PBL)", "Praktikum Laboratorium", "Ceramah Terarah"
  avgScore: number;
  engagementScore: number; // 0-100
  passRate: number; // percentage
  competenciesApplied: number;
  pros: string;
  recommendation: string;
}
