'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Download } from 'lucide-react';

interface UserUploadFile {
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
  uploadedBy: 'user';
  createdAt: string;
}

export default function UserUploadsPage() {
  const [uploads, setUploads] = useState<UserUploadFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Status states
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/uploads');
      if (res.ok) {
        const data = await res.json();
        setUploads(data.uploads || []);
      }
    } catch (error) {
      console.error('Failed to fetch uploads', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !department || !semester || !file) {
      setErrorMsg('Please fill in all required fields and choose a file.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('department', department);
      formData.append('semester', semester);
      formData.append('description', description);
      formData.append('file', file);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Material submitted successfully! It will appear here once approved by the admin.');
        // Reset form
        setTitle('');
        setSubject('');
        setDescription('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setErrorMsg(data.message || 'Failed to upload study material.');
      }
    } catch (error: any) {
      setErrorMsg('Network error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string) => {
    window.open(`/api/download/user_uploads/${fileId}`, '_blank');
    setUploads((prev) =>
      prev.map((f) => (f._id === fileId ? { ...f, downloads: f.downloads + 1 } : f))
    );
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Uploads</h1>
        <p className="mt-2 text-sm text-gray-600">
          Share study materials. Uploads must be approved by the administrator before showing on home page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: List of Approved Uploads */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Approved Student Uploads</h2>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : uploads.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No student uploads yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to contribute by filling out the upload form!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {uploads.map((file) => (
                <div
                  key={file._id}
                  className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow transition-shadow duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {file.department}
                      </span>
                      <span>{file.semester}</span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-gray-900 line-clamp-1" title={file.title}>
                      {file.title}
                    </h3>
                    <p className="text-xs text-gray-500">Subject: {file.subject}</p>

                    {file.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{file.description}</p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {formatBytes(file.fileSize)} &bull; {file.downloads} downloads
                    </span>

                    <button
                      onClick={() => handleDownload(file._id)}
                      className="flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upload Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Material</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start gap-2 border border-emerald-100">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lecture Notes on Databases"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. DBMS"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of this study material..."
                rows={3}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Choose File *
              </label>
              <input
                type="file"
                required
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="mt-1 text-[10px] text-gray-400">PDF, Word, Images, Zip files supported.</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus:outline-none disabled:bg-gray-400 transition-colors"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <span>Upload Material</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
