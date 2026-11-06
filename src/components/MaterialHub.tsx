import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Video, 
  Layers, 
  Download, 
  Plus, 
  Search,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Material } from '../types';

export const MaterialHub: React.FC = () => {
  const { 
    activeClass, 
    materials, 
    addMaterial, 
    incrementDownload, 
    currentRole 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New material form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Material['category']>('Modul Ajar');
  const [newFormat, setNewFormat] = useState<Material['format']>('PDF');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredMaterials = materials.filter(m => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMaterial({
      classId: activeClass.id,
      title: newTitle,
      category: newCategory,
      format: newFormat,
      fileSize: '3.5 MB',
      url: newUrl || 'https://smkn1.sch.id/modul/materi-baru.pdf',
      description: newDesc,
    });

    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
  };

  const getFormatIcon = (format: string) => {
    if (format === 'MP4') return <Video className="w-5 h-5 text-rose-500" />;
    if (format === 'DOCX') return <Layers className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Repositori Belajar SMK</span>
            <span aria-hidden="true">·</span>
            <span>{activeClass.name} ({activeClass.subjectName})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pusat Materi Pembelajaran & Jobsheet
          </h1>
        </div>

        {currentRole === 'guru' && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Unggah Materi Baru
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        
        <div className="flex flex-wrap items-center gap-1">
          {['all', 'Modul Ajar', 'Jobsheet Praktikum', 'Video Tutorial', 'Presentasi Slides'].map((cat) => {
            const label = cat === 'all' ? 'Semua Materi' : cat;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari modul atau jobsheet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Belum ada materi pembelajaran pada kategori ini.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getFormatIcon(mat.format)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {mat.fileSize}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>{mat.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{mat.uploadedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {mat.description}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Diunduh {mat.downloadCount} kali
                </span>

                <a
                  href={mat.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => incrementDownload(mat.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Akses Materi</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Unggah Modul / Jobsheet Baru
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Materi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jobsheet 05: Setup Docker Container di VPS SMK"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Material['category'])}
                    className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Modul Ajar">Modul Ajar</option>
                    <option value="Jobsheet Praktikum">Jobsheet Praktikum</option>
                    <option value="Video Tutorial">Video Tutorial</option>
                    <option value="Presentasi Slides">Presentasi Slides</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Format File:
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as Material['format'])}
                    className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PDF">PDF Dokumen</option>
                    <option value="DOCX">DOCX / PPTX</option>
                    <option value="MP4">MP4 Video</option>
                    <option value="ZIP">ZIP Source Code</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Tautan File (Google Drive / YouTube / Cloud Storage):
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Ringkasan Isi Materi:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan tujuan pembelajaran dan cakupan kompetensi materi ini..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Simpan & Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
