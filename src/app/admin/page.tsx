'use client';

import { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Database, 
  Download, 
  FileText, 
  UploadCloud, 
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';

interface FileDoc {
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

interface Stats {
  adminFilesCount: number;
  approvedUserUploadsCount: number;
  pendingUserUploadsCount: number;
  totalDownloads: number;
  storageBytes: number;
  storageFormatted: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminFiles, setAdminFiles] = useState<FileDoc[]>([]);
  const [userUploads, setUserUploads] = useState<FileDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Tab state: 'manage' | 'pending' | 'upload'
  const [activeTab, setActiveTab] = useState<'manage' | 'pending' | 'upload'>('manage');

  // Direct Upload Form states
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadDept, setUploadDept] = useState('');
  const [uploadSem, setUploadSem] = useState('Semester 1');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Editing modal state
  const [editingFile, setEditingFile] = useState<FileDoc | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editSem, setEditSem] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFileReplace, setEditFileReplace] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch Stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Files
      const filesRes = await fetch(`/api/admin/files?search=${encodeURIComponent(searchQuery)}`);
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setAdminFiles(filesData.adminFiles || []);
        setUserUploads(filesData.userUploads || []);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Re-fetch files when search query changes
  useEffect(() => {
    if (isAuthenticated) {
      const delayDebounce = setTimeout(() => {
        fetchDashboardData();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword) return;

    try {
      setLoginLoading(true);
      setLoginError('');
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setLoginPassword('');
        fetchDashboardData();
      } else {
        setLoginError(data.message || 'Invalid password');
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setAdminFiles([]);
      setUserUploads([]);
      setStats(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadSubject || !uploadDept || !uploadSem || !uploadFile) {
      setUploadError('Please fill in all required fields and select a file.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');

      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('subject', uploadSubject);
      formData.append('department', uploadDept);
      formData.append('semester', uploadSem);
      formData.append('description', uploadDesc);
      formData.append('file', uploadFile);

      const res = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess('File uploaded successfully as Admin.');
        setUploadTitle('');
        setUploadSubject('');
        setUploadDesc('');
        setUploadFile(null);
        fetchDashboardData();
      } else {
        setUploadError(data.message || 'Upload failed.');
      }
    } catch (err: any) {
      setUploadError('Error uploading: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/files/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to approve file.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject and permanently delete this user upload?')) return;
    try {
      const res = await fetch(`/api/admin/files/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to reject file.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this file? This will remove it from MongoDB and Cloudinary.')) return;
    try {
      const res = await fetch(`/api/admin/files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to delete file.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (file: FileDoc) => {
    setEditingFile(file);
    setEditTitle(file.title);
    setEditSubject(file.subject);
    setEditDept(file.department);
    setEditSem(file.semester);
    setEditDesc(file.description || '');
    setEditFileReplace(null);
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;

    try {
      setEditLoading(true);
      setEditError('');

      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('subject', editSubject);
      formData.append('department', editDept);
      formData.append('semester', editSem);
      formData.append('description', editDesc);
      if (editFileReplace) {
        formData.append('file', editFileReplace);
      }

      const res = await fetch(`/api/admin/files/${editingFile._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        setEditingFile(null);
        fetchDashboardData();
      } else {
        const data = await res.json();
        setEditError(data.message || 'Failed to update file.');
      }
    } catch (err: any) {
      setEditError('Error: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
              Admin Portal
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              Enter the administrator password to manage resources.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Administrator Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus:outline-none disabled:bg-gray-400 transition-colors"
            >
              {loginLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              Note: If running for the first time, hit <a href="/api/admin/seed" target="_blank" className="underline font-semibold hover:text-black">/api/admin/seed</a> in your browser to seed default credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  const pendingQueue = userUploads.filter((f) => !f.approved);
  const approvedQueue = [...adminFiles, ...userUploads.filter((f) => f.approved)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Manage database files, review student uploads, and view statistics.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors self-start sm:self-center"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Admin Files</span>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <span className="mt-2 block text-3xl font-semibold text-gray-900">{stats.adminFilesCount}</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Student Approved</span>
              <UploadCloud className="h-5 w-5 text-gray-400" />
            </div>
            <span className="mt-2 block text-3xl font-semibold text-gray-900">{stats.approvedUserUploadsCount}</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Pending Approvals</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stats.pendingUserUploadsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                {stats.pendingUserUploadsCount} Active
              </span>
            </div>
            <span className="mt-2 block text-3xl font-semibold text-gray-900">{stats.pendingUserUploadsCount}</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Downloads</span>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            <span className="mt-2 block text-3xl font-semibold text-gray-900">{stats.totalDownloads}</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-gray-200 bg-neutral-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neutral-800 rounded-md">
                <Database className="h-6 w-6 text-neutral-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Storage Usage Summary</h3>
                <p className="text-xs text-neutral-400">Total size of files stored on Cloudinary & tracked in database.</p>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-2xl font-bold tracking-tight">{stats.storageFormatted}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'manage' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          All Approved Files ({approvedQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all relative ${
            activeTab === 'pending' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Pending Approvals ({pendingQueue.length})
          {pendingQueue.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {pendingQueue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'upload' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'manage' && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Search Table */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search approved files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full max-w-md rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-black"
              />
            </div>
          </div>

          {loadingData ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : approvedQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No approved study materials found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">File Title</th>
                    <th className="px-6 py-3">Subject / Dept</th>
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Downloads</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {approvedQueue.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5">
                          <span className="line-clamp-1">{file.title}</span>
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div>{file.subject}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{file.department}</div>
                      </td>
                      <td className="px-6 py-4">{file.semester}</td>
                      <td className="px-6 py-4 font-semibold text-gray-950">{file.downloads} DLs</td>
                      <td className="px-6 py-4">{formatBytes(file.fileSize)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${file.uploadedBy === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
                          {file.uploadedBy.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(file)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
                            title="Edit / Replace File"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          {loadingData ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No pending student uploads needing review.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">File Title</th>
                    <th className="px-6 py-3">Subject / Dept</th>
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pendingQueue.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 font-bold">
                          {file.title}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div>{file.subject}</div>
                        <div className="text-[10px] text-gray-400">{file.department}</div>
                      </td>
                      <td className="px-6 py-4">{file.semester}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{file.description || 'No description'}</td>
                      <td className="px-6 py-4">{formatBytes(file.fileSize)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(file._id)}
                            className="flex items-center gap-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(file._id)}
                            className="flex items-center gap-1 rounded bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Upload study material as Administrator</h2>

          <form onSubmit={handleDirectUpload} className="space-y-4">
            {uploadSuccess && (
              <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-100">
                {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
                {uploadError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Algorithms Lecture Slides"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="e.g. Design & Analysis of Algorithms"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={uploadDept}
                  onChange={(e) => setUploadDept(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Semester *
                </label>
                <select
                  value={uploadSem}
                  onChange={(e) => setUploadSem(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black bg-white"
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
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Describe the content of this file..."
                rows={3}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Attach File *
              </label>
              <input
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:bg-gray-400 transition-colors"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Uploading to cloud...</span>
                </>
              ) : (
                <span>Upload and Approve</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Edit / Replace Study Material</h3>
              <button
                onClick={() => setEditingFile(null)}
                className="rounded-md p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="rounded bg-rose-50 p-2 text-xs text-rose-800 border border-rose-100">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="block w-full rounded border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="block w-full rounded border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Semester *
                  </label>
                  <select
                    value={editSem}
                    onChange={(e) => setEditSem(e.target.value)}
                    className="block w-full rounded border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
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
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="block w-full rounded border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-black resize-none"
                />
              </div>

              <div className="rounded-md border border-amber-100 bg-amber-50/50 p-3">
                <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Replace File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditFileReplace(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
                />
                <p className="mt-1 text-[9px] text-amber-700">Select a file if you want to replace the current attachment in Cloudinary.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="rounded border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-1 rounded bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:bg-gray-400"
                >
                  {editLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
