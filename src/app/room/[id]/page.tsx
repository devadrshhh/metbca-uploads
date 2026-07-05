'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';

interface RoomDetails {
  room: {
    _id: string;
    name: string;
    description?: string;
    author?: string;
    createdAt: string;
  };
  files: Array<{
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
    category: 'admin' | 'user';
    createdAt: string;
  }>;
}

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [data, setData] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Status states
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rooms/${roomId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setErrorMsg('Failed to load room details.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An error occurred while loading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('department', department);
      formData.append('semester', semester);
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('roomId', roomId);
      formData.append('file', file);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setTitle('');
        setDepartment('');
        setSemester('Semester 1');
        setSubject('');
        setDescription('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        setSuccessMsg('File uploaded successfully!');
        setIsUploadModalOpen(false);
        fetchRoomDetails();
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.message || 'Upload failed.');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Room Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">The study room you are looking for does not exist.</p>
        <Link href="/room" className="mt-4 inline-flex items-center text-sm font-semibold text-black uppercase tracking-wider hover:underline">
          &larr; Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/room" className="inline-flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-black mb-2">
            &larr; Back to Rooms
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.room.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            {data.room.author && (
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-gray-700">
                Created by: {data.room.author}
              </span>
            )}
            {data.room.description && (
              <p className="text-sm text-gray-500">{data.room.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setIsUploadModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors whitespace-nowrap self-start sm:self-center"
        >
          Upload Material
        </button>
      </div>

      {/* Files List (Full Width) */}
      <div className="w-full">
        {data.files.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No files yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a study file to share it in this room.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.files.map((file) => (
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
                    <div>Uploaded: {formatDate(file.createdAt)}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={`/api/download/${file.category === 'admin' ? 'files' : 'user_uploads'}/${file._id}`}
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload to this Room</h2>

            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-2.5 text-xs font-medium text-red-800">
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
                  placeholder="e.g. Unit 1 Notes"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
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
                  placeholder="e.g. PHP Programming"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Dept *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. BCA"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Semester *
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
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
                  placeholder="Additional details..."
                  rows={2}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white resize-none"
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
