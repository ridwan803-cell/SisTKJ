import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserRole, 
  Student, 
  ClassRoom, 
  AttendanceRecord, 
  AttendanceStatus, 
  GradeItem, 
  AssessmentType, 
  Assignment, 
  Submission, 
  Material, 
  NotificationLog, 
  TeachingEvaluationMetric,
  SupabaseConfig 
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_GRADES, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_MATERIALS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TEACHING_METRICS,
  getTodayDateString 
} from '../data/initialData';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection, getSupabaseClient } from '../lib/supabase';

interface AppContextType {
  // Role & Context
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  activeClass: ClassRoom;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: Student;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;

  // Data Collections
  classes: ClassRoom[];
  students: Student[];
  currentClassStudents: Student[];
  attendance: AttendanceRecord[];
  grades: GradeItem[];
  assignments: Assignment[];
  submissions: Submission[];
  materials: Material[];
  notifications: NotificationLog[];
  teachingMetrics: TeachingEvaluationMetric[];

  // Attendance Actions
  setStudentAttendance: (studentId: string, date: string, status: AttendanceStatus, note?: string) => void;
  markAllPresent: (date: string) => void;
  getDailyAttendanceStats: (date: string) => { hadir: number; sakit: number; izin: number; alpa: number; total: number; rate: number };
  getStudentAttendanceStats: (studentId: string) => { hadir: number; sakit: number; izin: number; alpa: number; total: number; percentage: number };

  // Grade Actions
  updateGradeScore: (studentId: string, competencyCode: string, assessmentType: AssessmentType, score: number, feedback?: string) => void;
  calculateStudentGrade: (studentId: string) => {
    finalScore: number;
    predicate: 'A' | 'B' | 'C' | 'D';
    predicateLabel: string;
    isPassing: boolean;
    formatifAvg: number;
    praktikAvg: number;
    proyekAvg: number;
    utsScore: number;
    status: 'Tuntas' | 'Perlu Remedial';
  };

  // Assignment Actions
  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt' | 'totalSubmissions'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, submissionData: { repoUrl?: string; fileUrl?: string; notes?: string }) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Material Actions
  addMaterial: (data: Omit<Material, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  incrementDownload: (materialId: string) => void;

  // Notification Actions
  sendParentNotification: (studentId: string, category: NotificationLog['category'], customMessage?: string, channel?: 'WhatsApp' | 'Email') => { success: boolean; url?: string };
  generateWhatsAppLink: (phone: string, text: string) => string;

  // Student Management Actions
  addStudent: (data: Omit<Student, 'id'>) => Student;
  updateStudent: (studentId: string, data: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  studentToEdit: Student | null;
  setStudentToEdit: (student: Student | null) => void;
  isStudentModalOpen: boolean;
  setIsStudentModalOpen: (open: boolean) => void;
  studentToDelete: Student | null;
  setStudentToDelete: (student: Student | null) => void;

  // Supabase & Realtime
  supabaseConfig: SupabaseConfig;
  updateSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;

  // Modal Triggers
  selectedStudentForReport: Student | null;
  setSelectedStudentForReport: (student: Student | null) => void;
  selectedStudentForWhatsApp: Student | null;
  setSelectedStudentForWhatsApp: (student: Student | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'edusmk_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edusmk_theme');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edusmk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edusmk_theme', 'light');
    }
  }, [isDarkMode]);

  // Role & Navigation
  const [currentRole, setCurrentRole] = useState<UserRole>('guru');
  const [activeClassId, setActiveClassId] = useState<string>('cls_rpl1');
  const [activeStudentId, setActiveStudentId] = useState<string>('std_01');

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [selectedStudentForWhatsApp, setSelectedStudentForWhatsApp] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Supabase State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const { url, anonKey } = getSupabaseConfig();
    return {
      url,
      anonKey,
      isConnected: false,
      tableCount: 8,
      lastSyncTime: new Date().toLocaleTimeString('id-ID'),
    };
  });

  // State from LocalStorage or Initial Mock Data
  const [classes] = useState<ClassRoom[]>(INITIAL_CLASSES);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [grades, setGrades] = useState<GradeItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [teachingMetrics] = useState<TeachingEvaluationMetric[]>(INITIAL_TEACHING_METRICS);

  // BroadcastChannel for cross-tab real-time synchronization
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const channel = new BroadcastChannel('edusmk_realtime_bus');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_STUDENTS') setStudents(payload);
      if (type === 'SYNC_ATTENDANCE') setAttendance(payload);
      if (type === 'SYNC_GRADES') setGrades(payload);
      if (type === 'SYNC_ASSIGNMENTS') setAssignments(payload);
      if (type === 'SYNC_SUBMISSIONS') setSubmissions(payload);
      if (type === 'SYNC_NOTIFICATIONS') setNotifications(payload);
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastUpdate = useCallback((type: string, payload: unknown) => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        const channel = new BroadcastChannel('edusmk_realtime_bus');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (err) {
        console.warn('Broadcast channel issue:', err);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConn = async () => {
      if (supabaseConfig.url && supabaseConfig.anonKey) {
        const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
        setSupabaseConfig(prev => ({ ...prev, isConnected: res.success }));
      }
    };
    checkConn();
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  // Update Supabase credentials
  const updateSupabaseCredentials = async (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    const result = await testSupabaseConnection(url, key);
    setSupabaseConfig({
      url,
      anonKey: key,
      isConnected: result.success,
      tableCount: 8,
      lastSyncTime: new Date().toLocaleTimeString('id-ID'),
    });
    return result;
  };

  // Active Context derivations
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === activeClassId) || classes[0];
  }, [classes, activeClassId]);

  const currentClassStudents = useMemo(() => {
    return students.filter(s => s.classId === activeClassId);
  }, [students, activeClassId]);

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Attendance Actions
  const setStudentAttendance = useCallback((studentId: string, date: string, status: AttendanceStatus, note?: string) => {
    const now = new Date();
    const timeRecorded = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setAttendance(prev => {
      const existingIndex = prev.findIndex(r => r.studentId === studentId && r.date === date);
      let updated: AttendanceRecord[];

      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          note: note !== undefined ? note : updated[existingIndex].note,
          timeRecorded,
          syncedWithParent: false,
        };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          classId: activeClassId,
          date,
          status,
          note,
          timeRecorded,
          recordedBy: activeClass.homeroomTeacher,
          syncedWithParent: false,
        };
        updated = [newRecord, ...prev];
      }
      broadcastUpdate('SYNC_ATTENDANCE', updated);
      return updated;
    });

    // Realtime Supabase sync attempt
    const client = getSupabaseClient();
    if (client) {
      client.from('attendance').upsert({
        student_id: studentId,
        class_id: activeClassId,
        date,
        status,
        note,
        time_recorded: timeRecorded,
        recorded_by: activeClass.homeroomTeacher,
      }).then(({ error }) => {
        if (error) console.warn('Supabase attendance sync error:', error);
      });
    }
  }, [activeClassId, activeClass.homeroomTeacher, broadcastUpdate]);

  const markAllPresent = useCallback((date: string) => {
    const now = new Date();
    const timeRecorded = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setAttendance(prev => {
      const recordsMap = new Map(prev.map(r => [`${r.studentId}_${r.date}`, r]));
      
      currentClassStudents.forEach(st => {
        const key = `${st.id}_${date}`;
        recordsMap.set(key, {
          id: recordsMap.get(key)?.id || `att_${Date.now()}_${st.id}`,
          studentId: st.id,
          classId: activeClassId,
          date,
          status: 'Hadir',
          note: 'Hadir tepat waktu',
          timeRecorded,
          recordedBy: activeClass.homeroomTeacher,
          syncedWithParent: true,
        });
      });

      const updated = Array.from(recordsMap.values());
      broadcastUpdate('SYNC_ATTENDANCE', updated);
      return updated;
    });
  }, [currentClassStudents, activeClassId, activeClass.homeroomTeacher, broadcastUpdate]);

  const getDailyAttendanceStats = useCallback((date: string) => {
    const dayRecords = attendance.filter(a => a.classId === activeClassId && a.date === date);
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    currentClassStudents.forEach(st => {
      const rec = dayRecords.find(r => r.studentId === st.id);
      if (!rec || rec.status === 'Hadir') hadir++;
      else if (rec.status === 'Sakit') sakit++;
      else if (rec.status === 'Izin') izin++;
      else if (rec.status === 'Alpa') alpa++;
    });

    const total = currentClassStudents.length || 1;
    const rate = Math.round((hadir / total) * 100);

    return { hadir, sakit, izin, alpa, total, rate };
  }, [attendance, activeClassId, currentClassStudents]);

  const getStudentAttendanceStats = useCallback((studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId);
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    studentRecords.forEach(rec => {
      if (rec.status === 'Hadir') hadir++;
      else if (rec.status === 'Sakit') sakit++;
      else if (rec.status === 'Izin') izin++;
      else if (rec.status === 'Alpa') alpa++;
    });

    const total = studentRecords.length || 1;
    const percentage = Math.round((hadir / total) * 100);

    return { hadir, sakit, izin, alpa, total, percentage };
  }, [attendance]);

  // Grade Actions
  const updateGradeScore = useCallback((
    studentId: string, 
    competencyCode: string, 
    assessmentType: AssessmentType, 
    score: number, 
    feedback?: string
  ) => {
    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === studentId && g.competencyCode === competencyCode && g.assessmentType === assessmentType);
      let updated: GradeItem[];

      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          score: Math.min(100, Math.max(0, score)),
          feedback: feedback !== undefined ? feedback : updated[idx].feedback,
          dateRecorded: getTodayDateString(),
        };
      } else {
        const newItem: GradeItem = {
          id: `grd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          classId: activeClassId,
          assessmentType,
          competencyCode,
          score: Math.min(100, Math.max(0, score)),
          maxScore: 100,
          dateRecorded: getTodayDateString(),
          feedback,
        };
        updated = [newItem, ...prev];
      }
      broadcastUpdate('SYNC_GRADES', updated);
      return updated;
    });

    // Realtime Supabase sync
    const client = getSupabaseClient();
    if (client) {
      client.from('grades').upsert({
        student_id: studentId,
        class_id: activeClassId,
        assessment_type: assessmentType,
        competency_code: competencyCode,
        score,
        max_score: 100,
        date_recorded: getTodayDateString(),
        feedback,
      }).then(({ error }) => {
        if (error) console.warn('Supabase grade sync error:', error);
      });
    }
  }, [activeClassId, broadcastUpdate]);

  const calculateStudentGrade = useCallback((studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) {
      return {
        finalScore: 0,
        predicate: 'D' as const,
        predicateLabel: 'Perlu Bimbingan',
        isPassing: false,
        formatifAvg: 0,
        praktikAvg: 0,
        proyekAvg: 0,
        utsScore: 0,
        status: 'Perlu Remedial' as const,
      };
    }

    const formatifs = studentGrades.filter(g => g.assessmentType.startsWith('formatif'));
    const praktiks = studentGrades.filter(g => g.assessmentType === 'praktik_lab');
    const proyeks = studentGrades.filter(g => g.assessmentType === 'proyek_pbl');
    const utss = studentGrades.filter(g => g.assessmentType === 'uts_tengah_semester');

    const formatifAvg = formatifs.length ? Math.round(formatifs.reduce((acc, c) => acc + c.score, 0) / formatifs.length) : 75;
    const praktikAvg = praktiks.length ? Math.round(praktiks.reduce((acc, c) => acc + c.score, 0) / praktiks.length) : 75;
    const proyekAvg = proyeks.length ? Math.round(proyeks.reduce((acc, c) => acc + c.score, 0) / proyeks.length) : 75;
    const utsScore = utss.length ? Math.round(utss[0].score) : 75;

    // Bobot SMK Standar Kurikulum Merdeka Kejuruan:
    // Formatif: 20%, Praktik Lab: 30%, Proyek PBL: 30%, Sumatif UTS/UAS: 20%
    const finalScore = Math.round(
      (formatifAvg * 0.2) + 
      (praktikAvg * 0.3) + 
      (proyekAvg * 0.3) + 
      (utsScore * 0.2)
    );

    const kktp = activeClass.kktp || 75;
    const isPassing = finalScore >= kktp;

    let predicate: 'A' | 'B' | 'C' | 'D' = 'D';
    let predicateLabel = 'Perlu Bimbingan Khusus';

    if (finalScore >= 90) {
      predicate = 'A';
      predicateLabel = 'Sangat Kompeten';
    } else if (finalScore >= 80) {
      predicate = 'B';
      predicateLabel = 'Kompeten';
    } else if (finalScore >= kktp) {
      predicate = 'C';
      predicateLabel = 'Cukup Kompeten';
    } else {
      predicate = 'D';
      predicateLabel = 'Belum Kompeten (Remedial)';
    }

    return {
      finalScore,
      predicate,
      predicateLabel,
      isPassing,
      formatifAvg,
      praktikAvg,
      proyekAvg,
      utsScore,
      status: isPassing ? ('Tuntas' as const) : ('Perlu Remedial' as const),
    };
  }, [grades, activeClass.kktp]);

  // Assignment Actions
  const createAssignment = useCallback((data: Omit<Assignment, 'id' | 'createdAt' | 'totalSubmissions'>) => {
    const newAsg: Assignment = {
      ...data,
      id: `asg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSubmissions: 0,
    };

    setAssignments(prev => {
      const updated = [newAsg, ...prev];
      broadcastUpdate('SYNC_ASSIGNMENTS', updated);
      return updated;
    });
  }, [broadcastUpdate]);

  const submitAssignment = useCallback((
    assignmentId: string, 
    studentId: string, 
    data: { repoUrl?: string; fileUrl?: string; notes?: string }
  ) => {
    setSubmissions(prev => {
      const existing = prev.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
      let updated: Submission[];

      if (existing) {
        updated = prev.map(s => (s.id === existing.id ? {
          ...s,
          repoUrl: data.repoUrl || s.repoUrl,
          fileUrl: data.fileUrl || s.fileUrl,
          studentNotes: data.notes || s.studentNotes,
          submittedAt: new Date().toISOString(),
          status: 'Diserahkan' as const,
        } : s));
      } else {
        const newSub: Submission = {
          id: `sub_${Date.now()}`,
          assignmentId,
          studentId,
          submittedAt: new Date().toISOString(),
          status: 'Diserahkan',
          repoUrl: data.repoUrl,
          fileUrl: data.fileUrl,
          studentNotes: data.notes,
        };
        updated = [newSub, ...prev];
      }

      broadcastUpdate('SYNC_SUBMISSIONS', updated);
      return updated;
    });

    // Update assignment counter
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, totalSubmissions: a.totalSubmissions + 1 } : a));
  }, [broadcastUpdate]);

  const gradeSubmission = useCallback((submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev => {
      const updated = prev.map(s => s.id === submissionId ? {
        ...s,
        score,
        teacherFeedback: feedback,
        status: 'Dinilai' as const,
      } : s);
      broadcastUpdate('SYNC_SUBMISSIONS', updated);
      return updated;
    });
  }, [broadcastUpdate]);

  // Materials
  const addMaterial = useCallback((data: Omit<Material, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const newMat: Material = {
      ...data,
      id: `mat_${Date.now()}`,
      uploadedAt: getTodayDateString(),
      downloadCount: 0,
    };
    setMaterials(prev => [newMat, ...prev]);
  }, []);

  const incrementDownload = useCallback((materialId: string) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, downloadCount: m.downloadCount + 1 } : m));
  }, []);

  // Parent WhatsApp Link Generator
  const generateWhatsAppLink = useCallback((phone: string, text: string) => {
    // Clean phone number to international format: 0812 -> 62812
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`;
  }, []);

  // Send Parent Notification
  const sendParentNotification = useCallback((
    studentId: string, 
    category: NotificationLog['category'], 
    customMessage?: string, 
    channel: 'WhatsApp' | 'Email' = 'WhatsApp'
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false };

    let message = customMessage;
    const today = getTodayDateString();

    if (!message) {
      if (category === 'Absensi') {
        const studentAtt = attendance.find(a => a.studentId === studentId && a.date === today);
        const status = studentAtt?.status || 'Belum Presensi';
        message = `*LAPORAN PRESENSI SMKLAMBANAN*\n\nYth. Bapak/Ibu *${student.parentName}*,\n\nKami menginformasikan bahwa ananda:\n• Nama: *${student.name}*\n• Kelas: *${activeClass.name}*\n• Tanggal: *${today}*\n• Status Kehadiran: *${status}*${studentAtt?.note ? ` (${studentAtt.note})` : ''}\n\nMohon senantiasa mendampingi putra/putri untuk hadir tepat waktu.\n\nWali Kelas: *${activeClass.homeroomTeacher}*`;
      } else if (category === 'Perkembangan Nilai') {
        const gradeCalc = calculateStudentGrade(studentId);
        message = `*UPDATE PROGRES AKADEMIK SMKLAMBANAN*\n\nYth. Bapak/Ibu *${student.parentName}*,\n\nBerikut laporan kemajuan belajar ananda:\n• Nama: *${student.name}*\n• Mata Pelajaran: *${activeClass.subjectName}*\n• Predikat Capaian: *${gradeCalc.predicateLabel} (${gradeCalc.finalScore})*\n• Status KKTP: *${gradeCalc.status}*\n\nTerima kasih atas kerja sama Bapak/Ibu mendukung proses belajar ananda.\n\nSalam hormat,\n*${activeClass.homeroomTeacher}*`;
      } else {
        message = `Pemberitahuan Sekolah untuk Wali Murid dari ${student.name}.`;
      }
    }

    const newLog: NotificationLog = {
      id: `notif_${Date.now()}`,
      studentId,
      studentName: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      category,
      message,
      sentAt: new Date().toISOString(),
      status: 'Terkirim',
      channel,
    };

    setNotifications(prev => {
      const updated = [newLog, ...prev];
      broadcastUpdate('SYNC_NOTIFICATIONS', updated);
      return updated;
    });

    const waUrl = generateWhatsAppLink(student.parentPhone, message);
    return { success: true, url: waUrl };
  }, [students, attendance, activeClass, calculateStudentGrade, broadcastUpdate, generateWhatsAppLink]);

  // Student CRUD Operations
  const addStudent = useCallback((data: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...data,
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };

    setStudents(prev => {
      const updated = [...prev, newStudent];
      broadcastUpdate('SYNC_STUDENTS', updated);
      return updated;
    });

    // Supabase cloud sync if connected
    const client = getSupabaseClient();
    if (client) {
      client.from('students').insert({
        id: newStudent.id,
        nisn: newStudent.nisn,
        name: newStudent.name,
        gender: newStudent.gender,
        class_id: newStudent.classId,
        parent_name: newStudent.parentName,
        parent_phone: newStudent.parentPhone,
        parent_email: newStudent.parentEmail,
        avatar_url: newStudent.avatarUrl,
        status: newStudent.status,
      }).then(({ error }) => {
        if (error) console.warn('Supabase insert student error:', error);
      });
    }

    return newStudent;
  }, [broadcastUpdate]);

  const updateStudent = useCallback((studentId: string, data: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => (s.id === studentId ? { ...s, ...data } : s));
      broadcastUpdate('SYNC_STUDENTS', updated);
      return updated;
    });

    // Supabase cloud sync if connected
    const client = getSupabaseClient();
    if (client) {
      client.from('students').update({
        nisn: data.nisn,
        name: data.name,
        gender: data.gender,
        class_id: data.classId,
        parent_name: data.parentName,
        parent_phone: data.parentPhone,
        parent_email: data.parentEmail,
        avatar_url: data.avatarUrl,
        status: data.status,
      }).eq('id', studentId).then(({ error }) => {
        if (error) console.warn('Supabase update student error:', error);
      });
    }
  }, [broadcastUpdate]);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      broadcastUpdate('SYNC_STUDENTS', updated);
      return updated;
    });

    // Clean up related records
    setAttendance(prev => prev.filter(a => a.studentId !== studentId));
    setGrades(prev => prev.filter(g => g.studentId !== studentId));
    setSubmissions(prev => prev.filter(s => s.studentId !== studentId));

    // If active student is deleted, point to remaining student
    setActiveStudentId(prevId => {
      if (prevId === studentId) {
        const remaining = students.filter(s => s.id !== studentId);
        return remaining.length > 0 ? remaining[0].id : '';
      }
      return prevId;
    });

    // Supabase cloud sync if connected
    const client = getSupabaseClient();
    if (client) {
      client.from('students').delete().eq('id', studentId).then(({ error }) => {
        if (error) console.warn('Supabase delete student error:', error);
      });
    }
  }, [students, broadcastUpdate]);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeClassId,
        setActiveClassId,
        activeClass,
        activeStudentId,
        setActiveStudentId,
        activeStudent,
        isDarkMode,
        setIsDarkMode,
        classes,
        students,
        currentClassStudents,
        attendance,
        grades,
        assignments,
        submissions,
        materials,
        notifications,
        teachingMetrics,
        setStudentAttendance,
        markAllPresent,
        getDailyAttendanceStats,
        getStudentAttendanceStats,
        updateGradeScore,
        calculateStudentGrade,
        createAssignment,
        submitAssignment,
        gradeSubmission,
        addMaterial,
        incrementDownload,
        sendParentNotification,
        generateWhatsAppLink,
        addStudent,
        updateStudent,
        deleteStudent,
        studentToEdit,
        setStudentToEdit,
        isStudentModalOpen,
        setIsStudentModalOpen,
        studentToDelete,
        setStudentToDelete,
        supabaseConfig,
        updateSupabaseCredentials,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        selectedStudentForReport,
        setSelectedStudentForReport,
        selectedStudentForWhatsApp,
        setSelectedStudentForWhatsApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
