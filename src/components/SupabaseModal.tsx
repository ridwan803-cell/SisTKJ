import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateSupabaseSchemaSql } from '../lib/supabase';
import { 
  X, 
  Database, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  ShieldCheck,
  Server
} from 'lucide-react';

export const SupabaseModal: React.FC = () => {
  const { 
    isSupabaseModalOpen, 
    setIsSupabaseModalOpen, 
    supabaseConfig, 
    updateSupabaseCredentials 
  } = useApp();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [key, setKey] = useState(supabaseConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'vercel'>('config');

  if (!isSupabaseModalOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await updateSupabaseCredentials(url, key);
    setTesting(false);
    setTestResult(res);
  };

  const handleCopySql = () => {
    const sql = generateSupabaseSchemaSql();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Integrasi Database Supabase & Vercel
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sinkronisasi data absensi & nilai real-time multi-perangkat
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'config'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            1. Konfigurasi Kunci API
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'sql'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            2. Skrip SQL Schema Supabase
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'vercel'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            3. Panduan Deploy Vercel
          </button>
        </div>

        {/* Tab 1: Configuration Form */}
        {activeTab === 'config' && (
          <form onSubmit={handleTestConnection} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Status Database Saat Ini:
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {supabaseConfig.isConnected 
                    ? 'Terhubung langsung ke Supabase Cloud Database' 
                    : 'Mode Offline Aktif (Tersimpan di LocalStorage & Broadcast Sync)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-semibold">{supabaseConfig.isConnected ? 'Online' : 'Lokal Siap'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Supabase Project URL:
              </label>
              <input
                type="text"
                placeholder="https://xyzprojectid.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Supabase Anon / Public Key:
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full text-xs font-mono py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {testResult.success ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <X className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Buka Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {testing ? 'Menguji Koneksi...' : 'Simpan & Tes Koneksi'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Schema Generator */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <p>
                Salin skrip SQL ini lalu jalankan di <strong>Supabase SQL Editor</strong> untuk membuat seluruh tabel dan mengaktifkan publikasi real-time.
              </p>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 ml-2"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto bg-slate-950 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed border border-slate-800">
              <pre>{generateSupabaseSchemaSql()}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: Vercel Deployment Checklist */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                Aplikasi ini dikembangkan dengan Vite & React 19 serta kompatibel 100% untuk di-hosting di <strong>Vercel</strong> tanpa konfigurasi server yang rumit.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Langkah 1: Upload Repositori ke GitHub
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Inisialisasi git repositori Anda dan dorong (push) kode sumber aplikasi ini ke GitHub.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Langkah 2: Hubungkan ke Vercel App
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Buka vercel.com/new, pilih repositori proyek Anda, dan Vercel akan otomatis mengenali framework <strong>Vite</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Langkah 3: Konfigurasi Environment Variables di Vercel
                </span>
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Pada menu <em>Environment Variables</em> di dashboard Vercel, masukkan variabel:
                </p>
                <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded font-mono text-[11px] space-y-0.5">
                  <div>VITE_SUPABASE_URL = [URL_PROYEK_SUPABASE_ANDA]</div>
                  <div>VITE_SUPABASE_ANON_KEY = [ANON_KEY_SUPABASE_ANDA]</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Langkah 4: Deploy & Jalankan
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Klik tombol <strong>Deploy</strong>. Vercel akan mengkompilasi file statis (`npm run build`) dan aplikasi langsung aktif dengan sertifikat SSL gratis!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
