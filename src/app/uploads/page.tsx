'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface UserUploadFile {
  _id: string;
  title: string;
  description?: string;
  department: string;
  semester: string;
  subject: string;
  fileUrl: string;
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

  // Modal & Form states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

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

      if (res.ok) {
        setTitle('');
        setSubject('');
        setDepartment('');
        setSemester('Semester 1');
        setDescription('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        setSuccessMsg('Upload successful! Your file has been sent for admin approval.');
        setIsUploadModalOpen(false);
        fetchUploads();
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Upload failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Contributions</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse notes, links, and study materials uploaded by students.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setIsUploadModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors whitespace-nowrap self-start sm:self-center"
        >
          Contribute File
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-semibold text-green-800 border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Uploads List */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-white">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No approved student uploads yet</h3>
            <p className="mt-1 text-sm text-gray-500">Click "Contribute File" to upload the first study material.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map((file) => (
              <div
                key={file._id}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      {file.department}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {file.fileType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{file.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Subject: {file.subject} &bull; {file.semester}
                  </p>

                  {file.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 bg-gray-50 p-2 rounded">
                      {file.description}
                    </p>
                  )}

                  <div className="text-[10px] text-gray-400 mt-3 space-y-1">
                    <div>Size: {formatSize(file.fileSize)}</div>
                    <div>Downloads: {file.downloads}</div>
                    <div>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={`/api/download/user_uploads/${file._id}`}
                    className="w-full inline-flex items-center justify-center rounded bg-black py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors text-center"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl font-semibold outline-none"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contribute Study Material</h2>

            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-2.5 text-xs font-medium text-red-800 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chemistry Notes Unit 2"
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
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
                  placeholder="e.g. Engineering Chemistry"
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. BCA"
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Semester *
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell other students what this file contains..."
                  rows={2}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  File *
                </label>
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
