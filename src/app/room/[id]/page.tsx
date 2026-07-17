import type { Metadata } from 'next';
import React, { use } from 'react';
import RoomDetailClient from '@/components/RoomDetailClient';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    await dbConnect();
    const room = await Room.findById(id).lean() as any;
    if (!room) {
      return {
        title: 'Study Room Not Found - HeyBCA',
        description: 'The requested collaborative study room was not found on HeyBCA.',
      };
    }
    return {
      title: `${room.name} - HeyBCA Study Room`,
      description: `Access and share files, notes, previous year question papers (PYQs), and study resources for ${room.name} in this collaborative room on HeyBCA.`,
      alternates: {
        canonical: `https://heybca.vercel.app/room/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Collaborative Study Room - HeyBCA',
      description: 'Collaborate and share study materials in real-time with students on HeyBCA.',
    };
  }
}

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  return <RoomDetailClient roomId={roomId} />;
}
