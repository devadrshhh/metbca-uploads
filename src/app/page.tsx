'use client';

import { useState, useEffect } from 'react';
import { Search, Download, FileText, RefreshCw } from 'lucide-react';

interface StudyFile {
  _id: string;
  title: string;
  description?: string;
  department: string;
  semester: string;
  subject: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  approved: boolean;
  uploadedBy: 'admin' | 'user';
  createdAt: string;
}

export default function HomePage() {
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') {
      return <div className="text-xs font-semibold tracking-wider px-2 py-1 bg-rose-50 text-rose-600 rounded">PDF</div>;
    }
    if (['doc', 'docx'].includes(type)) {
      return <div className="text-xs font-semibold tracking-wider px-2 py-1 bg-blue-50 text-blue-600 rounded">DOC</div>;
    }
    if (['zip', 'rar'].includes(type)) {
      return <div className="text-xs font-semibold tracking-wider px-2 py-1 bg-amber-50 text-amber-600 rounded">ZIP</div>;
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return <div className="text-xs font-semibold tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded">IMG</div>;
    }
    return <div className="text-xs font-semibold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">{type.toUpperCase()}</div>;
  };

  // Get unique departments & semesters for filter dropdowns
  const departments = Array.from(new Set(files.map((f) => f.department))).filter(Boolean);
  const semesters = Array.from(new Set(files.map((f) => f.semester))).filter(Boolean);

  // Filter logic
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(search.toLowerCase()) ||
      file.subject.toLowerCase().includes(search.toLowerCase()) ||
      file.department.toLowerCase().includes(search.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept ? file.department === selectedDept : true;
    const matchesSem = selectedSem ? file.semester === selectedSem : true;

    return matchesSearch && matchesDept && matchesSem;
  });

  const handleDownload = (fileId: string, uploadedBy: 'admin' | 'user') => {
    const collection = uploadedBy === 'admin' ? 'files' : 'user_uploads';
    // Trigger download in new window/tab
    window.open(`/api/download/${collection}/${fileId}`, '_blank');
    // Optimistically increment downloads counter in state for better UX
    setFiles((prev) =>
      prev.map((f) => (f._id === fileId ? { ...f, downloads: f.downloads + 1 } : f))
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner / Hero */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Study Materials
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Search and download course materials, notes, and study resources.
        </p>
      </div>

      {/* Filters & Search Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search files by title, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Dept Filter */}
        <div className="relative">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-3 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div className="relative">
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-3 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Listings */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No materials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to upload materials or try refining your filters!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              className="flex flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                    {file.department}
                  </div>
                  {getFileIcon(file.fileType)}
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900 line-clamp-1" title={file.title}>
                  {file.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">Subject: {file.subject} &bull; {file.semester}</p>

                {file.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{file.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-400">
                  <span>Size: {formatBytes(file.fileSize)}</span>
                  <span>&bull;</span>
                  <span>Downloads: {file.downloads}</span>
                  <span>&bull;</span>
                  <span>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                <button
                  onClick={() => handleDownload(file._id, file.uploadedBy)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
