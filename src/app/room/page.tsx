'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  _id: string;
  name: string;
  description?: string;
  author?: string;
  fileCount: number;
  createdAt: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query)) ||
      (room.author && room.author.toLowerCase().includes(query))
    );
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      setErrorMsg('');

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, author }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setAuthor('');
        setIsModalOpen(false);
        fetchRooms();
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to create room.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
      {/* Top Header Section */}
      <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Study Rooms</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create collaborative spaces for different subjects or semesters and share materials with other students.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors whitespace-nowrap self-start sm:self-center"
        >
          Create Study Room
        </button>
      </div>

      {/* Rooms Grid */}
      <div>
        {/* Search bar */}
        <div className="mb-6 max-w-md relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search study rooms by name, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-black"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-white">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No rooms yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create a study room to start sharing files collaboratively.</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-white">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No rooms found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Link
                key={room._id}
                href={`/room/${room._id}`}
                className="block p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-black hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-black line-clamp-1">
                    {room.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {room.fileCount} {room.fileCount === 1 ? 'file' : 'files'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                  {room.description || 'No description provided.'}
                </p>

                {room.author && (
                  <div className="text-xs text-gray-400 mb-2 font-medium">
                    Created by: {room.author}
                  </div>
                )}

                <div className="flex items-center text-xs font-semibold text-black uppercase tracking-wider group-hover:underline">
                  Enter Room &rarr;
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl font-semibold outline-none"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Room</h2>

            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-2.5 text-xs font-medium text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. BCA 5th Sem - PHP Lab"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Author Name (Optional)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Prof. Kumar"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this study room for?"
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
